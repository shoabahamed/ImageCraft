import IconComponent from "@/components/icon-component";
import { Button } from "@/components/ui/button";

import { Home, Redo, Undo, ZoomIn, ZoomOut } from "lucide-react";
import {
  Crop,
  RotateCwSquare,
  ListPlus,
  Type,
  PenTool,
  Cpu,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import * as fabric from "fabric";
import { useLocation, useNavigate } from "react-router-dom";
import AdjustSidebar from "@/components/AdjustSidebar";
import AddText from "@/components/AddText";
import Arrange from "@/components/Arrange";
import Draw from "@/components/Draw";
import CropSidebar from "@/components/CropSidebar";

import apiClient from "@/utils/appClient";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useToast } from "@/hooks/use-toast";

import { MapInteractionCSS, MapInteraction } from "react-map-interaction";

const MainPage = () => {
  const [sidebarName, setSidebarName] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mainCanvasRef = useRef<fabric.Canvas | null>(null);
  const currentImageRef = useRef<fabric.FabricImage | null>(null); // Use ref for currentImage
  const currentGroupRef = useRef<fabric.Group | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const imageDim = useRef<{ width: number; height: number } | null>(null);

  const imageUrlFromState = useLocation().state?.imageUrl;
  const idFromState = useLocation().state?.canvasId;
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState(imageUrlFromState || "./test3.png");

  const { user } = useAuthContext();
  const { toast } = useToast();
  const canvasIdRef = useRef(idFromState || crypto.randomUUID());
  const [showUpdateButton, setShowUpdateButton] = useState(false);

  const handleContainerResize = () => {
    const container = document.getElementById("CanvasContainer");
    if (!container || !mainCanvasRef.current || !currentImageRef.current)
      return;

    const { width: containerWidth, height: containerHeight } =
      container.getBoundingClientRect();

    const originalCanvasWidth = mainCanvasRef.current.width;
    const originalCanvasHeight = mainCanvasRef.current.height;
    const imageWidth = currentImageRef.current.width ?? 1;
    const imageHeight = currentImageRef.current.height ?? 1;

    // Determine if the image needs scaling
    const needsScaling =
      imageWidth > containerWidth || imageHeight > containerHeight;

    if (needsScaling) {
      const scaleX = containerWidth / imageWidth;
      const scaleY = containerHeight / imageHeight;
      const scale = Math.min(scaleX, scaleY); // Maintain aspect ratio

      currentImageRef.current.scale(scale); // Scale the image
    }

    const finalWidth = needsScaling
      ? currentImageRef.current.getScaledWidth()
      : imageWidth;
    const finalHeight = needsScaling
      ? currentImageRef.current.getScaledHeight()
      : imageHeight;

    mainCanvasRef.current.setDimensions({
      width: finalWidth,
      height: finalHeight,
    });

    const objScaleX = finalWidth / originalCanvasWidth;
    const objScaleY = finalHeight / originalCanvasHeight;
    // Apply scaling factors to all other objects
    mainCanvasRef.current.getObjects().forEach((obj) => {
      if (obj !== currentImageRef.current) {
        obj.scaleX *= objScaleX;
        obj.scaleY *= objScaleY;
        obj.left *= objScaleX;
        obj.top *= objScaleY;
        obj.setCoords();
      }
    });

    mainCanvasRef.current.renderAll();
  };

  useEffect(() => {
    if (canvasRef.current) {
      const container = document.getElementById("CanvasContainer");
      if (!container) return;

      const resizeObserver = new ResizeObserver(() => {
        handleContainerResize(); // Trigger resize handler
      });
      resizeObserver.observe(container);
      resizeObserverRef.current = resizeObserver;

      const { width: containerWidth, height: containerHeight } =
        container.getBoundingClientRect();

      const initCanvas = new fabric.Canvas(canvasRef.current, {
        width: 300,
        height: 300,
      });
      initCanvas.backgroundColor = "#fff";

      fabric.FabricImage.fromURL(imageUrl).then((img) => {
        const imageWidth = img.width ?? 1;
        const imageHeight = img.height ?? 1;

        imageDim.current = { width: imageWidth, height: imageHeight };

        const needsScaling =
          imageWidth > containerWidth || imageHeight > containerHeight;

        if (needsScaling) {
          const scaleX = containerWidth / imageWidth;
          const scaleY = containerHeight / imageHeight;
          const scale = Math.min(scaleX, scaleY);

          img.scale(scale); // Scale the image
        }

        const finalWidth = needsScaling ? img.getScaledWidth() : imageWidth;
        const finalHeight = needsScaling ? img.getScaledHeight() : imageHeight;

        initCanvas.setDimensions({ width: finalWidth, height: finalHeight });
        img.set({
          left: 0,
          top: 0,
          selectable: false,
          hoverCursor: "default",
        });

        initCanvas.add(img);
        initCanvas.renderAll();
        currentImageRef.current = img; // Set the ref directly
        mainCanvasRef.current = initCanvas;
      });

      return () => {
        initCanvas.dispose(); // Dispose of canvas
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
        }
      };
    }
  }, [imageUrl]);

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
    if (!mainCanvasRef.current) return;

    try {
      if (!mainCanvasRef.current || !currentImageRef.current) return;

      // save the canvas as image
      // converting canvas to original image size

      const originalCanvasWidth = mainCanvasRef.current.width!;
      const originalCanvasHeight = mainCanvasRef.current.height!;
      // Save current canvas dimensions and image scale
      const originalImageWidth = currentImageRef.current.width!;
      const originalImageHeight = currentImageRef.current.height!;
      const currentImageWidth =
        currentImageRef.current.scaleX! * originalImageWidth;
      const currentImageHeight =
        currentImageRef.current.scaleY! * originalImageHeight;

      // Calculate scaling factors
      const scaleX = originalImageWidth / currentImageWidth;
      const scaleY = originalImageHeight / currentImageHeight;

      // Scale the canvas to the original image size
      mainCanvasRef.current.setDimensions({
        width: originalImageWidth,
        height: originalImageHeight,
      });
      currentImageRef.current.scaleX = 1;
      currentImageRef.current.scaleY = 1;

      // Apply scaling factors to all other objects
      mainCanvasRef.current.getObjects().forEach((obj) => {
        if (obj !== currentImageRef.current) {
          obj.scaleX *= scaleX;
          obj.scaleY *= scaleY;
          obj.left *= scaleX;
          obj.top *= scaleY;
          obj.setCoords();
        }
      });

      // mainCanvasRef.current.renderAll();

      // Get the JSON representation of the canvas
      const canvasJSON = mainCanvasRef.current.toJSON();
      const canvasDataUrl = mainCanvasRef.current.toDataURL(); // Canvas as data URL

      mainCanvasRef.current.setDimensions({
        width: originalCanvasWidth,
        height: originalCanvasHeight,
      });
      currentImageRef.current.scaleX = currentImageWidth / originalImageWidth;
      currentImageRef.current.scaleY = currentImageHeight / originalImageHeight;

      // Restore the scale and position of all other objects
      mainCanvasRef.current.getObjects().forEach((obj) => {
        if (obj !== currentImageRef.current) {
          obj.scaleX /= scaleX;
          obj.scaleY /= scaleY;
          obj.left /= scaleX;
          obj.top /= scaleY;
          obj.setCoords();
        }
      });

      mainCanvasRef.current.renderAll();

      // Convert canvas image (Data URL) to a Blob and then to a File
      const canvasImageFile = await convertBlobToFile(canvasDataUrl);
      // Convert the image URL (blob URL) to a File object
      const originalImageFile = await convertBlobToFile(imageUrl);

      // Create FormData object and append the image and other canvas data
      const formData = new FormData();
      formData.append("canvasId", canvasIdRef.current);
      formData.append("canvasData", JSON.stringify(canvasJSON)); // Add canvas data as a string
      formData.append("originalImage", originalImageFile); // Append the oringalimage file
      formData.append("canvasImage", canvasImageFile); // Append the oringalimage file

      // Post JSON data to the backend with JWT in headers
      const response = await apiClient.post("/save_project", formData, {
        headers: {
          Authorization: `Bearer ${user?.token}`, // Include 'Bearer'
        },
      });

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
          className: "bg-green-500 text-gray-900",
          duration: 3000,
        });
      }

      // mainCanvasRef.current.renderAll();
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
    if (!mainCanvasRef.current || !currentImageRef.current) return;

    const originalCanvasWidth = mainCanvasRef.current.width!;
    const originalCanvasHeight = mainCanvasRef.current.height!;
    // Save current canvas dimensions and image scale
    const originalImageWidth = currentImageRef.current.width!;
    const originalImageHeight = currentImageRef.current.height!;
    const currentImageWidth =
      currentImageRef.current.scaleX! * originalImageWidth;
    const currentImageHeight =
      currentImageRef.current.scaleY! * originalImageHeight;

    // Calculate scaling factors
    const scaleX = originalImageWidth / currentImageWidth;
    const scaleY = originalImageHeight / currentImageHeight;

    // Scale the canvas to the original image size
    mainCanvasRef.current.setDimensions({
      width: originalImageWidth,
      height: originalImageHeight,
    });
    currentImageRef.current.scaleX = 1;
    currentImageRef.current.scaleY = 1;

    // Apply scaling factors to all other objects
    mainCanvasRef.current.getObjects().forEach((obj) => {
      if (obj !== currentImageRef.current) {
        obj.scaleX *= scaleX;
        obj.scaleY *= scaleY;
        obj.left *= scaleX;
        obj.top *= scaleY;
        obj.setCoords();
      }
    });

    mainCanvasRef.current.renderAll();
    // Generate the data URL for the download
    const dataURL = mainCanvasRef.current.toDataURL();

    // Create a temporary link element to trigger the download
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "canvas-image.png"; // Name of the file to be saved
    link.click();

    // Restore the canvas and image to their previous dimensions
    // Restore the canvas and image to their previous dimensions
    mainCanvasRef.current.setDimensions({
      width: originalCanvasWidth,
      height: originalCanvasHeight,
    });
    currentImageRef.current.scaleX = currentImageWidth / originalImageWidth;
    currentImageRef.current.scaleY = currentImageHeight / originalImageHeight;

    // Restore the scale and position of all other objects
    mainCanvasRef.current.getObjects().forEach((obj) => {
      if (obj !== currentImageRef.current) {
        obj.scaleX /= scaleX;
        obj.scaleY /= scaleY;
        obj.left /= scaleX;
        obj.top /= scaleY;
        obj.setCoords();
      }
    });

    mainCanvasRef.current.renderAll();
  };

  useEffect(() => {
    if (mainCanvasRef.current) {
      const enableDrawing = sidebarName === "PenTool" ? true : false;
      mainCanvasRef.current.isDrawingMode = enableDrawing;
    }
  }, [sidebarName]);

  return (
    <div className="h-screen max-w-screen flex items-center relative">
      {/* Sidebar */}
      <div
        className={`flex items-center h-full ${sidebarName ? "w-[25%]" : ""}`}
      >
        <nav className="flex flex-col gap-5  h-full justify-center items-center border-slate-800 border-r-2 rounded-none">
          <IconComponent
            icon={<Home />}
            iconName="Home"
            sidebarName={sidebarName}
            handleClick={() => {
              navigate("/");
            }}
          />
          <IconComponent
            icon={<RotateCwSquare />}
            iconName="Arrange"
            sidebarName={sidebarName}
            setSidebarName={setSidebarName}
          />
          <IconComponent
            icon={<Crop />}
            iconName="Crop"
            sidebarName={sidebarName}
            setSidebarName={setSidebarName}
          />
          <IconComponent
            icon={<ListPlus />}
            iconName="Adjust"
            sidebarName={sidebarName}
            setSidebarName={setSidebarName}
          />
          <IconComponent
            icon={<PenTool />}
            iconName="PenTool"
            sidebarName={sidebarName}
            setSidebarName={setSidebarName}
          />
          <IconComponent
            icon={<Type />}
            iconName="Text"
            sidebarName={sidebarName}
            setSidebarName={setSidebarName}
          />
          <IconComponent
            icon={<Cpu />}
            iconName="AI"
            sidebarName={sidebarName}
            setSidebarName={setSidebarName}
          />
        </nav>
        <div
          className={`${
            sidebarName ? "w-full" : "w-0"
          } transition-all duration-700 ease-in-out relative h-full  bg-gray-700`}
        >
          <div
            className={`${
              sidebarName ? "absolute w-[20px]" : "w-0"
            } flex justify-center items-center bg-gray-900  -right-2 text-slate-300 top-[40%] cursor-pointer h-[100px] rounded-full `}
            onClick={() => setSidebarName("")}
          ></div>
          {sidebarName === "Crop" && (
            <div className="w-full h-full">
              <div className="w-full abosulte py-3 text-center italic text-xl font-bold text-slate-300 top-0 left-0">
                Crop&Cut
              </div>
              <div className="h-[90%] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <CropSidebar
                  canvas={mainCanvasRef.current!}
                  image={currentImageRef.current!}
                />
              </div>
            </div>
          )}

          {sidebarName === "Arrange" && (
            <div className="w-full h-full">
              <div className="w-full abosulte py-3 text-center italic text-xl font-bold text-slate-300 top-0 left-0">
                Arrange Image
              </div>
              <div className="h-[90%]  overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <Arrange
                  canvas={mainCanvasRef.current!}
                  image={currentImageRef.current!}
                />
              </div>
            </div>
          )}

          {sidebarName === "Adjust" && (
            <div className="w-full h-full">
              <div className="w-full abosulte py-3 text-center italic text-xl font-bold text-slate-300 top-0 left-0">
                Adjust
              </div>
              <div className="h-[90%] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <AdjustSidebar
                  canvas={mainCanvasRef.current!}
                  image={currentImageRef.current!}
                />
              </div>
            </div>
          )}

          {sidebarName === "PenTool" && (
            <div className="w-full h-full">
              <div className="w-full abosulte py-3 text-center italic text-xl font-bold text-slate-300 top-0 left-0">
                Draw
              </div>
              <div className="h-[90%]  overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <Draw canvas={mainCanvasRef.current!} />
              </div>
            </div>
          )}

          {sidebarName === "Text" && (
            <div className="w-full h-full">
              <div className="w-full abosulte py-3 text-center italic text-xl font-bold text-slate-300 top-0 left-0">
                Text
              </div>
              <div className="h-[90%]  overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <AddText canvas={mainCanvasRef.current!} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Section */}
      <div className="flex flex-grow h-full flex-col justify-center items-center">
        {/* Design Section */}
        <div className="flex-1 w-full flex items-center justify-center">
          <div
            className="w-[90%] h-[90%] flex justify-center items-center"
            id="CanvasContainer"
          >
            {/* <MapInteractionCSS> */}
            <canvas id="canvas" className="z-1" ref={canvasRef}></canvas>
            {/* </MapInteractionCSS> */}
          </div>
        </div>
        {/* Footer */}
        <div className="flex flex-none w-full">
          <div className="flex w-full h-full items-center justify-center rounded-none border-slate-800 border-t-2 gap-4">
            <div className="flex">
              <IconComponent icon={<ZoomIn />} iconName={"ZoomIn"} />
              <IconComponent icon={<Undo />} iconName={"Undo"} />
              <IconComponent icon={<Redo />} iconName={"Redo"} />
              <IconComponent icon={<ZoomOut />} iconName={"ZoomOut"} />
            </div>

            <div className="flex flex-none gap-1">
              <Button className="px-8" onClick={downloadCanvas}>
                Download
              </Button>
              <Button className="px-8" onClick={onSaveCanvas}>
                {showUpdateButton ? "Update" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
