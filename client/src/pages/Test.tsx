import IconComponent from "@/components/icon-component";

import { Home } from "lucide-react";
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

import { useAuthContext } from "@/hooks/useAuthContext";
import Footer from "@/components/Footer";

import { MapInteractionCSS } from "react-map-interaction";
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";

const Test = () => {
  const [sidebarName, setSidebarName] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mainCanvasRef = useRef<fabric.Canvas | null>(null);
  const currentImageRef = useRef<fabric.FabricImage | null>(null); // Use ref for currentImage
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const imageUrlFromState = useLocation().state?.imageUrl;
  const idFromState = useLocation().state?.canvasId;
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState(imageUrlFromState || "./test3.png");

  const { user } = useAuthContext();
  const canvasIdRef = useRef(idFromState || crypto.randomUUID());

  const { setCurrentImageDim, setCurrentContDim } = useCanvasObjects();

  const [mapState, setMapState] = useState({
    scale: 1,
    translation: { x: 100, y: 0 },
  });

  // const handleContainerResize = () => {
  //   const container = document.getElementById("CanvasContainer");
  //   if (!container || !mainCanvasRef.current || !currentImageRef.current)
  //     return;

  //   const { width: containerWidth, height: containerHeight } =
  //     container.getBoundingClientRect();

  //   const originalCanvasWidth = mainCanvasRef.current.width;
  //   const originalCanvasHeight = mainCanvasRef.current.height;
  //   const imageWidth = currentImageRef.current.width ?? 1;
  //   const imageHeight = currentImageRef.current.height ?? 1;

  //   // Determine if the image needs scaling
  //   const needsScaling =
  //     imageWidth > containerWidth || imageHeight > containerHeight;

  //   if (needsScaling) {
  //     const scaleX = containerWidth / imageWidth;
  //     const scaleY = containerHeight / imageHeight;
  //     const scale = Math.min(scaleX, scaleY); // Maintain aspect ratio

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

  //   const objScaleX = finalWidth / originalCanvasWidth;
  //   const objScaleY = finalHeight / originalCanvasHeight;
  //   // Apply scaling factors to all other objects
  //   mainCanvasRef.current.getObjects().forEach((obj) => {
  //     if (obj !== currentImageRef.current) {
  //       obj.scaleX *= objScaleX;
  //       obj.scaleY *= objScaleY;
  //       obj.left *= objScaleX;
  //       obj.top *= objScaleY;
  //       obj.setCoords();
  //     }
  //   });

  //   mainCanvasRef.current.renderAll();
  // };

  const handleContainerResize = () => {
    const container = document.getElementById("CanvasContainer");
    if (!container || !mainCanvasRef.current || !currentImageRef.current)
      return;

    const { width: containerWidth, height: containerHeight } =
      container.getBoundingClientRect();

    // setCurrentContDim({
    //   contWidth: containerWidth,
    //   contHeight: containerHeight,
    // });
    setMapState({ ...mapState, scale: 0.9 });
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

      setCurrentContDim({
        contHeight: containerHeight,
        contWidth: containerWidth,
      });

      const initCanvas = new fabric.Canvas(canvasRef.current, {
        width: containerWidth,
        height: containerHeight,
      });

      initCanvas.backgroundColor = "#fff";

      const savedData = localStorage.getItem("project_data");
      if (savedData) {
        try {
          const canvasJSON = JSON.parse(savedData);
          canvasJSON.objects.forEach((obj) => {
            if (obj.type === "Image") {
              obj.crossOrigin = "anonymous";
            }
          });
          console.log(canvasJSON);
          const ensureSingleCallback = (canvas: fabric.Canvas) => {
            const objects = canvas.getObjects();
            const totalObjects = canvasJSON.objects?.length || 0;

            return new Promise<void>((resolve) => {
              if (objects.length === totalObjects) {
                // All objects are loaded
                resolve();
              } else {
                // Listen for objects being added to the canvas
                const checkIfComplete = () => {
                  if (canvas.getObjects().length === totalObjects) {
                    canvas.off("object:added", checkIfComplete); // Remove listener
                    resolve();
                  }
                };

                canvas.on("object:added", checkIfComplete);
              }
            });
          };

          initCanvas.loadFromJSON(canvasJSON, async () => {
            // Wait until all objects are fully added
            await ensureSingleCallback(initCanvas);

            // Retrieve the image object if it exists
            const imageObject = initCanvas
              .getObjects()
              .find((obj: fabric.Object) => obj.type === "image");

            if (imageObject) {
              imageObject.selectable = false; // Example: Make the image non-selectable
              imageObject.hoverCursor = "default"; // Example: Change cursor on hover
              imageObject.crossOrigin = "anonymous";

              const imageWidth = imageObject.width ?? 1;
              const imageHeight = imageObject.height ?? 1;

              const needsScaling =
                imageWidth > containerWidth || imageHeight > containerHeight;

              if (needsScaling) {
                const scaleX = containerWidth / imageWidth;
                const scaleY = containerHeight / imageHeight;
                const scale = Math.min(scaleX, scaleY);

                imageObject.scale(scale); // Scale the image
              }

              const finalWidth = needsScaling
                ? imageObject.getScaledWidth()
                : imageWidth;
              const finalHeight = needsScaling
                ? imageObject.getScaledHeight()
                : imageHeight;

              initCanvas.setDimensions({
                width: finalWidth,
                height: finalHeight,
              });
              imageObject.set({
                left: 0,
                top: 0,
                selectable: false,
                hoverCursor: "default",
              });

              initCanvas.getObjects().forEach((obj) => {
                if (obj !== imageObject) {
                  // Ensure the image is excluded
                  const scalingFactorX =
                    (imageObject.width || 1) / imageObject.getScaledWidth();
                  const scalingFactorY =
                    (imageObject.height || 1) / imageObject.getScaledHeight();

                  obj.scaleX /= scalingFactorX;
                  obj.scaleY /= scalingFactorY;
                  obj.left /= scalingFactorX;
                  obj.top /= scalingFactorY;
                  obj.setCoords(); // Update coordinates
                }
              });
            }

            initCanvas.renderAll();
            currentImageRef.current = imageObject; // Store the Fabric.js image object reference
            mainCanvasRef.current = initCanvas; // Store the Fabric.js canvas reference
            initCanvas.renderAll();
            console.log("Canvas fully loaded and rendered.");
            canvasIdRef.current = localStorage.getItem("canvasId");
            localStorage.removeItem("project_data");
            localStorage.removeItem("canvasId");
          });
        } catch (error) {
          console.error("Failed to load canvas data:", error);
        }
      } else {
        fabric.FabricImage.fromURL(imageUrl).then((img) => {
          const imageWidth = img.width ?? 1;
          const imageHeight = img.height ?? 1;

          setCurrentImageDim({
            imageWidth: imageWidth,
            imageHeight: imageHeight,
          });

          const needsScaling =
            imageWidth > containerWidth || imageHeight > containerHeight;

          if (needsScaling) {
            const scaleX = containerWidth / imageWidth;
            const scaleY = containerHeight / imageHeight;
            const scale = Math.min(scaleX, scaleY);

            img.scale(scale); // Scale the image
          }

          const finalWidth = needsScaling ? img.getScaledWidth() : imageWidth;
          const finalHeight = needsScaling
            ? img.getScaledHeight()
            : imageHeight;

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

          const mapX = containerWidth / 2 - finalWidth / 2;
          setMapState({ ...mapState, translation: { x: mapX, y: 0 } });
        });
      }

      return () => {
        initCanvas.dispose();
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
        }
      };
    }
  }, []);

  useEffect(() => {
    if (mainCanvasRef.current) {
      if (sidebarName !== "PenTool") {
        mainCanvasRef.current.isDrawingMode = false;
      }
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
            <MapInteractionCSS
              value={mapState}
              onChange={(newMapState) => setMapState(newMapState)}
              disablePan={true}
            >
              <canvas id="canvas" className="z-1" ref={canvasRef}></canvas>
            </MapInteractionCSS>
          </div>

          {/* <TransformWrapper
            panning={{ disabled: false }}
            pinch={{ disabled: true }}
          >
            <div
              className="w-[90%] h-[90%] flex justify-center items-center"
              id="CanvasContainer"
            >
              <TransformComponent>
                <canvas id="canvas" className="z-1" ref={canvasRef}></canvas>
              </TransformComponent>
            </div>
          </TransformWrapper> */}
        </div>
        {/* Footer */}
        <div className="flex flex-none w-full">
          <Footer
            canvas={mainCanvasRef.current!}
            image={currentImageRef.current!}
            canvasId={canvasIdRef.current}
            imageUrl={imageUrl}
            mapState={mapState}
            setMapState={setMapState}
          />
        </div>
      </div>
    </div>
  );
};

export default Test;
