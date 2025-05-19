import IconComponent from "@/components/icon-component";

import { Diamond, Home } from "lucide-react";
import { Crop, RotateCwSquare, ListPlus, Type, Cpu } from "lucide-react";
import { useEffect, useRef, useState, CSSProperties } from "react";

import { filters } from "fabric";
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

import { useArrangeStore } from "@/hooks/appStore/ArrangeStore";
import { useAdjustStore } from "@/hooks/appStore/AdjustStore";
import { BBrightness } from "@/utils/BlueBrightnessFilter";
import { SharpenFilter } from "@/utils/SharpenFilter";
import { GBrightness } from "@/utils/GreenBrightnessValue";
import { RBrightness } from "@/utils/RedBrightnessFilter";
import { useLogContext } from "@/hooks/useLogContext";
import useUndoRedo from "@/hooks/useUndoRedo";
import { SobelFilter } from "@/utils/SobelFilter";
import { ColdFilter } from "@/utils/ColdFilter";
import { WarmFilter } from "@/utils/WarmFilter";
import { useShapeStore } from "@/hooks/appStore/ShapeStore";
import { CustomGaussianSobelFilter } from "@/utils/CustomGaussianBlur";
import useAddTextStore from "@/hooks/appStore/AddTextStore";
import { GaussianBlurFilter } from "@/utils/GaussianBlurFilter";
import { FocusFilter } from "@/utils/FocusFilter";
import AdjustSidebarAdvanced from "@/components/AdjustSidebarAdvanced";
import { ReflectFilter } from "@/utils/ReflectFilter";
import { MedianFilter } from "@/utils/MedianFilter";
import { BilateralFilter } from "@/utils/BilteralFilter";
import { updateOrInsert } from "@/utils/commonFunctions";
import { CustomGrayScale } from "@/utils/CustomGrayScale";
import { DoubleThresholding } from "@/utils/DoubleThresholding";
import { NonMaximumSupression } from "@/utils/NonMaximumSupression";
import { CannySobelEdge } from "@/utils/CannySobelEdge";
import { Hysteris } from "@/utils/Hysteris";
import { HorizontalEdgeFilter } from "@/utils/HorizontalEdge";
import { VerticalEdgeFilter } from "@/utils/VerticalFilter";
import { Swirl } from "@/utils/Swirl";
import { BulgeFilter } from "@/utils/BulgeFilter";

// TODO: the whole update or insert here feels redunant when doing from database or history may be I should fix that

// TODO: set the image size at max to be some value possibly 2048X2048
// TODO: I just realized something the way I am reloading a project from projects is very bad. It makes handling all the cases very difficult I think if we set the image src to '' then send the actual base64 to backend and save as a image then it would very efficient. Same with background image if we do this we do not need to mantain all this complete stuff like scale, dimensions etc everything would be handled by fabric js iteself
//TODO: I think it would make more sense if we allow the user to grant access to an project to another user through perhaps notification

const override: CSSProperties = {
  borderWidth: "5px",
};

