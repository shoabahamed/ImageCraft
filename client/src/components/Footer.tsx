import apiClient from "@/utils/appClient";
import { useAuthContext } from "@/hooks/useAuthContext";
import {
  Pencil,
  RotateCcw,
  Redo,
  Undo,
  Download,
  Save,
  Trash,
} from "lucide-react";
import IconComponent from "./icon-component";

import { Canvas, FabricImage } from "fabric";
import { useToast } from "@/hooks/use-toast";
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";
import { useLogContext } from "@/hooks/useLogContext";

import { useCommonProps } from "@/hooks/appStore/CommonProps";
import { useAdjustStore } from "@/hooks/appStore/AdjustStore";
import {
  base64ToFile,
  getCanvasDataUrl,
  getRotatedBoundingBox,
  isBase64,
  urlToBase64,
} from "@/utils/commonFunctions";
import { useArrangeStore } from "@/hooks/appStore/ArrangeStore";
import NewProjectBox from "./NewProjectBox";

// TODO: saving canvas when style transfer has been done
// TODO: saving the background image if available(not sure though may be we could just let fabric js handle this)

type mapStateType = {
  scale: number;
  translation: { x: number; y: number };
};

type Props = {
  canvas: Canvas;
  image: FabricImage;
  backupImage: FabricImage;
  canvasId: string;
  imageUrl: string;
  setLoadState: (val: boolean) => void;
  undo: () => void;
  redo: () => void;
};

