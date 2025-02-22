import apiClient from "@/utils/appClient";
import { useAuthContext } from "@/hooks/useAuthContext";
import { ZoomIn, ZoomOut, Pencil } from "lucide-react";
import IconComponent from "./icon-component";

import { Canvas, FabricImage } from "fabric";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";
import { useLogContext } from "@/hooks/useLogContext";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCommonProps } from "@/hooks/appStore/CommonProps";

type mapStateType = {
  scale: number;
  translation: { x: number; y: number };
};

type Props = {
  canvas: Canvas;
  image: FabricImage;
  canvasId: string;
  imageUrl: string;
  mapState: mapStateType;
  setMapState: (obj: mapStateType) => void;
  setLoadState: (val: boolean) => void;
};

const Footer = ({
  canvas,
  image,
  canvasId,
  imageUrl,
  mapState,
  setMapState,
  setLoadState,
}: Props) => {
  const { selectedObject, currentImageDim, loadedFromSaved } =
    useCanvasObjects();
  const { user } = useAuthContext();
  const { logs, addLog } = useLogContext();
  const { toast } = useToast();

  const [openDownloadOptions, setOpenDownloadOptions] = useState(false);
  const [downloadFrame, setDownLoadFrame] = useState(false);
  const [superResValue, setSuperResValue] = useState("none");

  const projectName = useCommonProps((state) => state.projectName);
  const setProjectName = useCommonProps((state) => state.setProjectName);
  const showUpdateButton = useCommonProps((state) => state.showUpdateButton);
  const setShowUpdateButton = useCommonProps(
    (state) => state.setShowUpdateButton
  );

  // Function to convert Blob to File
  const convertBlobToFile = (url) => {
    return new Promise((resolve, reject) => {
      // Fetch the blob from the URL
      fetch(url)
        .then((res) => res.blob())
        .then((blob) => {
          // Create a new File object using the Blob
          const file = new File([blob], "image.png", { type: "image/png" });
          resolve(file); // Resolve with the File object
        })
        .catch(reject); // Reject if any error occurs
    });
  };

  const onSaveCanvas = async () => {
    addLog({
      section: "canvas",
      tab: "canvas",
      event: "save",
      message: `Saving project`,
    });

    if (!canvas) return;
    setLoadState(true);
    try {
      if (!canvas || !image) return;

      let backgroundImage: null | FabricImage = null;
      if (canvas.backgroundImage) {
        // @ts-ignore
        backgroundImage = canvas.backgroundImage;
      }

      // current canvas and image dimentions (they are both always same)
      const originalImageWidth = image.width!;
      const originalImageHeight = image.height!;

      // required image width
      const {
        imageWidth: requiredImageWidth,
        imageHeight: requiredImageHeight,
      } = currentImageDim;

      const renderedImageWidth = image.scaleX! * originalImageWidth;
      const renderedImageHeight = image.scaleY! * originalImageHeight;

      // Calculate scaling factors
      const scaleX = requiredImageWidth / renderedImageWidth;
      const scaleY = requiredImageHeight / renderedImageHeight;

      // Scale the canvas to the original image size
      canvas.setDimensions({
        width: requiredImageWidth,
        height: requiredImageHeight,
      });

      // Apply scaling factors to all other objects
      canvas.getObjects().forEach((obj) => {
        obj.scaleX *= scaleX;
        obj.scaleY *= scaleY;
        obj.left *= scaleX;
        obj.top *= scaleY;
        obj.setCoords();
      });

      // scale background image if exist
      if (backgroundImage) {
        backgroundImage.scaleX *= scaleX;
        backgroundImage.scaleY *= scaleY;
      }

      // Get the image representation of the canvas
      const canvasDataUrl = canvas.toDataURL(); // Canvas as data URL

      // Restore the canvas and image to their previous dimensions

      canvas.setDimensions({
        width: renderedImageWidth,
        height: renderedImageHeight,
      });

      // Restore the scale and position of all other objects
      canvas.getObjects().forEach((obj) => {
        obj.scaleX /= scaleX;
        obj.scaleY /= scaleY;
        obj.left /= scaleX;
        obj.top /= scaleY;
        obj.setCoords();
      });

      // scale background image if exist
      if (backgroundImage) {
        backgroundImage.scaleX /= scaleX;
        backgroundImage.scaleY /= scaleY;
      }

      // json data
      const canvasJSON = canvas.toJSON();

      // Convert canvas image (Data URL) to a Blob and then to a File
      const canvasImageFile = await convertBlobToFile(canvasDataUrl);
      // Convert the image URL (blob URL) to a File object
      const originalImageFile = await convertBlobToFile(imageUrl);

      // Create FormData object and append the image and other canvas data
      const formData = new FormData();
      formData.append("canvasId", canvasId);
      formData.append("username", user?.username); // Append the oringalimage file
      formData.append("isPublic", "false"); // Append the oringalimage file
      formData.append("canvasData", JSON.stringify(canvasJSON)); // Add canvas data as a string
      formData.append("canvasLogs", JSON.stringify(logs)); // Append the oringalimage file
      formData.append(
        "originalImageShape",
        JSON.stringify({ width: image.width, height: image.height })
      );
      formData.append(
        "finalImageShape",
        JSON.stringify({
          width: requiredImageWidth,
          height: requiredImageHeight,
        })
      );
      formData.append(
        "renderedImageShape",
        JSON.stringify({
          width: renderedImageWidth,
          height: renderedImageHeight,
        })
      );
      formData.append(
        "imageScale",
        JSON.stringify({ scaleX: image.scaleX, scaleY: image.scaleY })
      );
      // @ts-ignore
      formData.append("originalImage", originalImageFile); // Append the oringalimage file
      // @ts-ignore
      formData.append("canvasImage", canvasImageFile); // Append the oringalimage
      formData.append("projectName", projectName);
      formData.append("loadedFromSaved", loadedFromSaved ? "true" : "false");

      // Post JSON data to the backend with JWT in headers
      const response = await apiClient.post("/save_project", formData, {
        headers: {
          Authorization: `Bearer ${user?.token}`, // Include 'Bearer'
        },
      });

      // localStorage.setItem("canvasId", canvasId);
      // localStorage.setItem(
      //   "project_data",
      //   JSON.stringify(response.data.data.project_data)
      // );

      setLoadState(false);

      if (response.status === 201) {
        console.log("canvas saved successfully");
        toast({
          description: "Canvas Successfully saved.",
          className: "bg-green-500 text-gray-900",
          duration: 2000,
        });
        // Restore the canvas and image to their previous dimensions
        setShowUpdateButton(true);
      } else if (response.status === 200) {
        toast({
          description: "Canvas Updated Successfully.",
          className: "bg-green-500 text-gray-900",
          duration: 2000,
        });
        console.log("updated canvas");
      } else {
        console.log("save failed");
        toast({
          variant: "destructive",
          description: "Save failed",
          className: "bg-red-500 text-gray-900",
          duration: 3000,
        });
      }

      // canvas.renderAll();
    } catch (error) {
      console.error("Error saving canvas:", error);
      toast({
        variant: "destructive",
        description: "Unexpected Error",
        className: "bg-green-500 text-gray-900",
        duration: 3000,
      });
    }
  };

  const downloadCanvas = async () => {
    addLog({
      section: "canvas",
      tab: "canvas",
      event: "download",
      message: `Downloading project`,
    });

    if (!canvas || !image) return;

    let dataURL: string;

    let backgroundImage: null | FabricImage = null;
    if (canvas.backgroundImage) {
      // @ts-ignore
      backgroundImage = canvas.backgroundImage;
    }

    // current canvas and image dimentions (they are both always same)
    const originalImageWidth = image.width!;
    const originalImageHeight = image.height!;

    // required image width
    const { imageWidth: requiredImageWidth, imageHeight: requiredImageHeight } =
      currentImageDim;

    const renderedImageWidth = image.scaleX! * originalImageWidth;
    const renderedImageHeight = image.scaleY! * originalImageHeight;

    // Calculate scaling factors
    const scaleX = requiredImageWidth / renderedImageWidth;
    const scaleY = requiredImageHeight / renderedImageHeight;

    // Scale the canvas to the original image size
    canvas.setDimensions({
      width: requiredImageWidth,
      height: requiredImageHeight,
    });

    // Apply scaling factors to all other objects
    canvas.getObjects().forEach((obj) => {
      obj.scaleX *= scaleX;
      obj.scaleY *= scaleY;
      obj.left *= scaleX;
      obj.top *= scaleY;
      obj.setCoords();
    });

    // scale background image if exist
    if (backgroundImage) {
      backgroundImage.scaleX *= scaleX;
      backgroundImage.scaleY *= scaleY;
    }

    canvas.renderAll();

    // Find the object named "Frame" or starting with "Frame"

    const frameObject = canvas
      .getObjects() // @ts-ignore
      .find((obj) => obj.name?.startsWith("Frame"));
    if (frameObject && downloadFrame) {
      const clipBoundingBox = frameObject.getBoundingRect();

      // Create a temporary canvas element using fabric's rendering
      const tempCanvas = canvas.toCanvasElement();

      const tempContext = tempCanvas.getContext("2d");
      if (!tempContext) return;

      // Create a new canvas for the clipped region
      const outputCanvas = document.createElement("canvas");
      const outputContext = outputCanvas.getContext("2d");

      if (!outputContext) return;

      // Set dimensions of the output canvas to match the clipBoundingBox
      outputCanvas.width = clipBoundingBox.width;
      outputCanvas.height = clipBoundingBox.height;

      // Draw the clipped region onto the output canvas
      outputContext.drawImage(
        tempCanvas, // Source canvas
        clipBoundingBox.left, // Source x
        clipBoundingBox.top, // Source y
        clipBoundingBox.width, // Source width
        clipBoundingBox.height, // Source height
        0, // Destination x
        0, // Destination y
        clipBoundingBox.width, // Destination width
        clipBoundingBox.height // Destination height
      );

      // Generate a data URL for the clipped image
      dataURL = outputCanvas.toDataURL();

      // Clean up output canvas
      outputCanvas.remove();

      // canvas.backgroundColor = "fff"
    } else {
      console.log("downloading full image");
      // Generate the data URL for the download
      dataURL = canvas.toDataURL();
    }

    if (superResValue !== "none") {
      try {
        setLoadState(true);
        const response = await apiClient.post(
          "/image_proc/super_res",
          { image: dataURL, resolution: superResValue },

          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );
        setLoadState(false);
        if (response.status === 200) {
          const base64Image = `data:image/png;base64,${response.data.image}`;
          const link = document.createElement("a");
          link.href = base64Image;
          link.download =
            frameObject && downloadFrame
              ? "clipped-image.png"
              : "canvas-image.png";
          link.click();

          toast({
            description: "Successfull",
            className: "bg-green-500 text-gray-900",
            duration: 3000,
          });
        } else {
          toast({
            variant: "destructive",
            description: "Error Encountered inference",
            className: "bg-green-500 text-gray-900",
            duration: 3000,
          });
        }
      } catch (error) {
        console.error("Error sending image to backend:", error);
      }
    } else {
      // Trigger download (optional, if you still want to download the image)
      const link = document.createElement("a");
      link.href = dataURL;
      link.download =
        frameObject && downloadFrame ? "clipped-image.png" : "canvas-image.png";
      link.click();
    }

    // Restore the canvas and image to their previous dimensions

    canvas.setDimensions({
      width: renderedImageWidth,
      height: renderedImageHeight,
    });

    // Restore the scale and position of all other objects
    canvas.getObjects().forEach((obj) => {
      obj.scaleX /= scaleX;
      obj.scaleY /= scaleY;
      obj.left /= scaleX;
      obj.top /= scaleY;
      obj.setCoords();
    });

    // scale background image if exist
    if (backgroundImage) {
      backgroundImage.scaleX /= scaleX;
      backgroundImage.scaleY /= scaleY;
    }

    canvas.renderAll();
  };

  const deleteObject = () => {
    if (selectedObject) {
      let section = "unknown";
      let tab = "unknown";
      if (
        selectedObject.type === "rect" ||
        selectedObject.type === "circle" ||
        selectedObject.type === "triangle" ||
        selectedObject.type === "line" ||
        selectedObject.type === "path"
      ) {
        section = "shape";
        tab = "shape";
      }

      addLog({
        section: section,
        tab: tab,
        event: "deletion",
        message: `deleted shape ${selectedObject.type}`,
        objType: selectedObject.type,
      });

      canvas.remove(selectedObject);
      canvas.renderAll();
    }
  };

  const handleZoomIn = () => {
    const newScale = mapState.scale + 0.05;
    if (newScale <= 3) {
      setMapState({ ...mapState, scale: newScale });
    } else {
      setMapState({ ...mapState });
    }
  };

  const handleZoomOut = () => {
    const newScale = mapState.scale - 0.05;
    if (newScale >= 0.05) {
      setMapState({ ...mapState, scale: newScale });
    } else {
      setMapState({ ...mapState });
    }
  };

  return (
    <div className="flex w-full items-center justify-between rounded-none border-slate-800 border-t-2 gap-4">
      <div className="px-2 flex items-center gap-2">
        <Pencil className="text-gray-400 w-5 h-5" /> {/* Pencil icon */}
        <input
          type="text"
          className="bg-gray-800 text-white font-semibold px-2 py-1 rounded-md border border-gray-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
      </div>

      <div className="flex items-center">
        <IconComponent
          icon={<ZoomIn />}
          iconName={"ZoomIn"}
          handleClick={() => {
            handleZoomIn();
          }}
        />
        <div>{Math.floor(mapState.scale * 100)}%</div>
        {/* <IconComponent icon={<Undo />} iconName={"Undo"} /> */}
        {/* <IconComponent icon={<Redo />} iconName={"Redo"} />  */}
        <IconComponent
          icon={<ZoomOut />}
          iconName={"ZoomOut"}
          handleClick={() => handleZoomOut()}
        />
      </div>

      <div className="flex flex-none gap-10">
        <Dialog
          open={openDownloadOptions}
          onOpenChange={setOpenDownloadOptions}
        >
          <DialogTrigger asChild>
            <button
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold transition-all duration-30"
              onClick={() => {
                setOpenDownloadOptions(true);
              }}
            >
              Download
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Download Image</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col justify-start space-y-8">
              <div className="flex justify-between items-center mt-4">
                <Label htmlFor="frame-download">Frame Only</Label>
                <Switch
                  id="frame-download"
                  checked={downloadFrame}
                  onClick={() => setDownLoadFrame(!downloadFrame)}
                />
              </div>

              <div className="flex justify-between items-center mt-4">
                <Label className="flex-1">Resolution</Label>
                <div>
                  <Select
                    onValueChange={(value) => {
                      setSuperResValue(value); // Set the value if the user is logged in
                    }}
                    defaultValue={superResValue}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a resolution" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="2x" disabled={!user}>
                        2X
                      </SelectItem>
                      <SelectItem value="4x" disabled={!user}>
                        4X
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <button className="custom-button" onClick={downloadCanvas}>
                DownloadImage
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <button
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold transition-all duration-300  px-6 py-3 text-blue-700"
          onClick={() => {
            if (user) {
              onSaveCanvas();
            } else {
              toast({
                description: "You need to log in first",
                className: "bg-green-500 text-gray-900",
                duration: 3000,
              });
            }
          }}
        >
          {showUpdateButton ? "Update" : "Save"}
        </button>
        {selectedObject && (
          <button
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold transition-all duration-30  text-red-800"
            onClick={deleteObject}
          >
            Delete
          </button>
        )}
        {/* <div className="relative flex items-center space-x-4">
          <WebSpeechComponent />
        </div> */}
      </div>
    </div>
  );
};

export default Footer;