const Test = () => {
  const sidebarName = useCommonProps((state) => state.sidebarName);
  const { setLogs, addLog } = useLogContext();
  const setCurrentFilters = useCommonProps((state) => state.setCurrentFilters);
  const setSidebarName = useCommonProps((state) => state.setSidebarName);
  const setProjectName = useCommonProps((state) => state.setProjectName);
  const setShowUpdateButton = useCommonProps(
    (state) => state.setShowUpdateButton
  );

  const currentFilters = useCommonProps((state) => state.currentFilters);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mainCanvasRef = useRef<fabric.Canvas | null>(null);
  const currentImageRef = useRef<fabric.FabricImage | null>(null); // Use ref for currentImage

  const databaseFiltersNameRef = useRef<null | string[]>(null);
  const databaseFiltersObjectRef = useRef<null | object[]>(null);
  const [filtersUI, setFiltersUI] = useState(false);

  const backupCurrentImageRef = useRef<fabric.FabricImage | null>(null); // Use ref for currentImage

  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const imageUrlFromState = useLocation().state?.imageUrl;
  // const idFromState = useLocation().state?.canvasId;
  const idFromState = localStorage.getItem("CanvasId");

  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState(imageUrlFromState || "./test3.png");

  const canvasIdRef = useRef(idFromState || crypto.randomUUID());

  const { setLoadedFromSaved, setZoomValue, zoomValue } = useCanvasObjects();

  const [spinnerLoading, setSpinnerLoading] = useState(false);

  //arrange states

  const setImageRotation = useArrangeStore((state) => state.setImageRotation);

  const {
    disableSavingIntoStackRef,
    downloadImageDimensions,
    setOriginalImageDimensions,
    setFinalImageDimensions,
    setDownloadImageDimensions,
    finalImageDimensionsRef,
    originalImageDimensionsRef,
    downloadImageDimensionsRef,
    setSelectedObject,
    allFiltersRef,
    currentFiltersRef,
  } = useCanvasObjects();

  const backgroundColor = useArrangeStore((state) => state.backgroundColor);
  const setBackgroundColor = useArrangeStore(
    (state) => state.setBackgroundColor
  );

  const setFlipX = useArrangeStore((state) => state.setFlipX);
  const setFlipY = useArrangeStore((state) => state.setFlipY);

  //adjust store values

  const setBlueBrightnessValue = useAdjustStore(
    (state) => state.setBlueBrightnessValue
  );

  const setGreenBrightnessValue = useAdjustStore(
    (state) => state.setGreenBrightnessValue
  );

  const setGammaBlueValue = useAdjustStore((state) => state.setGammaBlueValue);
  const setGammaGreenValue = useAdjustStore(
    (state) => state.setGammaGreenValue
  );
  const setGammaRedValue = useAdjustStore((state) => state.setGammaRedValue);

  const setEnableGrayScale = useAdjustStore(
    (state) => state.setEnableGrayScale
  );
  const setEnableVintage = useAdjustStore((state) => state.setEnableVintage);
  const setEnableSepia = useAdjustStore((state) => state.setEnableSepia);
  const setEnableTechnicolor = useAdjustStore(
    (state) => state.setEnableTechnicolor
  );
  const setEnableKodachrome = useAdjustStore(
    (state) => state.setEnableKodachrome
  );

  const setEnableInvert = useAdjustStore((state) => state.setEnableInvert);
  const setEnableWarmFilter = useAdjustStore(
    (state) => state.setEnableWarmFilter
  );

  const setEnableColdFilter = useAdjustStore(
    (state) => state.setEnableColdFilter
  );

  // Set functions for each value
  const setContrastValue = useAdjustStore((state) => state.setContrastValue);
  const setSaturationValue = useAdjustStore(
    (state) => state.setSaturationValue
  );
  const setRedBrightnessValue = useAdjustStore(
    (state) => state.setRedBrightnessValue
  );
  const setVibranceValue = useAdjustStore((state) => state.setVibranceValue);
  const setHueValue = useAdjustStore((state) => state.setHueValue);
  const setBlurValue = useAdjustStore((state) => state.setBlurValue);
  const setNoiseValue = useAdjustStore((state) => state.setNoiseValue);
  const setPixelateValue = useAdjustStore((state) => state.setPixelateValue);

  // const setRed = useAdjustStore((state) => state.setRed);

  // const setGreen = useAdjustStore((state) => state.setGreen);

  // const setBlue = useAdjustStore((state) => state.setBlue);

  // const enableBlueThresholding = useAdjustStore(
  //   (state) => state.enableBlueThresholding
  // );

  // const enableGreenThresholding = useAdjustStore(
  //   (state) => state.enableGreenThresholding
  // );

  // const enableRedThresholding = useAdjustStore(
  //   (state) => state.enableRedThresholding
  // );

  // const setEnableRedThresholding = useAdjustStore(
  //   (state) => state.setEnableRedThresholding
  // );

  // const setEnableGreenThresholding = useAdjustStore(
  //   (state) => state.setEnableGreenThresholding
  // );

  // const setEnableBlueThresholding = useAdjustStore(
  //   (state) => state.setEnableBlueThresholding
  // );

  const resetFilters = useAdjustStore((state) => state.resetFilters);

  const setEnableGaussianBlur = useAdjustStore(
    (state) => state.setEnableGaussianBlur
  );
  const setGaussianSigma = useAdjustStore((state) => state.setGaussianSigma);
  const setSharpenValue = useAdjustStore((state) => state.setSharpenValue);

  const setEnableFocusFilter = useAdjustStore(
    (state) => state.setEnableFocusFilter
  );

  const setRadius = useAdjustStore((state) => state.setRadius);
  const setSoftness = useAdjustStore((state) => state.setSoftness);

  const setDarkFocus = useAdjustStore((state) => state.setDarkFocus);

  const setEnableLeftToRightReflect = useAdjustStore(
    (state) => state.setEnableLeftToRightReflect
  );
  const setEnableRightToLeftReflect = useAdjustStore(
    (state) => state.setEnableRightToLeftReflect
  );
  const setEnableTopToBottomReflect = useAdjustStore(
    (state) => state.setEnableTopToBottomReflect
  );
  const setEnableBottomToTopReflect = useAdjustStore(
    (state) => state.setEnableBottomToTopReflect
  );
  const setEnableTopLeftReflect = useAdjustStore(
    (state) => state.setEnableTopLeftReflect
  );
  const setEnableTopRightReflect = useAdjustStore(
    (state) => state.setEnableTopRightReflect
  );
  const setEnableBottomLeftReflect = useAdjustStore(
    (state) => state.setEnableBottomLeftReflect
  );
  const setEnableBottomRightReflect = useAdjustStore(
    (state) => state.setEnableBottomRightReflect
  );

  const setEnableLeftDiagonalReflect = useAdjustStore(
    (state) => state.setEnableLeftDiagonalReflect
  );
  const setEnableRightDiagonalReflect = useAdjustStore(
    (state) => state.setEnableRightDiagonalReflect
  );

  const setBilateralKernelSize = useAdjustStore(
    (state) => state.setBilateralKernelSize
  );

  const setMedianFilterMatrixSize = useAdjustStore(
    (state) => state.setMedianFilterMatrixSize
  );

  const setGaussianMatrixSize = useAdjustStore(
    (state) => state.setGaussianMatrixSize
  );

  const setBilateralSigmaS = useAdjustStore(
    (state) => state.setBilateralSigmaS
  );

  const setBilateralSigmaC = useAdjustStore(
    (state) => state.setBilateralSigmaC
  );

  const setEnableBilateralFilter = useAdjustStore(
    (state) => state.setEnableBilateralFilter
  );

  const setEnableMedianFilter = useAdjustStore(
    (state) => state.setEnableMedianFilter
  );

  const setSelectedEdgeType = useAdjustStore(
    (state) => state.setSelectedEdgeType
  );
  const setCannyLowerThreshold = useAdjustStore(
    (state) => state.setCannyLowerThreshold
  );
  const setCannyUpperThreshold = useAdjustStore(
    (state) => state.setCannyUpperThreshold
  );

  const setOpacityValue = useAdjustStore((state) => state.setOpacityValue);

  const { swirlAngleRef, swirlRadiusRef } = useCanvasObjects();
  const setSwirlRadius = useAdjustStore((state) => state.setSwirlRadius);
  const setSwirlAngle = useAdjustStore((state) => state.setSwirlAngle);

  const setBulgeRadius = useAdjustStore((state) => state.setBulgeRadius);
  const setBulgeStrength = useAdjustStore((state) => state.setBulgeStrength);

  const setActivateLiquidifyTool = useAdjustStore(
    (state) => state.setActivateLiquidifyTool
  );

  const { dbLoadingRef } = useCanvasObjects();

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

    mainCanvasRef.current.renderAll();
  };

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
      const objectName = activeObject.type || "Unknown Object";
      const scaleX = activeObject.scaleX?.toFixed(2) || "N/A";
      const scaleY = activeObject.scaleY?.toFixed(2) || "N/A";

      //@ts-ignore
      if (activeObject.name?.toLowerCase().startsWith("frame")) {
        addLog({
          section: "crop&cut",
          tab: "cut",
          event: "update",
          message: `scaleX changed to ${scaleX}, scaleY changed to ${scaleY}`,
          param: "scale",
          objType: activeObject.type,
        });
      } else {
        addLog({
          section: "shape",
          tab: "shape",
          event: "update",
          message: `Scaled selected object: ${objectName}. scaleX changed to ${scaleX}, scaleY changed to ${scaleY}`,
          param: "scale",
          objType: objectName,
        });
      }

      setSelectedObject(activeObject); // Update the context with the selected object
    }
  };

  const handleObjectDeselected = () => {
    setSelectedObject(null);
  };

  // the below code is responsible for handling canvas and image loading
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

      // initCanvas.backgroundColor = "#000";

      const savedData = localStorage.getItem("project_data");

      if (savedData) {
        const finalImageShape: { width: number; height: number } = JSON.parse(
          localStorage.getItem("final_image_shape")!
        );
        const downloadImageShape: { width: number; height: number } =
          JSON.parse(localStorage.getItem("download_image_shape")!);
        const originalImageShape: { width: number; height: number } =
          JSON.parse(localStorage.getItem("original_image_shape")!);

        const filterNames = JSON.parse(localStorage.getItem("filter_names")!);
        const allFiltersApplied = JSON.parse(
          localStorage.getItem("all_filters_applied")!
        );
        const project_logs = JSON.parse(localStorage.getItem("project_logs"));

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
              // @ts-ignore
              imageObject.crossOrigin = "anonymous";

              setOriginalImageDimensions({
                imageWidth: originalImageShape.width,
                imageHeight: originalImageShape.height,
              });

              setDownloadImageDimensions({
                imageWidth: downloadImageShape.width,
                imageHeight: downloadImageShape.height,
              });

              setFinalImageDimensions({
                imageWidth: finalImageShape.width,
                imageHeight: finalImageShape.height,
              });

              finalImageDimensionsRef.current = {
                imageHeight: finalImageShape.height,
                imageWidth: finalImageShape.width,
              };

              downloadImageDimensionsRef.current = {
                imageHeight: downloadImageShape.height,
                imageWidth: downloadImageShape.width,
              };

              originalImageDimensionsRef.current = {
                imageHeight: originalImageShape.height,
                imageWidth: originalImageShape.width,
              };

              setLogs(project_logs);

              initCanvas.setDimensions({
                width: containerWidth,
                height: containerHeight,
              });

              const canvasRect = initCanvas
                .getObjects()
                .find((obj) => obj.name?.startsWith("canvasRect"));

              if (canvasRect) {
                const fillColor = canvasRect.get("fill");
                setBackgroundColor(fillColor);
              }

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

              const canvasData = initCanvas.toObject(["name", "isUpper", "id"]);

              const allData = {
                project_data: canvasData,
                final_image_shape: {
                  imageHeight: finalImageShape.height,
                  imageWidth: finalImageShape.width,
                },
                original_image_shape: {
                  imageHeight: originalImageShape.height,
                  imageWidth: originalImageShape.width,
                },
                download_image_shape: {
                  imageHeight: downloadImageShape.height,
                  imageWidth: downloadImageShape.width,
                },
                filter_names: [],
                viewportTransform: initCanvas.viewportTransform,
                zoomValue: zoom,
              };

              allFiltersRef.current = allFiltersApplied;
              dbLoadingRef.current = true;
              databaseFiltersNameRef.current = filterNames;
              databaseFiltersObjectRef.current = canvasJSON.objects[1].filters;
              // oldFiltersNameRef.current = filterNames;
              setFiltersUI(!filtersUI);
              setHistoryValue(allData);
            }

            const canvasRect = initCanvas
              .getObjects()
              .find((obj) => obj.name?.startsWith("canvasRect"));

            if (canvasRect) {
              const fillColor = canvasRect.get("fill");

              canvasRect.set({
                selectable: false,
                hasControls: false,
              });
              setBackgroundColor(fillColor);
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

            if (localStorage.getItem("canvasId")) {
              // console.log(localStorage.getItem("canvasId"), "sdfsk");
              setShowUpdateButton(true);
            }

            canvasIdRef.current = localStorage.getItem("canvasId")!;
            // localStorage.removeItem("project_data");
            // localStorage.removeItem("CanvasId");

            setProjectName(projectName);

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
        fabric.FabricImage.fromURL(imageUrl, { crossOrigin: "anonymous" }).then(
          async (img) => {
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

            setDownloadImageDimensions({
              imageHeight: imageHeight,
              imageWidth: imageWidth,
            });

            finalImageDimensionsRef.current = {
              imageHeight: imageHeight,
              imageWidth: imageWidth,
            };

            downloadImageDimensionsRef.current = {
              imageHeight: imageHeight,
              imageWidth: imageWidth,
            };

            originalImageDimensionsRef.current = {
              imageHeight: imageHeight,
              imageWidth: imageWidth,
            };

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

            // initCanvas.viewportCenterObject(img);
            img.set({
              left: imageWidth / 2,
              top: imageHeight / 2,
              selectable: false,
              hoverCursor: "default",
              originX: "center",
              originY: "center",
            });

            const canvasRect = new fabric.Rect({
              width: img.width,
              height: img.height,
              fill: backgroundColor,
              selectable: false,
              hasControls: false,
              name: "canvasRect",
              originX: "center",
              originY: "center",
              top: img.height / 2,
              left: img.width / 2,
            });

            initCanvas.add(canvasRect);

            // img.skewX = -3.5;

            initCanvas.add(img);
            initCanvas.renderAll();
            currentImageRef.current = img; // Set the ref directly
            setFlipX(img.flipX);
            setFlipY(img.flipY);

            mainCanvasRef.current = initCanvas;
            setSidebarName("Arrange");

            const canvasData = initCanvas.toObject(["name", "isUpper", "id"]);

            const allData = {
              project_data: canvasData,
              final_image_shape: {
                imageHeight: currentImageRef.current.height,
                imageWidth: currentImageRef.current.width,
              },
              original_image_shape: {
                imageHeight: currentImageRef.current.height,
                imageWidth: currentImageRef.current.width,
              },
              download_image_shape: {
                imageHeight: currentImageRef.current.height,
                imageWidth: currentImageRef.current.width,
              },
              filter_names: [],
              viewportTransform: initCanvas.viewportTransform,
              zoomValue: zoom,
            };

            setHistoryValue(allData);
          }
        );
      }

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

      // initCanvas.on("object:modified", handleObjectModifiedTemp);

      return () => {
        // localStorage.removeItem("project_data");
        // localStorage.removeItem("canvasId");

        initCanvas.dispose();
        // if (unsubscribeRef.current) unsubscribeRef.current();
        if (resizeObserverRef.current) resizeObserverRef.current.disconnect();

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

  // the pieces of code handles undo and redo functionality
  // const handleObjectModified = useCallback(() => {
  //   console.log("skdf");
  //   const canvasData = mainCanvasRef.current.toObject([
  //     "name",
  //     "isUpper",
  //     "id",
  //   ]);

  //   const filterNames =
  //     currentFiltersRef.current?.map((filter) => filter.filterName) || [];

  //   const allData = {
  //     project_data: canvasData,
  //     final_image_shape: finalImageDimensions,
  //     original_image_shape: originalImageDimensions,
  //     download_image_shape: downloadImageDimensions,
  //     filter_names: filterNames,
  //     viewportTransform: mainCanvasRef.current.viewportTransform,
  //   };

  //   setHistoryValue(allData);
  // }, [
  //   mainCanvasRef,
  //   finalImageDimensions,
  //   originalImageDimensions,
  //   downloadImageDimensions,
  //   setHistoryValue,
  // ]);
  const handleObjectModified = () => {
    if (disableSavingIntoStackRef.current) return;

    // Only save to stack if it's not a filter update
    console.log("object modified from undo redo");
    const canvasData = mainCanvasRef.current.toObject([
      "name",
      "isUpper",
      "id",
    ]);

    const filterNames =
      currentFiltersRef.current?.map((filter) => filter.filterName) || [];
    const allData = {
      project_data: canvasData,
      final_image_shape: finalImageDimensionsRef.current,
      original_image_shape: originalImageDimensionsRef.current,
      download_image_shape: downloadImageDimensionsRef.current,
      filter_names: filterNames,
      all_filters_applied: allFiltersRef.current,
      viewportTransform: mainCanvasRef.current.viewportTransform,
      zoomValue: zoomValue,
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
    setActivateLiquidifyTool("");

    const canvasJSON = currentSnapshot.project_data;
    const finalImageShape: { imageWidth: number; imageHeight: number } =
      currentSnapshot.final_image_shape;
    const downloadImageShape: { imageWidth: number; imageHeight: number } =
      currentSnapshot.download_image_shape;
    const originalImageShape: { imageWidth: number; imageHeight: number } =
      currentSnapshot.original_image_shape;
    const filterNames = currentSnapshot.filter_names;
    const allFiltersApplied = currentSnapshot.all_filters_applied;

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

    newCanvas.setViewportTransform(currentSnapshot.viewportTransform);
    setZoomValue(currentSnapshot.zoomValue);

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

        const imageObject = newCanvas
          ?.getObjects()
          .find((obj: fabric.Object) => obj.type.toLowerCase() === "image");

        const frameObject = newCanvas
          ?.getObjects() // @ts-ignore
          .find((obj) => obj.name?.startsWith("Frame"));

        // 4. Restore viewport FIRST

        if (imageObject) {
          setOriginalImageDimensions({
            imageWidth: originalImageShape.imageWidth,
            imageHeight: originalImageShape.imageHeight,
          });

          setDownloadImageDimensions({
            imageWidth: downloadImageShape.imageWidth,
            imageHeight: downloadImageShape.imageHeight,
          });

          setFinalImageDimensions({
            imageWidth: finalImageShape.imageWidth,
            imageHeight: finalImageShape.imageHeight,
          });

          finalImageDimensionsRef.current = {
            imageHeight: finalImageShape.imageHeight,
            imageWidth: finalImageShape.imageWidth,
          };

          originalImageDimensionsRef.current = {
            imageHeight: originalImageShape.imageHeight,
            imageWidth: originalImageShape.imageWidth,
          };

          downloadImageDimensionsRef.current = {
            imageHeight: downloadImageShape.imageHeight,
            imageWidth: downloadImageShape.imageWidth,
          };

          setImageRotation(imageObject.angle);
          setFlipX(imageObject.flipX);
          setFlipY(imageObject.flipY);

          // for some reason you have to set the values again but does not need to done with other objects though
          imageObject.set({
            left: imageObject.width / 2,
            top: imageObject.height / 2,
            selectable: false,
            hoverCursor: "default",
            originX: "center",
            originY: "center",
          });

          dbLoadingRef.current = true;
          allFiltersRef.current = allFiltersApplied;
          databaseFiltersNameRef.current = filterNames;
          databaseFiltersObjectRef.current = canvasJSON.objects[1].filters;
          setFiltersUI(!filtersUI);
        }

        const canvasRect = newCanvas
          .getObjects()
          .find((obj) => obj.name?.startsWith("canvasRect"));

        if (canvasRect) {
          const fillColor = canvasRect.get("fill");

          canvasRect.set({
            selectable: false,
            hasControls: false,
          });
          setBackgroundColor(fillColor);
        }

        if (frameObject && imageObject.clipPath) {
          imageObject.clipPath = null;
          frameObject.absolutePositioned = true;
          // selectedObject.absolutePositioned = true;
          imageObject.clipPath = frameObject;
        }

        // @ts-ignore
        currentImageRef.current = imageObject; // Store the Fabric.js image object reference
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

  // this only runs if we load a project from the database else it does not do anything
  useEffect(() => {
    console.log(
      "loading from database",
      databaseFiltersNameRef.current,
      databaseFiltersObjectRef.current
    );

    resetFilters();

    const loadDatabaseFilters = async () => {
      if (!databaseFiltersNameRef.current || !databaseFiltersObjectRef.current)
        return;

      // Get new and old filter names (default to empty array)
      const databaseFiltersName = databaseFiltersNameRef.current;
      const databaseFiltersObject = databaseFiltersObjectRef.current;

      dbLoadingRef.current = true;
      const filtersList: any[] = [];

      // resetFilters();

      const opacity = currentImageRef.current.get("opacity");
      setOpacityValue(opacity);

      for (let idx = 0; idx < databaseFiltersName.length; idx++) {
        const filterName = databaseFiltersName[idx];
        const filterData: any = databaseFiltersObject[idx];

        switch (filterName) {
          case "grayscale":
            setEnableGrayScale(true);
            // updateOrInsert(
            //   filtersList,
            //   "grayscale",
            //   new CustomGrayScale(),
            //   true
            // );
            break;
          case "sepia":
            setEnableSepia(true);
            // updateOrInsert(filtersList, "sepia", new filters.Sepia(), true);

            break;
          case "vintage":
            setEnableVintage(true);
            // updateOrInsert(filtersList, "vintage", new filters.Vintage(), true);
            break;
          case "kodachrome":
            setEnableKodachrome(true);
            // updateOrInsert(
            //   filtersList,
            //   "kodachrome",
            //   new filters.Kodachrome(),
            //   true
            // );

            break;
          case "technicolor":
            setEnableTechnicolor(true);
            // updateOrInsert(
            //   filtersList,
            //   "technicolor",
            //   new filters.Technicolor(),
            //   true
            // );

            break;

          case "sharpen":
            // setEnableSharpen(true);
            setSharpenValue(filterData.sharpenValue);
            // updateOrInsert(
            //   filtersList,
            //   "sharpen",
            //   new SharpenFilter({ SharpenValue: filterData.sharpenValue }),
            //   true
            // );

            break;

          case "cold":
            setEnableColdFilter(true);
            // updateOrInsert(filtersList, "cold", new ColdFilter(), true);

            break;

          case "warm":
            setEnableWarmFilter(true);

            // updateOrInsert(filtersList, "warm", new WarmFilter(), true);

            break;

          case "invert":
            setEnableInvert(true);
            // updateOrInsert(
            //   filtersList,
            //   "invert",
            //   new filters.Invert({ alpha: false }),
            //   true
            // );

            break;
          case "gbrightness":
            setGreenBrightnessValue(filterData.GBrightness);
            // updateOrInsert(
            //   filtersList,
            //   "gbrightness",
            //   new GBrightness({ GBrightness: filterData.GBrightness }),
            //   true
            // );

            break;
          case "bbrightness":
            setBlueBrightnessValue(filterData.BBrightness);
            // updateOrInsert(
            //   filtersList,
            //   "bbrightness",
            //   new BBrightness({ BBrightness: filterData.BBrightness }),
            //   true
            // );

            break;
          case "rbrightness":
            setRedBrightnessValue(filterData.RBrightness);
            // updateOrInsert(
            //   filtersList,
            //   "rbrightness",
            //   new RBrightness({ RBrightness: filterData.RBrightness }),
            //   true
            // );

            break;
          case "gamma":
            setGammaRedValue(filterData.gamma[0]);
            setGammaGreenValue(filterData.gamma[1]);
            setGammaBlueValue(filterData.gamma[2]);
            // updateOrInsert(
            // filtersList,
            //   "gamma",
            //   new filters.Gamma({
            //     gamma: [
            //       filterData.gamma[0],
            //       filterData.gamma[1],
            //       filterData.gamma[2],
            //     ],
            //   }),
            //   true
            // );

            break;
          case "contrast":
            setContrastValue(filterData.contrast);
            // updateOrInsert(
            //   filtersList,
            //   "contrast",
            //   new filters.Contrast({ contrast: filterData.contrast }),
            //   true
            // );

            break;
          case "saturation":
            setSaturationValue(filterData.saturation);
            // updateOrInsert(
            //   filtersList,
            //   "saturation",
            //   new filters.Saturation({ saturation: filterData.saturation }),
            //   true
            // );

            break;
          case "vibrance":
            setVibranceValue(filterData.vibrance);
            // updateOrInsert(
            //   filtersList,
            //   "vibrance",
            //   new filters.Vibrance({ vibrance: filterData.vibrance }),
            //    true
            // );

            break;
          case "blur":
            setBlurValue(filterData.blur);
            // updateOrInsert(
            //   filtersList,
            //   "blur",
            //   new filters.Blur({ blur: filterData.blur }),
            //   true
            // );

            break;
          case "hueRotation":
            setHueValue(filterData.rotation);
            // updateOrInsert(
            //   filtersList,
            //   "hueRotation",
            //   new filters.HueRotation({ rotation: filterData.rotation }),
            //   true
            // );

            break;
          case "noise":
            setNoiseValue(filterData.noise);
            // updateOrInsert(
            //   filtersList,
            //   "noise",
            //   new filters.Noise({ noise: filterData.noise }),
            //   true
            // );

            break;
          case "pixelate":
            setPixelateValue(filterData.blocksize);
            // updateOrInsert(
            //   filtersList,
            //   "pixelate",
            //   new filters.Pixelate({ blocksize: filterData.blocksize }),
            //   true
            // );

            break;

          // case "redThreshold":
          //   setEnableRedThresholding(true);
          //   setRed({
          //     threshold: filterData.red.threshold,
          //     below: filterData.red.lower,
          //     above: filterData.red.upper,
          //   });
          //   updateOrInsert(
          //     filtersList,
          //     "redThreshold",
          //     new RedThresholdFilter({
          //       red: {
          //         threshold: filterData.red.threshold,
          //         lower: filterData.red.below,
          //         upper: filterData.red.above,
          //       },
          //     }),
          //     true
          //   );
          //   break;
          // case "blueThreshold":
          //   setEnableBlueThresholding(true);
          //   setBlue({
          //     threshold: filterData.blue.threshold,
          //     below: filterData.blue.lower,
          //     above: filterData.blue.upper,
          //   });
          //   updateOrInsert(
          //     filtersList,
          //     "blueThreshold",
          //     new BlueThresholdFilter({
          //       blue: {
          //         threshold: filterData.blue.threshold,
          //         lower: filterData.blue.below,
          //         upper: filterData.blue.above,
          //       },
          //     }),
          //     true
          //   );
          //   break;
          // case "greenThreshold":
          //   setEnableGreenThresholding(true);
          //   setGreen({
          //     threshold: filterData.green.threshold,
          //     below: filterData.green.lower,
          //     above: filterData.green.upper,
          //   });
          //   updateOrInsert(
          //     filtersList,
          //     "greenThreshold",
          //     new GreenThresholdFilter({
          //       green: {
          //         threshold: filterData.green.threshold,
          //         lower: filterData.green.below,
          //         upper: filterData.green.above,
          //       },
          //     }),
          //     true
          //   );
          //   break;

          case "gaussianBlur":
            setEnableGaussianBlur(true);
            setGaussianMatrixSize(filterData.matrixSize);
            setGaussianSigma(filterData.sigma);

            // updateOrInsert(
            //   filtersList,
            //   "gaussianBlur",
            //   new GaussianBlurFilter({
            //     sigma: filterData.sigma,
            //     matrixSize: filterData.matrixSize,
            //   }),
            //   true
            // );
            break;
          case "focusFilter":
            setEnableFocusFilter(true);
            setSoftness(filterData.softness);
            setRadius(filterData.radius);
            setDarkFocus(filterData.dark);
            // updateOrInsert(
            //   filtersList,
            //   "focusFilter",
            //   new FocusFilter({
            //     radius: filterData.radius,
            //     softness: filterData.softness,
            //     dark: filterData.dark,
            //   }),
            //   true
            // );
            break;
          case "leftToRight":
            setEnableLeftToRightReflect(true);
            // updateOrInsert(
            //   filtersList,
            //   "leftToRight",
            //   new ReflectFilter({
            //     reflectType: "leftToRight",
            //   }),
            //   true
            // );
            break;

          case "rightToLeft":
            setEnableRightToLeftReflect(true);
            // updateOrInsert(
            //   filtersList,
            //   "rightToLeft",
            //   new ReflectFilter({
            //     reflectType: "rightToLeft",
            //   }),
            //   true
            // );
            break;

          case "bottomToTop":
            setEnableBottomToTopReflect(true);
            // updateOrInsert(
            //   filtersList,
            //   "bottomToTop",
            //   new ReflectFilter({
            //     reflectType: "bottomToTop",
            //   }),
            //   true
            // );
            break;

          case "topToBottom":
            setEnableTopToBottomReflect(true);
            // updateOrInsert(
            //   filtersList,
            //   "topToBottom",
            //   new ReflectFilter({
            //     reflectType: "topToBottom",
            //   }),
            //   true
            // );
            break;

          case "topRight":
            setEnableTopRightReflect(true);
            // updateOrInsert(
            //   filtersList,
            //   "topRight",
            //   new ReflectFilter({
            //     reflectType: "topRight",
            //   }),
            //   true
            // );

            break;

          case "topLeft":
            setEnableTopLeftReflect(true);
            // updateOrInsert(
            //   filtersList,
            //   "topLeft",
            //   new ReflectFilter({
            //     reflectType: "topLeft",
            //   }),
            //   true
            // );
            break;

          case "bottomRight":
            setEnableBottomRightReflect(true);
            // updateOrInsert(
            //   filtersList,
            //   "bottomRight",
            //   new ReflectFilter({
            //     reflectType: "bottomRight",
            //   }),
            //   true
            // );

            break;
          case "bottomLeft":
            setEnableBottomLeftReflect(true);
            // updateOrInsert(
            //   filtersList,
            //   "bottomLeft",
            //   new ReflectFilter({
            //     reflectType: "bottomLeft",
            //   }),
            //   true
            // );
            break;

          case "leftDiagonal":
            setEnableLeftDiagonalReflect(true);
            // updateOrInsert(
            //   filtersList,
            //   "leftDiagonal",
            //   new ReflectFilter({
            //     reflectType: "leftDiagonal",
            //   }),
            //   true
            // );
            break;

          case "rightDiagonal":
            setEnableRightDiagonalReflect(true);
            // updateOrInsert(
            //   filtersList,
            //   "rightDiagonal",
            //   new ReflectFilter({
            //     reflectType: "rightDiagonal",
            //   }),
            //   true
            // );
            break;

          case "medianFilter":
            setEnableMedianFilter(true);
            setMedianFilterMatrixSize(filterData.matrixSize);
            // updateOrInsert(
            //   filtersList,
            //   "medianFilter",
            //   new MedianFilter({ matrixSize: filterData.matrixSize }),
            //   true
            // );
            break;

          case "bilateralFilter":
            setEnableBilateralFilter(true);
            setBilateralSigmaS(filterData.sigmaS);
            setBilateralSigmaC(filterData.sigmaC);
            setBilateralKernelSize(filterData.kernelSize);

            // updateOrInsert(
            //   filtersList,
            //   "bilateralFilter",
            //   new BilateralFilter({
            //     sigmaS: filterData.sigmaS,
            //     sigmaC: filterData.sigmaC,
            //     kernelSize: filterData.kernelSize,
            //   }),
            //   true
            // );
            break;

          case "edge":
            console.log("from edge", filterData.type);
            if (filterData.type === "HorizontalEdgeFilter") {
              setSelectedEdgeType("horizontal");
              // updateOrInsert(
              //   filtersList,
              //   "edge",
              //   new HorizontalEdgeFilter(),
              //   true
              // );
            } else if (filterData.type === "VerticalEdgeFilter") {
              setSelectedEdgeType("vertical");
              // updateOrInsert(
              //   filtersList,
              //   "edge",
              //   new VerticalEdgeFilter(),
              //   true
              // );
            } else if (filterData.type === "sobel") {
              setSelectedEdgeType("sobel");
              // updateOrInsert(filtersList, "edge", new SobelFilter(), true);
            } else if (filterData.type === "Composed") {
              setSelectedEdgeType("canny");
              setCannyLowerThreshold(filterData.subFilters[2].lowThreshold);
              setCannyUpperThreshold(filterData.subFilters[2].highThreshold);
              // updateOrInsert(
              //   filtersList,
              //   "edge",
              //   new filters.Composed({
              //     subFilters: [
              //       new CannySobelEdge(),
              //       new NonMaximumSupression(),
              //       new DoubleThresholding({
              //         lowThreshold: filterData.lowThreshold,
              //         highThreshold: filterData.highThreshold,
              //       }),
              //       new Hysteris(),
              //     ],
              //   }),
              //   true
              // );
            } else {
              setSelectedEdgeType("none");
            }
            console.log("from edge", filterData);

            break;

          case "swirl":
            {
              const swirlFilterComposed = filterData as filters.Composed;
              const swirlFilter = swirlFilterComposed.subFilters[
                swirlFilterComposed.subFilters.length - 1
              ] as Swirl;
              const radius = swirlFilter.radius;
              const angle = swirlFilter.angle;

              setSwirlRadius(radius);
              setSwirlAngle(angle);
              swirlRadiusRef.current = radius;
              swirlAngleRef.current = angle;
            }

            break;

          case "bulge":
            {
              const bulgeFilterComposed = filterData as filters.Composed;
              const bulgeFilter = bulgeFilterComposed.subFilters[
                bulgeFilterComposed.subFilters.length - 1
              ] as BulgeFilter;
              console.log(bulgeFilter);
              const bulgeRadius = bulgeFilter.radius;
              const bulgeStrength = bulgeFilter.strength;

              setBulgeRadius(bulgeRadius);
              setBulgeStrength(bulgeStrength);
            }
            break;
        }
      }
      // setCurrentFilters(filtersList);
    };

    loadDatabaseFilters();
    setTimeout(() => {
      setSpinnerLoading(false);
      dbLoadingRef.current = false;
      mainCanvasRef.current.requestRenderAll();
    }, 500);
  }, [filtersUI]);

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
              icon={<ListPlus />}
              iconName="Morph"
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
            {sidebarName === "Crop" && (
              <div className="w-full h-full">
                <div className="w-full abosulte py-3 text-center italic text-xl font-bold text-slate-800 dark:text-slate-300 top-0 left-0 hidden md:block">
                  Crop
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
                <div className="w-full abosulte py-3 text-center italic text-xl font-bold text-slate-800 dark:text-slate-300 top-0 left-0 hidden md:block">
                  Arrange Image
                </div>
                <div className="max-h-[580px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <Arrange
                    canvas={mainCanvasRef.current!}
                    imageRef={currentImageRef!}
                    setSpinnerLoading={setSpinnerLoading}
                  />
                </div>
              </div>
            )}

            {sidebarName === "Shape" && (
              <div className="w-full h-full">
                <div className="w-full abosulte py-3 text-center italic text-xl font-bold text-slate-800 dark:text-slate-300 top-0 left-0 hidden md:block">
                  Add Shapes
                </div>
                <div className="max-h-[580px]  overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <AddShape canvasRef={mainCanvasRef!} />
                </div>
              </div>
            )}

            {sidebarName === "Adjust" && (
              <div className="w-full h-full">
                <div className="w-full abosulte py-3 text-center italic text-xl font-bold text-slate-800 dark:text-slate-300 top-0 left-0 hidden md:block">
                  Adjust
                </div>
                <div className="max-h-[580px] overflow-hidden  overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <AdjustSidebar
                    canvas={mainCanvasRef.current!}
                    image={currentImageRef.current!}
                    imageRef={currentImageRef!}
                    databaseFiltersName={databaseFiltersNameRef.current}
                    databaseFiltersObject={databaseFiltersObjectRef.current}
                    setLoadState={setSpinnerLoading}
                  />
                </div>
              </div>
            )}

            {sidebarName === "Morph" && (
              <div className="w-full h-full">
                <div className="w-full abosulte py-3 text-center italic text-xl font-bold text-slate-800 dark:text-slate-300 top-0 left-0 hidden md:block">
                  Morph
                </div>
                <div className="max-h-[580px] overflow-hidden  overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <AdjustSidebarAdvanced
                    canvas={mainCanvasRef.current!}
                    canvasRef={mainCanvasRef}
                    image={currentImageRef.current!}
                    imageRef={currentImageRef!}
                    databaseFiltersName={databaseFiltersNameRef.current}
                    databaseFiltersObject={databaseFiltersObjectRef.current}
                    setLoadState={setSpinnerLoading}
                  />
                </div>
              </div>
            )}

            {sidebarName === "Text" && (
              <div className="w-full h-full">
                <div className="w-full abosulte py-3 text-center italic text-xl font-bold text-slate-800 dark:text-slate-300 top-0 left-0 hidden md:block">
                  Text
                </div>
                <div className="max-h-[580px]  overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <AddText
                    canvas={mainCanvasRef.current!}
                    image={currentImageRef.current}
                  />
                </div>
              </div>
            )}

            {sidebarName === "AI" && (
              <div className="w-full h-full">
                <div className="w-full abosulte py-3 text-center italic text-xl font-bold text-slate-800 dark:text-slate-300 top-0 left-0 hidden md:block">
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
        <div className="flex-1 h-full flex flex-col w-full md:w-auto">
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
              {Math.floor(downloadImageDimensions.imageWidth)}X
              {Math.floor(downloadImageDimensions.imageHeight)}@
              {Math.round(zoomValue * 100)}%
            </div>

            <Footer
              canvas={mainCanvasRef.current!}
              image={currentImageRef.current!}
              backupImage={backupCurrentImageRef.current}
              canvasId={canvasIdRef.current}
              imageUrl={imageUrl}
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

export default Test;
