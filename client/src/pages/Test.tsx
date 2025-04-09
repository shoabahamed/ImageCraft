import IconComponent from "@/components/icon-component";

import { Diamond, Home } from "lucide-react";
import { Crop, RotateCwSquare, ListPlus, Type, Cpu } from "lucide-react";
import { useEffect, useRef, useState, CSSProperties } from "react";

import * as fabric from "fabric";
import { useLocation, useNavigate } from "react-router-dom";
import AdjustSidebar from "@/components/AdjustSidebar";
import AddText from "@/components/AddText";
import Arrange from "@/components/Arrange";
import CropSidebar from "@/components/CropSidebar";

import Footer from "@/components/Footer";

import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";

import ClipLoader from "react-spinners/ClipLoader";
import { useCommonProps } from "@/hooks/appStore/CommonProps";
import AddShape from "@/components/AddShape";
import AITools2 from "@/components/AITools2";
import Navbar from "@/components/Navbar";
import {
  applyFiltersFromDatabase,
  subscribeToAdjustStore,
} from "@/hooks/appStore/applyFilterSubscriber";
import { useArrangeStore } from "@/hooks/appStore/ArrangeStore";
import { set } from "react-hook-form";
import { getRotatedBoundingBox } from "@/utils/commonFunctions";

// TODO: set the image size at max to be some value possibly 2048X2048
// TODO: I just realized something the way I am reloading a project from projects is very bad. It makes handling all the cases very difficult I think if we set the image src to '' then send the actual base64 to backend and save as a image then it would very efficient. Same with background image if we do this we do not need to mantain all this complete stuff like scale, dimensions etc everything would be handled by fabric js iteself

const override: CSSProperties = {
  borderWidth: "5px",
};

