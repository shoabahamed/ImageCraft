import IconComponent from "@/components/icon-component";

import { Diamond, Home } from "lucide-react";
import { RotateCwSquare, Type } from "lucide-react";
import { useEffect, useRef, useState, CSSProperties } from "react";

import * as fabric from "fabric";
import { useNavigate } from "react-router-dom";

import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";

import ClipLoader from "react-spinners/ClipLoader";
import { useCommonProps } from "@/hooks/appStore/CommonProps";
import Navbar from "@/components/Navbar";

import { useArrangeStore } from "@/hooks/appStore/ArrangeStore";

import useUndoRedo from "@/hooks/useUndoRedo";

import { useShapeStore } from "@/hooks/appStore/ShapeStore";

import useAddTextStore from "@/hooks/appStore/AddTextStore";

import AddTextAdmin from "@/components/AddTextAdmin";
import AddShapeAdminAdmin from "@/components/AddShapeAdming";
import ArrangeAdmin from "@/components/ArrangeAdmin";
import FooterAdmin from "@/components/FooterAdmin";

const override: CSSProperties = {
  borderWidth: "5px",
};

const TemplateUpload = () => {
  const sidebarName = useCommonProps((state) => state.sidebarName);

  const setSidebarName = useCommonProps((state) => state.setSidebarName);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mainCanvasRef = useRef<fabric.Canvas | null>(null);

  const navigate = useNavigate();

  const [spinnerLoading, setSpinnerLoading] = useState(false);

  const {
    disableSavingIntoStackRef,
    downloadImageDimensions,
    setDownloadImageDimensions,
    downloadImageDimensionsRef,
    setSelectedObject,
  } = useCanvasObjects();

  const { setZoomValue, zoomValue } = useCanvasObjects();

  const setBackgroundColor = useArrangeStore(
    (state) => state.setBackgroundColor
  );

  const [
    currentHistoryIndex,
    currentSnapshot,
    setHistoryValue,
    undo,
    redo,
    isUndoRedoAction,
  ] = useUndoRedo(50);

  // shape properties
  const setShapeType = useShapeStore((state) => state.setShapeType);

  const setRectFill = useShapeStore((state) => state.setRectFill);
  const setCircleFill = useShapeStore((state) => state.setCircleFill);
  const setTriangleFill = useShapeStore((state) => state.setTriangleFill);
  const setLineStroke = useShapeStore((state) => state.setLineStroke);

  const setRectWidth = useShapeStore((state) => state.setRectWidth);
  const setRectHeight = useShapeStore((state) => state.setRectHeight);
  const setRectOpacity = useShapeStore((state) => state.setRectOpacity);
  const setTriangleWidth = useShapeStore((state) => state.setTriangleWidth);
  const setTriangleHeight = useShapeStore((state) => state.setTriangleHeight);
  const setTriangleOpacity = useShapeStore((state) => state.setTriangleOpacity);
  const setLineStrokeWidth = useShapeStore((state) => state.setLineStrokeWidth);
  const setLineOpacity = useShapeStore((state) => state.setLineOpacity);
  const setCircleStroke = useShapeStore((state) => state.setCircleStroke);
  const setCircleStrokeWidth = useShapeStore(
    (state) => state.setCircleStrokeWidth
  );

  const setCircleRadius = useShapeStore((state) => state.setCircleRadius);
  const setCircleOpacity = useShapeStore((state) => state.setCircleOpacity);

  const setRectStroke = useShapeStore((state) => state.setRectStroke);
  const setRectStrokeWidth = useShapeStore((state) => state.setRectStrokeWidth);

  const setTriangleStroke = useShapeStore((state) => state.setTriangleStroke);
  const setTriangleStrokeWidth = useShapeStore(
    (state) => state.setTriangleStrokeWidth
  );

  const setShadowEnabled = useShapeStore((state) => state.setShadowEnabled);
  const setShadowColor = useShapeStore((state) => state.setShadowColor);
  const setShadowBlur = useShapeStore((state) => state.setShadowBlur);
  const setShadowOffsetX = useShapeStore((state) => state.setShadowOffsetX);
  const setShadowOffsetY = useShapeStore((state) => state.setShadowOffsetY);

  const setRectSkewX = useShapeStore((state) => state.setRectSkewX);
  const setRectSkewY = useShapeStore((state) => state.setRectSkewY);

  const setTriangleSkewX = useShapeStore((state) => state.setTriangleSkewX);
  const setTriangleSkewY = useShapeStore((state) => state.setTriangleSkewY);

  const setLineSkewX = useShapeStore((state) => state.setLineSkewX);
  const setLineSkewY = useShapeStore((state) => state.setLineSkewY);

  const setCircleSkewX = useShapeStore((state) => state.setCircleSkewX);
  const setCircleSkewY = useShapeStore((state) => state.setCircleSkewY);

  // text properties
  const setTextValue = useAddTextStore((state) => state.setTextValue);
  const setTextColorValue = useAddTextStore((state) => state.setTextColorValue);
  const setTextFont = useAddTextStore((state) => state.setTextFont);
  const setTextSize = useAddTextStore((state) => state.setTextSize);
  const setTextOpacity = useAddTextStore((state) => state.setTextOpacity);
  const setTextLineSpacing = useAddTextStore(
    (state) => state.setTextLineSpacing
  );
  const setTextAlignValue = useAddTextStore((state) => state.setTextAlignValue);
  const setUpper = useAddTextStore((state) => state.setUpper);
  const setItalic = useAddTextStore((state) => state.setItalic);
  const setBold = useAddTextStore((state) => state.setBold);
  const setUnderLine = useAddTextStore((state) => state.setUnderLine);

  const setCharSpacing = useAddTextStore((state) => state.setCharSpacing);

  const setTextShadowEnabled = useAddTextStore(
    (state) => state.setShadowEnabled
  );
  const setTextShadowColor = useAddTextStore((state) => state.setShadowColor);
  const setTextShadowBlur = useAddTextStore((state) => state.setShadowBlur);
  const setTextShadowOffsetX = useAddTextStore(
    (state) => state.setShadowOffsetX
  );
  const setTextShadowOffsetY = useAddTextStore(
    (state) => state.setShadowOffsetY
  );

  // this function runs whenever the window size changes
  // const handleContainerResize = () => {
  //   const container = document.getElementById("CanvasContainer");
  //   if (!container || !mainCanvasRef.current || !currentImageRef.current)
  //     return;

  //   const { width: containerWidth, height: containerHeight } =
  //     container.getBoundingClientRect();

  //   mainCanvasRef.current.setDimensions({
  //     width: containerWidth,
  //     height: containerHeight,
  //   });

  //   // Get current image size (NOT scaled size, actual size)
  //   const img = currentImageRef.current;
  //   const imageWidth = img.width ?? 1;
  //   const imageHeight = img.height ?? 1;

  //   // Recalculate zoom to fit
  //   const scaleX = containerWidth / imageWidth;
  //   const scaleY = containerHeight / imageHeight;
  //   const zoom = Math.min(scaleX, scaleY);

  //   mainCanvasRef.current.setZoom(zoom);
  //   setZoomValue(zoom);

  //   // Re-center the image using viewport transform
  //   const vp = mainCanvasRef.current.viewportTransform!;
  //   vp[4] = (containerWidth - imageWidth * zoom) / 2; // translateX
  //   vp[5] = (containerHeight - imageHeight * zoom) / 2; // translateY
  //   mainCanvasRef.current.setViewportTransform(vp);

  //   mainCanvasRef.current.renderAll();
  // };

  const handleObjectSelected = () => {
    const activeObject = mainCanvasRef.current.getActiveObject();
    if (activeObject) {
      setSelectedObject(activeObject);

      switch (activeObject.type) {
        case "rect":
          setRectWidth(activeObject.width || 100);
          setRectHeight(activeObject.height || 60);
          setRectFill(activeObject.fill as string);
          setRectStroke(activeObject.stroke as string);
          setRectStrokeWidth(activeObject.strokeWidth || 1);
          setRectOpacity(activeObject.opacity || 1);
          setRectSkewX(activeObject.skewX || 0);
          setRectSkewY(activeObject.skewY || 0);
          setShadowEnabled(activeObject.shadow ? true : false);
          setShadowColor(activeObject.shadow?.color || "#000");
          setShadowBlur(activeObject.shadow?.blur || 0);
          setShadowOffsetX(activeObject.shadow?.offsetX || 0);
          setShadowOffsetY(activeObject.shadow?.offsetY || 0);
          break;

        case "circle":
          setCircleRadius((activeObject as any).radius || 50);
          setCircleFill(activeObject.fill as string);
          setCircleStroke(activeObject.stroke as string);
          setCircleStrokeWidth(activeObject.strokeWidth || 1);
          setCircleOpacity(activeObject.opacity || 1);
          setCircleSkewX(activeObject.skewX || 0);
          setCircleSkewY(activeObject.skewY || 0);
          setShadowEnabled(activeObject.shadow ? true : false);
          setShadowColor(activeObject.shadow?.color || "#000");
          setShadowBlur(activeObject.shadow?.blur || 0);
          setShadowOffsetX(activeObject.shadow?.offsetX || 0);
          setShadowOffsetY(activeObject.shadow?.offsetY || 0);
          break;

        case "triangle":
          setTriangleWidth(activeObject.width || 60);
          setTriangleHeight(activeObject.height || 60);
          setTriangleFill(activeObject.fill as string);
          setTriangleStroke(activeObject.stroke as string);
          setTriangleStrokeWidth(activeObject.strokeWidth || 1);
          setTriangleOpacity(activeObject.opacity || 1);
          setTriangleSkewX(activeObject.skewX || 0);
          setTriangleSkewY(activeObject.skewY || 0);
          setShadowEnabled(activeObject.shadow ? true : false);
          setShadowColor(activeObject.shadow?.color || "#000");
          setShadowBlur(activeObject.shadow?.blur || 0);
          setShadowOffsetX(activeObject.shadow?.offsetX || 0);
          setShadowOffsetY(activeObject.shadow?.offsetY || 0);
          break;

        case "line":
          setLineStroke(activeObject.stroke as string);
          setLineStrokeWidth(activeObject.strokeWidth || 3);
          setLineOpacity(activeObject.opacity || 1);
          setLineSkewX(activeObject.skewX || 0);
          setLineSkewY(activeObject.skewY || 0);
          setShadowEnabled(activeObject.shadow ? true : false);
          setShadowColor(activeObject.shadow?.color || "#000");
          setShadowBlur(activeObject.shadow?.blur || 0);
          setShadowOffsetX(activeObject.shadow?.offsetX || 0);
          setShadowOffsetY(activeObject.shadow?.offsetY || 0);
          break;

        case "textbox": {
          const textbox = activeObject as fabric.Textbox;
          setSelectedObject(textbox);
          setTextValue(textbox.text || "");
          setTextColorValue(textbox.fill as string);
          setTextSize(textbox.fontSize || 14);
          setTextFont(textbox.fontFamily || "arial");
          setTextOpacity(textbox.opacity || 1);

          setTextAlignValue(textbox.textAlign);
          setTextLineSpacing(textbox.lineHeight);

          setItalic(textbox.fontStyle === "italic" ? true : false);
          setUnderLine(textbox.underline ? true : false);
          setBold(textbox.fontWeight === "bold" ? true : false);
          setUpper(textbox.get("isUpper") || false);
          setCharSpacing(textbox.charSpacing || 0);

          setTextShadowEnabled(textbox.shadow ? true : false);
          setTextShadowColor(textbox.shadow?.color || "#000");
          setTextShadowBlur(textbox.shadow?.blur || 0);
          setTextShadowOffsetX(textbox.shadow?.offsetX || 0);
          setTextShadowOffsetY(textbox.shadow?.offsetY || 0);
          break;
        }
        default:
          break;
      }
    } else {
      setSelectedObject(null);
    }
  };

  const handleTextChanged = () => {
    const activeObject = mainCanvasRef.current.getActiveObject();
    if (activeObject && activeObject.type === "textbox") {
      const textbox = activeObject as fabric.Textbox;
      setTextValue(textbox.text || "");
    }
  };

  const hanldeObjectScaled = () => {
    const activeObject = mainCanvasRef.current.getActiveObject();
    console.log("scaling obnject");
    if (activeObject) {
      setSelectedObject(activeObject); // Update the context with the selected object
    }
  };

  const handleObjectDeselected = () => {
    setSelectedObject(null);
  };

  // the below code is responsible for handling canvas and image loading
  useEffect(() => {
    if (canvasRef.current) {
      setSidebarName("Arrange");
      const container = document.getElementById("CanvasContainer");
      if (!container) return;

      const { width: containerWidth, height: containerHeight } =
        container.getBoundingClientRect();

      const initCanvas = new fabric.Canvas(canvasRef.current, {
        width: containerWidth,
        height: containerHeight,
      });

      initCanvas.backgroundColor = "#111111";

      initCanvas.renderAll();
      mainCanvasRef.current = initCanvas;

      setDownloadImageDimensions({
        imageWidth: containerWidth,
        imageHeight: containerHeight,
      });

      downloadImageDimensionsRef.current = {
        imageWidth: containerWidth,
        imageHeight: containerHeight,
      };

      const canvasData = initCanvas.toObject(["name", "isUpper", "id"]);

      const allData = {
        project_data: canvasData,
      };

      setHistoryValue(allData);

      initCanvas.on("mouse:wheel", function (opt) {
        const delta = opt.e.deltaY;
        let zoom = initCanvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01; //@ts-ignore
        initCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        setZoomValue(zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
      });

      initCanvas.on("object:scaling", hanldeObjectScaled);
      initCanvas.on("text:changed", handleTextChanged);
      initCanvas.on("selection:created", handleObjectSelected);
      initCanvas.on("selection:updated", handleObjectSelected);

      initCanvas.on("selection:cleared", handleObjectDeselected);

      return () => {
        initCanvas.dispose();

        initCanvas.off("mouse:wheel", function (opt) {
          const delta = opt.e.deltaY;
          let zoom = initCanvas.getZoom();
          zoom *= 0.999 ** delta;
          if (zoom > 20) zoom = 20;
          if (zoom < 0.01) zoom = 0.01; //@ts-ignore
          initCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
          setZoomValue(zoom);
          opt.e.preventDefault();
          opt.e.stopPropagation();
        });

        initCanvas.off("object:scaling", hanldeObjectScaled);

        initCanvas.off("selection:created", handleObjectSelected);
        initCanvas.off("selection:updated", handleObjectSelected);
        initCanvas.off("selection:cleared", handleObjectDeselected);
        initCanvas.off("text:changed", handleTextChanged);

        // initCanvas.off("object:modified", handleObjectModifiedTemp);
      };
    }
  }, []);

  const handleObjectModified = () => {
    if (disableSavingIntoStackRef.current) return;

    // Only save to stack if it's not a filter update
    console.log("object modified from undo redo");
    const canvasData = mainCanvasRef.current.toObject([
      "name",
      "isUpper",
      "id",
    ]);

    const allData = {
      project_data: canvasData,
    };

    setHistoryValue(allData);
  };

  useEffect(() => {
    if (!mainCanvasRef.current) return;

    const canvas = mainCanvasRef.current;
    canvas.on("object:modified", handleObjectModified);
    canvas.on("object:added", handleObjectModified);
    canvas.on("object:removed", handleObjectModified);

    return () => {
      canvas.off("object:modified", handleObjectModified);
      canvas.off("object:added", handleObjectModified);
      canvas.off("object:removed", handleObjectModified);
    };
  }, [handleObjectModified]);

  useEffect(() => {
    if (!isUndoRedoAction.current) return;

    setSpinnerLoading(true);
    setSelectedObject(null);
    setShapeType(null);

    const canvasJSON = currentSnapshot.project_data;

    console.log(currentHistoryIndex, "history index");

    const oldCanvas = mainCanvasRef.current;

    // 1. Preserve container reference
    const container = oldCanvas.wrapperEl?.parentNode;

    // 2. Get raw HTML canvas element
    const htmlCanvas = oldCanvas.lowerCanvasEl;

    // 3. Dispose old instance PROPERLY
    oldCanvas.dispose();

    // 4. Create new canvas on SAME DOM element
    const newCanvas = new fabric.Canvas(htmlCanvas, {
      width: oldCanvas.getWidth(),
      height: oldCanvas.getHeight(),
      backgroundColor: oldCanvas.backgroundColor,
    });

    setBackgroundColor(oldCanvas.get("backgroundColor") || "#111111");

    // 5. Ensure DOM attachment
    if (container && !container.contains(htmlCanvas)) {
      container.appendChild(newCanvas.wrapperEl);
    }

    try {
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
      newCanvas.loadFromJSON(canvasJSON, async () => {
        await ensureSingleCallback(newCanvas);
        mainCanvasRef.current = newCanvas; // Store the Fabric.js canvas reference
      });
    } catch (error) {
      console.error("Failed to load canvas data:", error);
    }

    // newCanvas.on("object:modified", handleObjectModified);
    newCanvas.on("mouse:wheel", function (opt) {
      const delta = opt.e.deltaY;
      let zoom = newCanvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01; //@ts-ignore
      newCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      setZoomValue(zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    newCanvas.on("object:scaling", hanldeObjectScaled);

    newCanvas.on("selection:created", handleObjectSelected);

    newCanvas.on("selection:cleared", handleObjectDeselected);

    newCanvas.on("selection:updated", handleObjectSelected);

    newCanvas.on("text:changed", handleTextChanged);

    isUndoRedoAction.current = false;

    return () => {
      // newCanvas.dispose();

      newCanvas.off("mouse:wheel", function (opt) {
        const delta = opt.e.deltaY;
        let zoom = newCanvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01; //@ts-ignore
        newCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        setZoomValue(zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
      });

      newCanvas.off("object:scaling", hanldeObjectScaled);

      newCanvas.off("selection:created", handleObjectSelected);

      newCanvas.off("selection:updated", handleObjectSelected);

      newCanvas.off("selection:cleared", handleObjectDeselected);

      newCanvas.off("text:changed", handleTextChanged);

      // newCanvas.off("object:modified", handleObjectModified);
    };
  }, [currentHistoryIndex]);

  return (
    <div className="h-screen max-w-screen flex flex-col bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <Navbar />
      <div className="w-full flex-1 flex items-center relative flex-col md:flex-row">
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
          className={`flex w-full md:w-auto justify-center md:h-full items-start md:items-center ${
            sidebarName ? " md:w-[40%] lg:w-[25%]" : ""
          } flex-col md:flex-row`}
        >
          <nav className="flex w-full md:w-auto flex-row md:flex-col gap-5 justify-center items-center border-slate-800 dark:border-slate-900 border-b-2 md:border-r-2 md:border-b-0 md:h-full">
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
          </nav>
          <div
            className={`${
              sidebarName ? "w-full" : "w-0"
            } transition-all duration-700 ease-in-out relative bg-slate-300  dark:bg-gray-700  
     h-auto md:h-full overflow-y-auto md:overflow-visible 
     max-h-[20vh] md:max-h-full
     [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}
          >
            <div
              className={`${
                sidebarName ? "absolute w-[20px]" : "w-0"
              } flex justify-center items-center bg-gray-500  dark:bg-gray-900  -right-2 text-slate-300 top-[40%] cursor-pointer h-[100px] rounded-full `}
              onClick={() => setSidebarName("")}
            ></div>

            {sidebarName === "Arrange" && (
              <div className="w-full h-full">
                <div className="w-full abosulte py-3 text-center italic text-xl font-bold text-slate-800 dark:text-slate-300 top-0 left-0 hidden md:block">
                  Arrange Image
                </div>
                <div className="max-h-[580px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <ArrangeAdmin canvas={mainCanvasRef.current!} />
                </div>
              </div>
            )}

            {sidebarName === "Shape" && (
              <div className="w-full h-full">
                <div className="w-full abosulte py-3 text-center italic text-xl font-bold text-slate-800 dark:text-slate-300 top-0 left-0 hidden md:block">
                  Add Shapes
                </div>
                <div className="max-h-[580px]  overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <AddShapeAdminAdmin canvasRef={mainCanvasRef!} />
                </div>
              </div>
            )}

            {sidebarName === "Text" && (
              <div className="w-full h-full">
                <div className="w-full abosulte py-3 text-center italic text-xl font-bold text-slate-800 dark:text-slate-300 top-0 left-0 hidden md:block">
                  Text
                </div>
                <div className="max-h-[580px]  overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <AddTextAdmin canvas={mainCanvasRef.current!} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Section */}
        <div className="flex-1 h-full flex flex-col w-full md:w-auto">
          {/* Design Section */}
          <div className="flex-1 w-full flex items-center justify-center">
            <div
              className="w-[80%] h-[90%] flex justify-center items-center px-6"
              id="CanvasContainer"
            >
              <canvas id="canvas" className="z-1" ref={canvasRef}></canvas>
            </div>
          </div>
          {/* Footer */}
          <div className="relative flex-none w-full">
            <div className="absolute -top-5 left-0 bg-gray-800 text-white text-xs px-6 py-0.5 shadow z-50 pointer-events-none">
              {Math.floor(downloadImageDimensions.imageWidth)}X
              {Math.floor(downloadImageDimensions.imageHeight)}@
              {Math.round(zoomValue * 100)}%
            </div>

            <FooterAdmin
              canvas={mainCanvasRef.current!}
              undo={undo}
              redo={redo}
              setLoadState={setSpinnerLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateUpload;
