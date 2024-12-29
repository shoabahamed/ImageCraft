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

  // const handleContainerResize = () => {
  //   const container = document.getElementById("CanvasContainer");
  //   if (!container || !mainCanvasRef.current || !currentImageRef.current)
  //     return;

  //   const { width: containerWidth, height: containerHeight } =
  //     container.getBoundingClientRect();

  //   const imageWidth = currentImageRef.current.width ?? 1;
  //   const imageHeight = currentImageRef.current.height ?? 1;

  //   // Determine if the image needs scaling
  //   const needsScaling =
  //     imageWidth > containerWidth || imageHeight > containerHeight;

  //   let scale = 0;
  //   if (needsScaling) {
  //     const scaleX = containerWidth / imageWidth;
  //     const scaleY = containerHeight / imageHeight;
  //     scale = Math.min(scaleX, scaleY); // Maintain aspect ratio

  //     currentImageRef.current.scale(scale); // Scale the image
  //   }

  //   const finalWidth = needsScaling
  //     ? currentImageRef.current.getScaledWidth()
  //     : imageWidth;
  //   const finalHeight = needsScaling
  //     ? currentImageRef.current.getScaledHeight()
  //     : imageHeight;

  //   mainCanvasRef.current.setDimensions({
  //     width: finalWidth,
  //     height: finalHeight,
  //   });

  //   mainCanvasRef.current.renderAll();
  // };

  // useEffect(() => {
  //   if (canvasRef.current) {
  //     const container = document.getElementById("CanvasContainer");
  //     if (!container) return;

  //     const resizeObserver = new ResizeObserver(() => {
  //       handleContainerResize(); // Trigger resize handler
  //     });
  //     resizeObserver.observe(container);
  //     resizeObserverRef.current = resizeObserver;

  //     const { width: containerWidth, height: containerHeight } =
  //       container.getBoundingClientRect();

  //     const initCanvas = new fabric.Canvas(canvasRef.current, {
  //       width: 300,
  //       height: 300,
  //     });
  //     initCanvas.backgroundColor = "#fff";

  //     fabric.FabricImage.fromURL(imageUrl).then((img) => {
  //       const imageWidth = img.width ?? 1;
  //       const imageHeight = img.height ?? 1;

  //       imageDim.current = { width: imageWidth, height: imageHeight };

  //       const needsScaling =
  //         imageWidth > containerWidth || imageHeight > containerHeight;

  //       if (needsScaling) {
  //         const scaleX = containerWidth / imageWidth;
  //         const scaleY = containerHeight / imageHeight;
  //         const scale = Math.min(scaleX, scaleY);

  //         img.scale(scale); // Scale the image
  //       }

  //       const finalWidth = needsScaling ? img.getScaledWidth() : imageWidth;
  //       const finalHeight = needsScaling ? img.getScaledHeight() : imageHeight;

  //       initCanvas.setDimensions({ width: finalWidth, height: finalHeight });
  //       img.set({
  //         left: 0,
  //         top: 0,
  //         selectable: false,
  //         hoverCursor: "default",
  //       });

  //       initCanvas.add(img);
  //       initCanvas.renderAll();
  //       currentImageRef.current = img; // Set the ref directly
  //       mainCanvasRef.current = initCanvas;
  //     });

  //     return () => {
  //       initCanvas.dispose(); // Dispose of canvas
  //       if (resizeObserverRef.current) {
  //         resizeObserverRef.current.disconnect();
  //       }
  //     };
  //   }
  // }, [imageUrl]);

  // const handleContainerResize = () => {
  //   console.log("dynamic");
  // };

  // useEffect(() => {
  //   if (canvasRef.current) {
  //     const container = document.getElementById("CanvasContainer");
  //     if (!container) return;

  //     const resizeObserver = new ResizeObserver(() => {
  //       handleContainerResize(); // Trigger resize handler
  //     });
  //     resizeObserver.observe(container);
  //     resizeObserverRef.current = resizeObserver;

  //     const { width: containerWidth, height: containerHeight } =
  //       container.getBoundingClientRect();

  //     const initCanvas = new fabric.Canvas(canvasRef.current, {
  //       width: 300,
  //       height: 300,
  //     });
  //     initCanvas.backgroundColor = "#ff0";

  //     fabric.FabricImage.fromURL(imageUrl).then((img) => {
  //       const imageWidth = img.width ?? 1;

  //       const imageHeight = img.height ?? 1;

  //       imageDim.current = { width: imageWidth, height: imageHeight };

  //       // Calculate the initial scale to fit the image inside the container
  //       let scale = 1;
  //       let translateX = 0;
  //       let translateY = 0;

  //       if (imageWidth > containerWidth || imageHeight > containerHeight) {
  //         // Scale down the canvas using MapInteractionCSS's scale
  //         const scaleX = containerWidth / imageWidth;
  //         const scaleY = containerHeight / imageHeight;
  //         scale = Math.min(scaleX, scaleY);
  //         console.log("scale ", scale);
  //         // scale = 0.3;

  //         // Position the scaled image inside the container
  //         const scaledWidth = imageWidth * scale;
  //         const scaledHeight = imageHeight * scale;

  //         translateX = (containerWidth - scaledWidth) / 2;
  //         translateY = (containerHeight - scaledHeight) / 2;
  //       } else {
  //         // Center smaller images directly
  //         translateX = (containerWidth - imageWidth) / 2;
  //         translateY = (containerHeight - imageHeight) / 2;
  //       }

  //       // Set initial MapInteractionCSS values
  //       setValue({
  //         scale,
  //         translation: { x: translateX, y: translateY },
  //       });

  //       // Set canvas dimensions to match the image
  //       initCanvas.setDimensions({
  //         width: imageWidth + 30,
  //         height: imageHeight + 30,
  //       });

  //       // Add the image to the canvas without scaling
  //       img.set({
  //         left: 0,
  //         top: 0,
  //         selectable: false,
  //         hoverCursor: "default",
  //       });

  //       initCanvas.add(img);
  //       initCanvas.renderAll();
  //       currentImageRef.current = img; // Set the ref directly
  //       mainCanvasRef.current = initCanvas;
  //     });

  //     return () => {
  //       initCanvas.dispose(); // Dispose of canvas
  //       if (resizeObserverRef.current) {
  //         resizeObserverRef.current.disconnect();
  //       }
  //     };
  //   }
  // }, [imageUrl]);

  //     if (!container) return;

  //     let { width: containerWidth, height: containerHeight } =
  //       container.getBoundingClientRect();

  //     containerWidth = Math.floor(containerWidth);
  //     containerHeight = Math.floor(containerHeight);

  //     if (mainCanvas) {
  //       console.log("old");

  //       console.log(imageWidth);
  //       console.log(imageHeight);
  //       // mainCanvas.setDimensions({
  //       //   width: 500,
  //       //   height: 500,
  //       // });

  //       mainCanvas.setWidth(imageWidth);

  //       // mainCanvas.renderAll();
  //       // setMainCanvas(mainCanvas);
  //       // console.log(currentImage);
  //       // const imageWidth = currentImage.width ?? 1; // Fallback to 1
  //       // const imageHeight = currentImage.height ?? 1;

  //       // Determine if the image needs scaling
  //       // const needsScaling =
  //       //   imageWidth > containerWidth || imageHeight > containerHeight;

  //       // if (needsScaling) {
  //       //   // Calculate the scale to fit the image within the container
  //       //   const scaleX = containerWidth / imageWidth;
  //       //   const scaleY = containerHeight / imageHeight;
  //       //   const scale = Math.min(scaleX, scaleY); // Maintain aspect ratio

  //       //   // Scale the image
  //       //   currentImage.scale(scale);
  //       // }
  //       // Get the dimensions to resize the canvas
  //       // const finalWidth = needsScaling
  //       //   ? currentImage.getScaledWidth()
  //       //   : imageWidth;
  //       // const finalHeight = needsScaling
  //       //   ? currentImage.getScaledHeight()
  //       //   : imageHeight;
  //       // mainCanvas.setDimensions({ width: finalWidth, height: finalHeight });
  //       // Resize the canvas to match the final image size
  //       // mainCanvas.setWidth(finalWidth);
  //       // mainCanvas.setHeight(finalHeight);
  //       // console.log(mainCanvas);

  //       // mainCanvas.remove(currentImage);
  //       // Fix the image at position (0, 0) and disable interactions
  //       // currentImage.set({
  //       //   left: 0,
  //       //   top: 0,
  //       //   selectable: false, // Prevent selection
  //       //   evented: false, // Disable event handling
  //       //   hoverCursor: "default", // Remove hover effect
  //       // });

  //       // Add the image to the canvas

  //       // Save the canvas and image references
  //       // setCurrentImage(currentImage);
  //       // setMainCanvas(mainCanvas);
  //       return () => {
  //         console.log("Cleaning up canvas...");
  //         mainCanvas.dispose(); // Dispose of the local canvas instance
  //       };
  //     } else {
  //       console.log("new");
  //       const initCanvas = new fabric.Canvas(canvasRef.current, {
  //         backgroundColor: "#fff",
  //       });

  //       // fabric.FabricImage.fromURL(imageUrl).then((img) => {
  //       //   const imageWidth = img.width ?? 1; // Fallback to 1
  //       //   const imageHeight = img.height ?? 1;

  //       //   // Determine if the image needs scaling
  //       //   const needsScaling =
  //       //     imageWidth > containerWidth || imageHeight > containerHeight;

  //       //   if (needsScaling) {
  //       //     // Calculate the scale to fit the image within the container
  //       //     const scaleX = containerWidth / imageWidth;
  //       //     const scaleY = containerHeight / imageHeight;
  //       //     const scale = Math.min(scaleX, scaleY); // Maintain aspect ratio

  //       //     // Scale the image
  //       //     img.scale(scale);
  //       //   }

  //       //   // Get the dimensions to resize the canvas
  //       //   const finalWidth = needsScaling ? img.getScaledWidth() : imageWidth;
  //       //   const finalHeight = needsScaling
  //       //     ? img.getScaledHeight()
  //       //     : imageHeight;

  //       //   // Resize the canvas to match the final image size
  //       //   initCanvas.setDimensions({ width: finalWidth, height: finalHeight });
  //       //   // Fix the image at position (0, 0) and disable interactions
  //       //   img.set({
  //       //     left: 0,
  //       //     top: 0,
  //       //     selectable: false, // Prevent selection
  //       //     evented: false, // Disable event handling
  //       //     hoverCursor: "default", // Remove hover effect
  //       //   });

  //       //   // Add the image to the canvas
  //       //   initCanvas.add(img);
  //       //   initCanvas.renderAll();
  //       //   // Save the canvas and image references
  //       //   setCurrentImage(img);
  //       //   setMainCanvas(initCanvas);
  //       // });

  //       initCanvas.setDimensions({
  //         width: 300,
  //         height: 300,
  //       });

  //       initCanvas.renderAll();
  //       setMainCanvas(initCanvas);

  //       // window.addEventListener("resize", () => {
  //       //   setWindowWidth(window.innerWidth);
  //       // });
  //       return () => {
  //         console.log("Cleaning up canvas...");
  //         initCanvas.dispose(); // Dispose of the local canvas instance
  //       };
  //     }
  //   }
  // }, [imageWidth]);

  const downloadCanvas = () => {
    if (!mainCanvasRef.current || !currentImageRef.current) return;

    // Save current canvas dimensions and image scale
    const originalCanvasWidth = mainCanvasRef.current.width!;
    const originalCanvasHeight = mainCanvasRef.current.height!;
    const originalImageScaleX = currentImageRef.current.scaleX!;
    const originalImageScaleY = currentImageRef.current.scaleY!;

    // Retrieve the original image dimensions
    const originalImageWidth = currentImageRef.current.width!;
    const originalImageHeight = currentImageRef.current.height!;

    // Temporarily set the canvas and image to their original size
    mainCanvasRef.current.setDimensions({
      width: originalImageWidth,
      height: originalImageHeight,
    });
    currentImageRef.current.scaleX = 1; // Reset horizontal scale to original
    currentImageRef.current.scaleY = 1; // Reset vertical scale to original
    mainCanvasRef.current.renderAll();

    // Generate the data URL for the download
    const dataURL = mainCanvasRef.current.toDataURL();

    // Create a temporary link element to trigger the download
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "canvas-image.png"; // Name of the file to be saved
    link.click();

    // Restore the canvas and image to their previous dimensions
    mainCanvasRef.current.setDimensions({
      width: originalCanvasWidth,
      height: originalCanvasHeight,
    });
    currentImageRef.current.scaleX = originalImageScaleX; // Restore horizontal scale
    currentImageRef.current.scaleY = originalImageScaleY; // Restore vertical scale
    mainCanvasRef.current.renderAll();
  };

  useEffect(() => {
    if (mainCanvasRef.current) {
      const enableDrawing = sidebarName === "PenTool" ? true : false;
      mainCanvasRef.current.isDrawingMode = enableDrawing;
    }
  }, [sidebarName]);

  const onSaveCanvas = async () => {
    if (!mainCanvasRef.current) return;

    try {
      // Get the JSON representation of the canvas
      const canvasJSON = mainCanvasRef.current.toJSON();

      // Post JSON data to the backend with JWT in headers
      const response = await apiClient.post(
        "/save_project",
        {
          canvasId: canvasIdRef.current,
          canvasData: canvasJSON,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`, // Include 'Bearer'
          },
        }
      );

      if (response.status === 201) {
        toast({
          description: "Canvas Successfully saved.",
          className: "bg-green-500 text-gray-900",
          duration: 2000,
        });

        setShowUpdateButton(true);
      } else if (response.status === 200) {
        toast({
          description: "Canvas Updated Successfully.",
          className: "bg-green-500 text-gray-900",
          duration: 2000,
        });
      } else {
        toast({
          variant: "destructive",
          description: "Save failed",
          className: "bg-green-500 text-gray-900",
          duration: 3000,
        });
      }
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