const Footer = ({
  canvas,
  image,
  canvasId,
  imageUrl,
  setLoadState,
  undo,
  redo,
}: Props) => {
  const {
    selectedObject,
    finalImageDimensions,
    originalImageDimensions,
    downloadImageDimensions,
    setDownloadImageDimensions,
    setFinalImageDimensions,
    allFiltersRef,
    loadedFromSaved,
  } = useCanvasObjects();
  const { user } = useAuthContext();
  const { logs, addLog } = useLogContext();
  const { toast } = useToast();

  const currentFilters = useCommonProps((state) => state.currentFilters);
  const projectName = useCommonProps((state) => state.projectName);
  const setProjectName = useCommonProps((state) => state.setProjectName);
  const showUpdateButton = useCommonProps((state) => state.showUpdateButton);
  const setShowUpdateButton = useCommonProps(
    (state) => state.setShowUpdateButton
  );
  const resetFilters = useAdjustStore((state) => state.resetFilters);
  const setFlipY = useArrangeStore((state) => state.setFlipY);
  const setFlipX = useArrangeStore((state) => state.setFlipX);
  const setImageRotation = useArrangeStore((state) => state.setImageRotation);

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

      const { imageHeight: finalImageHeight, imageWidth: finalImageWidth } =
        finalImageDimensions;
      const { imageHeight: originalHeight, imageWidth: originalWidth } =
        originalImageDimensions;
      const { imageHeight: downloadHeight, imageWidth: downloadWidth } =
        downloadImageDimensions;
      const originalViewportTransform = canvas.viewportTransform;
      const originalZoom = canvas.getZoom();

      // Reset to neutral
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      canvas.setZoom(1);
      canvas
        .getObjects() // @ts-ignore
        .find((obj) => obj.setCoords());
      // canvas.renderAll(); # not sure if it is necessary or not

      const bounds = getRotatedBoundingBox(image);

      // TODO: since scale has changed I also need to scale other objects too. For some weird reason though everything is working just fine
      // @ts-ignore
      const canvasDataUrl = canvas.toDataURL({
        format: "png",
        left: bounds.left,
        top: bounds.top,
        width: bounds.width,
        height: bounds.height,
      });

      // json data
      const canvasJSON = canvas.toObject(["name", "isUpper", "id"]);
      let mainImageSrc = canvasJSON.objects[0].src;
      canvasJSON.objects[0].src = "temp"; //large base64 file does not get parsed in flask for some so using a hack temporaliy as we do not rely on src

      // Convert canvas image (Data URL) to a Blob and then to a File
      const canvasImageFile = await convertBlobToFile(canvasDataUrl);
      // Convert the image URL (blob URL) to a File object

      const originalImageFile = await convertBlobToFile(imageUrl);
      console.log(imageUrl);
      if (!isBase64(mainImageSrc)) {
        mainImageSrc = await urlToBase64(mainImageSrc);
      }

      const interImage = base64ToFile(mainImageSrc, "inter_image");
      let filterNames = [];
      if (currentFilters) {
        // @ts-ignore
        filterNames = currentFilters.map((filter) => filter.filterName);
      }

      // Create FormData object and append the image and other canvas data
      const formData = new FormData();
      formData.append("canvasId", canvasId);
      formData.append("username", user?.username);
      formData.append("isPublic", "false");
      formData.append("canvasData", JSON.stringify(canvasJSON));
      formData.append("canvasLogs", JSON.stringify(logs));
      formData.append("filterNames", JSON.stringify(filterNames));
      formData.append(
        "allFiltersApplied",
        JSON.stringify(allFiltersRef.current)
      );
      // formData.append("mainImageSrc", mainImageSrc);
      formData.append(
        "originalImageShape",
        JSON.stringify({ width: originalWidth, height: originalHeight })
      );

      formData.append(
        "finalImageShape",
        JSON.stringify({
          width: finalImageWidth,
          height: finalImageHeight,
        })
      );

      formData.append(
        "downloadImageShape",
        JSON.stringify({
          width: downloadWidth,
          height: downloadHeight,
        })
      );
      // @ts-ignore
      formData.append("originalImage", originalImageFile);
      // @ts-ignore
      formData.append("canvasImage", canvasImageFile);
      formData.append("interImage", interImage);
      formData.append("projectName", projectName);
      formData.append("loadedFromSaved", loadedFromSaved ? "true" : "false");

      // Restore zoom & transform
      canvas.setViewportTransform(originalViewportTransform);
      canvas.setZoom(originalZoom);
      canvas
        .getObjects() // @ts-ignore
        .find((obj) => obj.setCoords());
      canvas.renderAll();

      // Post JSON data to the backend with JWT in headers
      const response = await apiClient.post(
        "/save_project",

        formData,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`, // Include 'Bearer'
          },
        }
      );

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
      setLoadState(false);
      console.error("Error saving canvas:", error);
      toast({
        variant: "destructive",
        description: "Unexpected Error" + error,
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

    const dataURL = getCanvasDataUrl(canvas, image, false);

    // Trigger download (optional, if you still want to download the image)
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "canvas-image.png";
    link.click();
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
      } else {
        section = "text";
        tab = "text";
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

  // const handleZoomIn = () => {
  //   const zoomScale = 0.05;
  //   let newZoomValue = zoomValue + zoomScale;

  //   if (newZoomValue > 20) newZoomValue = 20;
  //   if (newZoomValue < 0.01) newZoomValue = 0.01;

  //   setZoomValue(newZoomValue);
  //   canvas.setZoom(newZoomValue);
  // };

  // const handleZoomOut = () => {
  //   const zoomScale = 0.05;
  //   let newZoomValue = zoomValue - zoomScale;

  //   if (newZoomValue > 20) newZoomValue = 20;
  //   if (newZoomValue < 0.01) newZoomValue = 0.01;

  //   setZoomValue(newZoomValue);
  //   canvas.setZoom(newZoomValue);
  // };

  const handleRestore = () => {
    // removing all objects from the canvas

    canvas.getObjects().map((obj) => {
      if (obj.type.toLowerCase() !== "image") canvas.remove(obj);
    });

    // removing all filters
    resetFilters();

    // restoring the original image
    FabricImage.fromURL(imageUrl).then((img) => {
      if (!img || !image) return;
      image.setElement(img.getElement());

      // reset the scale to 1
      image.scaleX = 1;
      image.scaleY = 1;

      // reset the flip to default
      image.flipX = false;
      image.flipY = false;

      // reset image rotation to default 0
      image.angle = 0;
      setImageRotation(0);

      // remove clippath
      image.clipPath = null;

      // reset the flipping in zustand so that it is reflected in ui
      setFlipX(false);
      setFlipY(false);

      // reset the final dimension to images original dimension
      setFinalImageDimensions({
        imageWidth: img.width,
        imageHeight: img.height,
      });

      setDownloadImageDimensions({
        imageWidth: img.width,
        imageHeight: img.height,
      });

      // Refresh canvas
      image.setCoords();
      canvas.requestRenderAll();
    });

    addLog({
      section: "canvas",
      tab: "canvas",
      event: "reset",
      message: `reseted whole canvas `,
    });
  };

  return (
    <div className="flex w-full items-center justify-between rounded-none bg-white dark:bg-gray-950 border-b border-slate-800 dark:border-slate-900 border-t-2 gap-0 lg:gap-4">
      <div className="px-2 flex items-center gap-0 lg:gap-2">
        <Pencil className="text-gray-400 w-2 h-2 lg:w-5 lg:h-5" />{" "}
        {/* Pencil icon */}
        <input
          type="text"
          className="bg-gray-800 text-white font-semibold px-0 py-0 md:px-2 md:py-1 rounded-md border border-gray-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <NewProjectBox useButton={false} />
      </div>

      <div className="flex items-center gap-0 lg:gap-2">
        <IconComponent
          icon={<Undo />}
          iconName={"Undo"}
          extraStyles="px-0 py-0 md:px-1 py-1"
          handleClick={() => {
            undo();
          }}
        />
        <IconComponent
          icon={<RotateCcw />}
          iconName={"Restore"}
          extraStyles="px-0 py-0 md:px-1 py-1"
          handleClick={() => {
            handleRestore();
          }}
        />
        <IconComponent
          icon={<Redo />}
          iconName={"Redo"}
          extraStyles="px-0 py-0 md:px-1 py-1"
          handleClick={() => redo()}
        />
      </div>
      <div className="flex  items-center justify-center gap-2 sm:gap-2 md:gap-2 lg:gap-10">
        <button
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold transition-all duration-300 px-4 py-2"
          onClick={() => {
            downloadCanvas();
          }}
        >
          <span className="hidden lg:inline">Download</span>
          <Download className="lg:hidden w-5 h-5" />
        </button>

        <button
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold transition-all duration-300 px-4 py-2 text-blue-700"
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
          <span className="hidden lg:inline">
            {showUpdateButton ? "Update" : "Save"}
          </span>
          <Save className="lg:hidden w-5 h-5" />
        </button>

        {selectedObject && (
          <button
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold transition-all duration-300 px-4 py-2 text-red-800"
            onClick={deleteObject}
          >
            <span className="hidden lg:inline">Delete</span>
            <Trash className="lg:hidden w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Footer;