const Test = () => {
  const sidebarName = useCommonProps((state) => state.sidebarName);
  const setCurrentFilters = useCommonProps((state) => state.setCurrentFilters);
  const setSidebarName = useCommonProps((state) => state.setSidebarName);
  const setProjectName = useCommonProps((state) => state.setProjectName);
  const setShowUpdateButton = useCommonProps(
    (state) => state.setShowUpdateButton
  );
  const currentFilters = useCommonProps((state) => state.currentFilters);
  const currentFiltersRef = useRef(currentFilters);
  const setFlipX = useArrangeStore((state) => state.setFlipX);
  const setFlipY = useArrangeStore((state) => state.setFlipY);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mainCanvasRef = useRef<fabric.Canvas | null>(null);
  const currentImageRef = useRef<fabric.FabricImage | null>(null); // Use ref for currentImage
  const [databaseFilters, setDatabaseFilters] = useState<object[] | null>(null);
  const backupCurrentImageRef = useRef<fabric.FabricImage | null>(null); // Use ref for currentImage
  const unsubscribeRef = useRef<() => void>();

  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const imageUrlFromState = useLocation().state?.imageUrl;
  // const idFromState = useLocation().state?.canvasId;
  const idFromState = localStorage.getItem("CanvasId");

  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState(imageUrlFromState || "./test3.png");

  const canvasIdRef = useRef(idFromState || crypto.randomUUID());

  const {
    setOriginalImageDimensions,
    setFinalImageDimensions,
    setLoadedFromSaved,
    setZoomValue,
    finalImageDimensions,
    zoomValue,
  } = useCanvasObjects();

  const setImageRotation = useArrangeStore((state) => state.setImageRotation);

  const [spinnerLoading, setSpinnerLoading] = useState(false);

  const handleContainerResize = () => {
    const container = document.getElementById("CanvasContainer");
    if (!container || !mainCanvasRef.current || !currentImageRef.current)
      return;

    const { width: containerWidth, height: containerHeight } =
      container.getBoundingClientRect();

    mainCanvasRef.current.setDimensions({
      width: containerWidth,
      height: containerHeight,
    });

    // Get current image size (NOT scaled size, actual size)
    const img = currentImageRef.current;
    const imageWidth = img.width ?? 1;
    const imageHeight = img.height ?? 1;

    // Recalculate zoom to fit
    const scaleX = containerWidth / imageWidth;
    const scaleY = containerHeight / imageHeight;
    const zoom = Math.min(scaleX, scaleY);

    mainCanvasRef.current.setZoom(zoom);
    setZoomValue(zoom);

    // Re-center the image using viewport transform
    const vp = mainCanvasRef.current.viewportTransform!;
    vp[4] = (containerWidth - imageWidth * zoom) / 2; // translateX
    vp[5] = (containerHeight - imageHeight * zoom) / 2; // translateY
    mainCanvasRef.current.setViewportTransform(vp);

    console.log(getRotatedBoundingBox(currentImageRef.current));

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
        width: containerWidth,
        height: containerHeight,
      });

      initCanvas.backgroundColor = "#fff";

      const savedData = localStorage.getItem("project_data");
      console.log(JSON.stringify(savedData));

      if (savedData) {
        console.log("before loading");
        const finalImageShape: { width: number; height: number } = JSON.parse(
          localStorage.getItem("final_image_shape")!
        );

        const projectName = localStorage.getItem("project_name");

        try {
          const canvasJSON = JSON.parse(savedData);
          canvasJSON.objects.forEach((obj) => {
            if (obj.type === "Image") {
              obj.crossOrigin = "anonymous";
            }
          });

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

            const imageObject = initCanvas
              .getObjects()
              .find((obj: fabric.Object) => obj.type.toLowerCase() === "image");

            const frameObject = initCanvas
              .getObjects() // @ts-ignore
              .find((obj) => obj.name?.startsWith("Frame"));

            if (imageObject) {
              console.log(imageObject);

              // @ts-ignore
              imageObject.crossOrigin = "anonymous";

              setOriginalImageDimensions({
                imageWidth: imageObject.width,
                imageHeight: imageObject.height,
              });

              setFinalImageDimensions({
                imageWidth: finalImageShape.width,
                imageHeight: finalImageShape.height,
              });

              initCanvas.setDimensions({
                width: containerWidth,
                height: containerHeight,
              });

              setImageRotation(imageObject.angle);

              // Calculate zoom to fit image in canvas while maintaining aspect ratio
              const scaleX = containerWidth / imageObject.width;
              const scaleY = containerHeight / imageObject.height;
              const zoom = Math.min(scaleX, scaleY);

              // Apply zoom to canvas
              initCanvas.setZoom(zoom);
              setZoomValue(zoom);

              // Calculate the viewport transform to center the image
              const vp = initCanvas.viewportTransform!;
              vp[4] = (containerWidth - imageObject.width * zoom) / 2; // translateX
              vp[5] = (containerHeight - imageObject.height * zoom) / 2; // translateY
              initCanvas.setViewportTransform(vp);

              imageObject.set({
                left: imageObject.width / 2,
                top: imageObject.height / 2,
                selectable: false,
                hoverCursor: "default",
                originX: "center",
                originY: "center",
              });

              //@ts-ignore
              unsubscribeRef.current = subscribeToAdjustStore(
                initCanvas,
                imageObject,
                currentFiltersRef,
                setCurrentFilters
              );

              setDatabaseFilters(canvasJSON.objects[0].filters);
            }

            if (frameObject) {
              imageObject.clipPath = null;
              frameObject.absolutePositioned = true;
              // selectedObject.absolutePositioned = true;
              imageObject.clipPath = frameObject;
            }

            // @ts-ignore
            currentImageRef.current = imageObject; // Store the Fabric.js image object reference
            mainCanvasRef.current = initCanvas; // Store the Fabric.js canvas reference
            setFlipX(imageObject.flipX);
            setFlipY(imageObject.flipY);

            initCanvas.renderAll();
            console.log("sdjf");

            canvasIdRef.current = localStorage.getItem("canvasId")!;
            localStorage.removeItem("project_data");
            localStorage.removeItem("CanvasId");

            setProjectName(projectName);
            setShowUpdateButton(true);

            setLoadedFromSaved(true);

            if (idFromState) {
              canvasIdRef.current = idFromState;
            }
          });
          // localStorage.removeItem("CanvasId");
          // localStorage.removeItem("project_data");
        } catch (error) {
          console.error("Failed to load canvas data:", error);
        }
      } else {
        fabric.FabricImage.fromURL(imageUrl).then(async (img) => {
          const imageWidth = img.width ?? 1;
          const imageHeight = img.height ?? 1;

          setOriginalImageDimensions({
            imageWidth: imageWidth,
            imageHeight: imageHeight,
          });

          setFinalImageDimensions({
            imageWidth: imageWidth,
            imageHeight: imageHeight,
          });

          initCanvas.setDimensions({
            width: containerWidth,
            height: containerHeight,
          });

          // Calculate zoom to fit image in canvas while maintaining aspect ratio
          const scaleX = containerWidth / imageWidth;
          const scaleY = containerHeight / imageHeight;
          const zoom = Math.min(scaleX, scaleY);

          // Apply zoom to canvas
          initCanvas.setZoom(zoom);
          setZoomValue(zoom);

          // Calculate the viewport transform to center the image
          const vp = initCanvas.viewportTransform!;
          vp[4] = (containerWidth - imageWidth * zoom) / 2; // translateX
          vp[5] = (containerHeight - imageHeight * zoom) / 2; // translateY
          initCanvas.setViewportTransform(vp);

          img.set({
            left: imageWidth / 2,
            top: imageHeight / 2,
            selectable: false,
            hoverCursor: "default",
            originX: "center",
            originY: "center",
          });

          initCanvas.add(img);
          initCanvas.renderAll();
          currentImageRef.current = img; // Set the ref directly
          setFlipX(img.flipX);
          setFlipY(img.flipY);

          mainCanvasRef.current = initCanvas;
          // await backupImage();
          setSidebarName("Arrange");

          //@ts-ignore
          unsubscribeRef.current = subscribeToAdjustStore(
            initCanvas,
            img,
            currentFiltersRef,
            setCurrentFilters
          );
        });
      }

      initCanvas.on("mouse:wheel", function (opt) {
        const delta = opt.e.deltaY;
        let zoom = initCanvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        initCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        setZoomValue(zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
      });

      return () => {
        initCanvas.dispose();
        if (unsubscribeRef.current) unsubscribeRef.current();
        if (resizeObserverRef.current) resizeObserverRef.current.disconnect();

        initCanvas.off("mouse:wheel", function (opt) {
          const delta = opt.e.deltaY;
          let zoom = initCanvas.getZoom();
          zoom *= 0.999 ** delta;
          if (zoom > 20) zoom = 20;
          if (zoom < 0.01) zoom = 0.01;
          initCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
          setZoomValue(zoom);
          opt.e.preventDefault();
          opt.e.stopPropagation();
        });
      };
    }
  }, []);

  useEffect(() => {
    currentFiltersRef.current = currentFilters;
  }, [currentFilters]);

  return (
    <div className="h-screen max-w-screen flex flex-col">
      <Navbar />
      <div className="w-full flex-1 flex items-center relative">
        {/* Full-screen overlay */}
        {spinnerLoading && (
          <div className="fixed w-full h-full top-0 left-0 z-50 flex bg-black opacity-40 justify-center items-center">
            <ClipLoader
              color={"#3B82F6"}
              loading={spinnerLoading}
              cssOverride={override}
              size={70}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </div>
        )}
        {/* Sidebar */}
        <div
          className={`flex items-center h-full ${sidebarName ? "w-[25%]" : ""}`}
        >
          <nav className="flex flex-col h-full gap-5 justify-center items-center border-slate-800 border-r-2 rounded-none">
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
              icon={<Diamond />}
              iconName="Shape"
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
                <div className="max-h-[580px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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

            {sidebarName === "Shape" && (
              <div className="w-full h-full">
                <div className="w-full abosulte py-3 text-center italic text-xl font-bold text-slate-300 top-0 left-0">
                  Add Shapes
                </div>
                <div className="max-h-[580px]  overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <AddShape canvas={mainCanvasRef.current!} />
                </div>
              </div>
            )}

            {sidebarName === "Adjust" && (
              <div className="w-full h-full">
                <div className="w-full abosulte py-3 text-center italic text-xl font-bold text-slate-300 top-0 left-0">
                  Adjust
                </div>
                <div className="max-h-[580px] overflow-hidden  overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <AdjustSidebar
                    canvas={mainCanvasRef.current!}
                    image={currentImageRef.current!}
                    databaseFilters={databaseFilters}
                    setDatabaseFilters={setDatabaseFilters}
                  />
                </div>
              </div>
            )}

            {sidebarName === "Text" && (
              <div className="w-full h-full">
                <div className="w-full abosulte py-3 text-center italic text-xl font-bold text-slate-300 top-0 left-0">
                  Text
                </div>
                <div className="max-h-[580px]  overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <AddText canvas={mainCanvasRef.current!} />
                </div>
              </div>
            )}

            {sidebarName === "AI" && (
              <div className="w-full h-full">
                <div className="w-full abosulte py-3 text-center italic text-xl font-bold text-slate-300 top-0 left-0">
                  AI TOOLS
                </div>
                <div className="max-h-[580px]  overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <AITools2
                    canvas={mainCanvasRef.current!}
                    imageRef={currentImageRef!}
                    imageUrl={imageUrl}
                    setLoadSate={setSpinnerLoading}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Section */}
        <div className="flex-1 h-full flex flex-col">
          {/* Design Section */}
          <div className="flex-1 w-full flex items-center justify-center">
            <div
              className="w-[90%] h-[90%] flex justify-center items-center"
              id="CanvasContainer"
            >
              <canvas id="canvas" className="z-1" ref={canvasRef}></canvas>
            </div>
          </div>
          {/* Footer */}
          <div className="relative flex-none w-full">
            <div className="absolute -top-5 left-0 bg-gray-800 text-white text-xs px-6 py-0.5 shadow z-50 pointer-events-none">
              {finalImageDimensions.imageWidth}X
              {finalImageDimensions.imageHeight}@{Math.round(zoomValue * 100)}%
            </div>

            <Footer
              canvas={mainCanvasRef.current!}
              image={currentImageRef.current!}
              backupImage={backupCurrentImageRef.current}
              canvasId={canvasIdRef.current}
              imageUrl={imageUrl}
              setLoadState={setSpinnerLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test;
