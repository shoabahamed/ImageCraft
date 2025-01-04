import apiClient from "@/utils/appClient";
import { useAuthContext } from "@/hooks/useAuthContext";
import { Redo, Undo, ZoomIn, ZoomOut } from "lucide-react";
import IconComponent from "./icon-component";
import { Button } from "./ui/button";

import { Canvas, FabricImage } from "fabric";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";
import { useLogContext } from "@/hooks/useLogContext";

type Props = {
  canvas: Canvas;
  image: FabricImage;
  canvasId: string;
  imageUrl: string;
};

const Footer = ({ canvas, image, canvasId, imageUrl }: Props) => {
  const { selectedObject, setSelectedObject } = useCanvasObjects();
  const { user } = useAuthContext();
  const { logs, addLog } = useLogContext();
  const { toast } = useToast();
  const [showUpdateButton, setShowUpdateButton] = useState(false);

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
    addLog("Saving Canvas to backend");
    if (!canvas) return;

    try {
      if (!canvas || !image) return;

      // save the canvas as image
      // converting canvas to original image size

      const originalCanvasWidth = canvas.width!;
      const originalCanvasHeight = canvas.height!;
      // Save current canvas dimensions and image scale
      const originalImageWidth = image.width!;
      const originalImageHeight = image.height!;
      const currentImageWidth = image.scaleX! * originalImageWidth;
      const currentImageHeight = image.scaleY! * originalImageHeight;

      // Calculate scaling factors
      const scaleX = originalImageWidth / currentImageWidth;
      const scaleY = originalImageHeight / currentImageHeight;

      // Scale the canvas to the original image size
      canvas.setDimensions({
        width: originalImageWidth,
        height: originalImageHeight,
      });
      image.scaleX = 1;
      image.scaleY = 1;

      // Apply scaling factors to all other objects
      canvas.getObjects().forEach((obj) => {
        if (obj !== image) {
          obj.scaleX *= scaleX;
          obj.scaleY *= scaleY;
          obj.left *= scaleX;
          obj.top *= scaleY;
          obj.setCoords();
        }
      });

      // canvas.renderAll();

      // Get the JSON representation of the canvas
      const canvasJSON = canvas.toJSON();
      const canvasDataUrl = canvas.toDataURL(); // Canvas as data URL

      canvas.setDimensions({
        width: originalCanvasWidth,
        height: originalCanvasHeight,
      });
      image.scaleX = currentImageWidth / originalImageWidth;
      image.scaleY = currentImageHeight / originalImageHeight;

      // Restore the scale and position of all other objects
      canvas.getObjects().forEach((obj) => {
        if (obj !== image) {
          obj.scaleX /= scaleX;
          obj.scaleY /= scaleY;
          obj.left /= scaleX;
          obj.top /= scaleY;
          obj.setCoords();
        }
      });

      canvas.renderAll();

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

      formData.append("originalImage", originalImageFile); // Append the oringalimage file
      formData.append("canvasImage", canvasImageFile); // Append the oringalimage

      // Post JSON data to the backend with JWT in headers
      const response = await apiClient.post("/save_project", formData, {
        headers: {
          Authorization: `Bearer ${user?.token}`, // Include 'Bearer'
        },
      });

      localStorage.setItem("canvasId", canvasId);
      localStorage.setItem(
        "project_data",
        JSON.stringify(response.data.data.project_data)
      );

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

  const downloadCanvas = () => {
    addLog("Downloading Canvas");
    console.log(canvas);
    console.log(image);

    if (!canvas || !image) return;

    const originalCanvasWidth = canvas.width!;
    const originalCanvasHeight = canvas.height!;
    // Save current canvas dimensions and image scale
    const originalImageWidth = image.width!;
    const originalImageHeight = image.height!;
    const currentImageWidth = image.scaleX! * originalImageWidth;
    const currentImageHeight = image.scaleY! * originalImageHeight;

    // Calculate scaling factors
    const scaleX = originalImageWidth / currentImageWidth;
    const scaleY = originalImageHeight / currentImageHeight;

    // Scale the canvas to the original image size
    canvas.setDimensions({
      width: originalImageWidth,
      height: originalImageHeight,
    });
    image.scaleX = 1;
    image.scaleY = 1;

    // Apply scaling factors to all other objects
    canvas.getObjects().forEach((obj) => {
      if (obj !== image) {
        obj.scaleX *= scaleX;
        obj.scaleY *= scaleY;
        obj.left *= scaleX;
        obj.top *= scaleY;
        obj.setCoords();
      }
    });

    canvas.renderAll();

    // Find the object named "Frame" or starting with "Frame"
    const frameObject = canvas
      .getObjects()
      .find((obj) => obj.name?.startsWith("Frame"));
    if (frameObject) {
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
      const dataURL = outputCanvas.toDataURL();

      // Trigger download
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "clipped-image.png";
      link.click();

      // Clean up output canvas
      outputCanvas.remove();

      // canvas.backgroundColor = "fff"
    } else {
      console.log("download");
      // Generate the data URL for the download
      const dataURL = canvas.toDataURL();

      // Create a temporary link element to trigger the download
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "canvas-image.png"; // Name of the file to be saved
      link.click();
    }

    // Restore the canvas and image to their previous dimensions
    canvas.setDimensions({
      width: originalCanvasWidth,
      height: originalCanvasHeight,
    });
    image.scaleX = currentImageWidth / originalImageWidth;
    image.scaleY = currentImageHeight / originalImageHeight;

    // Restore the scale and position of all other objects
    canvas.getObjects().forEach((obj) => {
      if (obj !== image) {
        obj.scaleX /= scaleX;
        obj.scaleY /= scaleY;
        obj.left /= scaleX;
        obj.top /= scaleY;
        obj.setCoords();
      }
    });

    canvas.renderAll();
  };

  const deleteObject = () => {
    if (selectedObject) {
      addLog(`Deleted object of type ${selectedObject.type}`);
      canvas.remove(selectedObject);
      canvas.renderAll();
    }
  };

  return (
    <div className="flex w-full h-full items-center justify-center rounded-none border-slate-800 border-t-2 gap-4">
      <div className="flex">
        {/* <IconComponent icon={<ZoomIn />} iconName={"ZoomIn"} /> */}
        {/* <IconComponent icon={<Undo />} iconName={"Undo"} />
        <IconComponent icon={<Redo />} iconName={"Redo"} /> */}
        {/* <IconComponent icon={<ZoomOut />} iconName={"ZoomOut"} /> */}
      </div>

      <div className="flex flex-none gap-1">
        <Button className="px-8" onClick={downloadCanvas}>
          Download
        </Button>
        <Button className="px-8" onClick={onSaveCanvas}>
          {showUpdateButton ? "Update" : "Save"}
        </Button>
        {selectedObject && (
          <Button
            className="px-8 bg-red-500 hover:bg-red-600"
            onClick={deleteObject}
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};

export default Footer;
