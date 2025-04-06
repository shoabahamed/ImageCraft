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

import { MapInteractionCSS } from "react-map-interaction";
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
import Footer2 from "@/components/Footer2";

// TODO: set the image size at max to be some value possibly 2048X2048
// TODO: I just realized something the way I am reloading a project from projects is very bad. It makes handling all the cases very difficult I think if we set the image src to '' then send the actual base64 to backend and save as a image then it would very efficient. Same with background image if we do this we do not need to mantain all this complete stuff like scale, dimensions etc everything would be handled by fabric js iteself

const override: CSSProperties = {
  borderWidth: "5px",
};

const Temp = () => {
  const sidebarName = useCommonProps((state) => state.sidebarName);
  const setSidebarName = useCommonProps((state) => state.setSidebarName);
  const setProjectName = useCommonProps((state) => state.setProjectName);
  const setShowUpdateButton = useCommonProps(
    (state) => state.setShowUpdateButton
  );

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

  const { setCurrentImageDim, setCurrentContDim, setLoadedFromSaved } =
    useCanvasObjects();

  const [mapState, setMapState] = useState({
    scale: 1,
    translation: { x: 100, y: 0 },
  });

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

      fabric.FabricImage.fromURL(imageUrl).then(async (img) => {
        img.set({
          left: containerWidth / 2,
          top: containerHeight / 2,
          selectable: false,
          hoverCursor: "default",
          originX: "center",
          originY: "center",
        });

        initCanvas.add(img);
        initCanvas.renderAll();
        currentImageRef.current = img;

        mainCanvasRef.current = initCanvas;

        unsubscribeRef.current = subscribeToAdjustStore(initCanvas, img);
      });

      initCanvas.on("mouse:wheel", function (opt) {
        const delta = opt.e.deltaY;
        let zoom = initCanvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        initCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        // initCanvas.setZoom(zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();

        // const vpt = this.viewportTransform;

        // if (zoom < 400 / 1000) {
        //   vpt[4] = 200 - (1000 * zoom) / 2;
        //   vpt[5] = 200 - (1000 * zoom) / 2;
        // } else {
        //   if (vpt[4] >= 0) {
        //     vpt[4] = 0;
        //   } else if (vpt[4] < initCanvas.getWidth() - 1000 * zoom) {
        //     vpt[4] = initCanvas.getWidth() - 1000 * zoom;
        //   }
        //   if (vpt[5] >= 0) {
        //     vpt[5] = 0;
        //   } else if (vpt[5] < initCanvas.getHeight() - 1000 * zoom) {
        //     vpt[5] = initCanvas.getHeight() - 1000 * zoom;
        //   }
        // }
      });

      // initCanvas.on("mouse:down", function (opt) {
      //   const evt = opt.e;
      //   if (evt.altKey === true) {
      //     this.isDragging = true;
      //     this.selection = false;
      //     this.lastPosX = evt.clientX;
      //     this.lastPosY = evt.clientY;
      //   }
      // });
      // initCanvas.on("mouse:move", function (opt) {
      //   if (this.isDragging) {
      //     const e = opt.e;
      //     const vpt = this.viewportTransform;
      //     vpt[4] += e.clientX - this.lastPosX;
      //     vpt[5] += e.clientY - this.lastPosY;
      //     this.requestRenderAll();
      //     this.lastPosX = e.clientX;
      //     this.lastPosY = e.clientY;
      //   }
      // });
      // initCanvas.on("mouse:up", function (opt) {
      //   // on mouse up we want to recalculate new interaction
      //   // for all objects, so we call setViewportTransform
      //   this.setViewportTransform(this.viewportTransform);
      //   this.isDragging = false;
      //   this.selection = true;
      // });

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
          // initCanvas.setZoom(zoom);
          opt.e.preventDefault();
          opt.e.stopPropagation();

          // const vpt = this.viewportTransform;

          // if (zoom < 400 / 1000) {
          //   vpt[4] = 200 - (1000 * zoom) / 2;
          //   vpt[5] = 200 - (1000 * zoom) / 2;
          // } else {
          //   if (vpt[4] >= 0) {
          //     vpt[4] = 0;
          //   } else if (vpt[4] < initCanvas.getWidth() - 1000 * zoom) {
          //     vpt[4] = initCanvas.getWidth() - 1000 * zoom;
          //   }
          //   if (vpt[5] >= 0) {
          //     vpt[5] = 0;
          //   } else if (vpt[5] < initCanvas.getHeight() - 1000 * zoom) {
          //     vpt[5] = initCanvas.getHeight() - 1000 * zoom;
          //   }
          // }
        });

        // initCanvas.off("mouse:down", function (opt) {
        //   const evt = opt.e;
        //   if (evt.altKey === true) {
        //     this.isDragging = true;
        //     this.selection = false;
        //     this.lastPosX = evt.clientX;
        //     this.lastPosY = evt.clientY;
        //   }
        // });
        // initCanvas.off("mouse:move", function (opt) {
        //   if (this.isDragging) {
        //     const e = opt.e;
        //     const vpt = this.viewportTransform;
        //     vpt[4] += e.clientX - this.lastPosX;
        //     vpt[5] += e.clientY - this.lastPosY;
        //     this.requestRenderAll();
        //     this.lastPosX = e.clientX;
        //     this.lastPosY = e.clientY;
        //   }
        // });
        // initCanvas.off("mouse:up", function (opt) {
        //   // on mouse up we want to recalculate new interaction
        //   // for all objects, so we call setViewportTransform
        //   this.setViewportTransform(this.viewportTransform);
        //   this.isDragging = false;
        //   this.selection = true;
        // });
      };
    }
  }, []);

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
          </div>
        </div>

        {/* Main Section */}
        <div className="flex-1 h-full flex flex-col">
          {/* Design Section */}
          <div className="flex-1 w-full flex items-center justify-center">
            <div
              className="w-[95%] h-[95%] flex justify-center items-center"
              id="CanvasContainer"
            >
              <canvas id="canvas" className="z-1" ref={canvasRef}></canvas>
            </div>
          </div>
          {/* Footer */}
          <div className="flex-none w-full">
            <Footer2
              canvas={mainCanvasRef.current!}
              image={currentImageRef.current!}
              backupImage={backupCurrentImageRef.current}
              canvasId={canvasIdRef.current}
              imageUrl={imageUrl}
              mapState={mapState}
              setMapState={setMapState}
              setLoadState={setSpinnerLoading}
            />
          </div>
          {/* <div className="flex-none">skdjfksd</div> */}
        </div>
      </div>
    </div>
  );
};

export default Temp;
