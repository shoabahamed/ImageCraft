import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

import { Canvas, FabricImage, filters } from "fabric";
import { useLogContext } from "@/hooks/useLogContext";
import { useAdjustStore } from "@/hooks/appStore/AdjustStore";

import {
  getRotatedBoundingBox,
  setActiveToolNameRef,
  updateOrInsert,
} from "@/utils/commonFunctions";
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";

import {
  FlipHorizontal,
  FlipVertical,
  CornerLeftUp,
  CornerRightUp,
  CornerLeftDown,
  CornerRightDown,
} from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCommonProps } from "@/hooks/appStore/CommonProps";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ReflectFilter } from "@/utils/ReflectFilter";
import { GaussianBlurFilter } from "@/utils/GaussianBlurFilter";
import { MedianFilter } from "@/utils/MedianFilter";
import { BilateralFilter } from "@/utils/BilteralFilter";
import { Slider } from "./ui/slider";
import { useRef, useState, useEffect, useCallback } from "react";
import { SobelFilter } from "@/utils/SobelFilter";
import { HorizontalEdgeFilter } from "@/utils/HorizontalEdge";
import { VerticalEdgeFilter } from "@/utils/VerticalFilter";
import { NonMaximumSupression } from "@/utils/NonMaximumSupression";
import { CannySobelEdge } from "@/utils/CannySobelEdge";
import { DoubleThresholding } from "@/utils/DoubleThresholding";
import { Hysteris } from "@/utils/Hysteris";
import { Swirl } from "@/utils/Swirl";
import { BulgeFilter } from "@/utils/BulgeFilter";
import { CircleDot as BulgeIcon, RotateCw as SwirlIcon } from "lucide-react";

interface FilterEntry {
  filterName: string;
  instance: filters.BaseFilter<
    string,
    Record<string, unknown>,
    Record<string, unknown>
  >;
}

type AdjustSidebarProps = {
  canvasRef: React.RefObject<Canvas>;
  imageRef: React.RefObject<FabricImage>;
  databaseFiltersName: string[] | null;
  databaseFiltersObject: object[] | null;
  setLoadState: (value: boolean) => void;
};

const AdjustSidebarAdvanced = ({
  canvasRef,
  imageRef,
  setLoadState,
}: AdjustSidebarProps) => {
  const { addLog } = useLogContext();
  const { disableSavingIntoStackRef, allFiltersRef } = useCanvasObjects();
  const setCurrentFilters = useCommonProps((state) => state.setCurrentFilters);
  const { currentFiltersRef } = useCanvasObjects() as {
    currentFiltersRef: React.MutableRefObject<FilterEntry[] | null>;
  };

  const resetFilters = useAdjustStore((state) => state.resetFilters);

  const enableLeftToRightReflect = useAdjustStore(
    (state) => state.enableLeftToRightReflect
  );
  const enableRightToLeftReflect = useAdjustStore(
    (state) => state.enableRightToLeftReflect
  );
  const enableTopToBottomReflect = useAdjustStore(
    (state) => state.enableTopToBottomReflect
  );
  const enableBottomToTopReflect = useAdjustStore(
    (state) => state.enableBottomToTopReflect
  );
  const enableTopLeftReflect = useAdjustStore(
    (state) => state.enableTopLeftReflect
  );
  const enableTopRightReflect = useAdjustStore(
    (state) => state.enableTopRightReflect
  );
  const enableBottomLeftReflect = useAdjustStore(
    (state) => state.enableBottomLeftReflect
  );
  const enableBottomRightReflect = useAdjustStore(
    (state) => state.enableBottomRightReflect
  );

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

  const enableLeftDiagonalReflect = useAdjustStore(
    (state) => state.enableLeftDiagonalReflect
  );
  const enableRightDiagonalReflect = useAdjustStore(
    (state) => state.enableRightDiagonalReflect
  );

  const setEnableLeftDiagonalReflect = useAdjustStore(
    (state) => state.setEnableLeftDiagonalReflect
  );
  const setEnableRightDiagonalReflect = useAdjustStore(
    (state) => state.setEnableRightDiagonalReflect
  );

  const enableGaussianBlur = useAdjustStore(
    (state) => state.enableGaussianBlur
  );

  const setEnableGaussianBlur = useAdjustStore(
    (state) => state.setEnableGaussianBlur
  );

  const gaussianMatrixSize = useAdjustStore(
    (state) => state.gaussianMatrixSize
  );

  const setGaussianMatrixSize = useAdjustStore(
    (state) => state.setGaussianMatrixSize
  );

  const gaussianSigma = useAdjustStore((state) => state.gaussianSigma);

  const setGaussianSigma = useAdjustStore((state) => state.setGaussianSigma);

  const enableBilateralFilter = useAdjustStore(
    (state) => state.enableBilateralFilter
  );

  const setEnableBilateralFilter = useAdjustStore(
    (state) => state.setEnableBilateralFilter
  );

  const bilateralSigmaS = useAdjustStore((state) => state.bilateralSigmaS);

  const setBilateralSigmaS = useAdjustStore(
    (state) => state.setBilateralSigmaS
  );

  const bilateralSigmaC = useAdjustStore((state) => state.bilateralSigmaC);

  const setBilateralSigmaC = useAdjustStore(
    (state) => state.setBilateralSigmaC
  );

  const bilateralKernelSize = useAdjustStore(
    (state) => state.bilateralKernelSize
  );

  const setBilateralKernelSize = useAdjustStore(
    (state) => state.setBilateralKernelSize
  );

  const enableMedianFilter = useAdjustStore(
    (state) => state.enableMedianFilter
  );
  const setEnableMedianFilter = useAdjustStore(
    (state) => state.setEnableMedianFilter
  );

  const medianFilterMatrixSize = useAdjustStore(
    (state) => state.medianFilterMatrixSize
  );

  const setMedianFilterMatrixSize = useAdjustStore(
    (state) => state.setMedianFilterMatrixSize
  );

  const selectedEdgeType = useAdjustStore((state) => state.selectedEdgeType);
  const cannyLowerThreshold = useAdjustStore(
    (state) => state.cannyLowerThreshold
  );
  const cannyUpperThreshold = useAdjustStore(
    (state) => state.cannyUpperThreshold
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

  const {
    swirlAngleRef,
    swirlRadiusRef,
    bulgeRadiusRef,
    bulgeStrengthRef,
    activeToolNameRef,
  } = useCanvasObjects();
  const swirlRadius = useAdjustStore((state) => state.swirlRadius);
  const setSwirlRadius = useAdjustStore((state) => state.setSwirlRadius);
  const swirlAngle = useAdjustStore((state) => state.swirlAngle);
  const setSwirlAngle = useAdjustStore((state) => state.setSwirlAngle);

  const bulgeRadius = useAdjustStore((state) => state.bulgeRadius);
  const setBulgeRadius = useAdjustStore((state) => state.setBulgeRadius);
  const bulgeStrength = useAdjustStore((state) => state.bulgeStrength);
  const setBulgeStrength = useAdjustStore((state) => state.setBulgeStrength);

  const activateLiquidifyTool = useAdjustStore(
    (state) => state.activateLiquidifyTool
  );
  const setActivateLiquidifyTool = useAdjustStore(
    (state) => state.setActivateLiquidifyTool
  );

  useEffect(() => {
    return () => {
      console.log("deactivated liquidify tool from use Effect");
      deactivateSwril();
      deactivateBulge();
      setActivateLiquidifyTool("");
    };
  }, []);

  // Effect to handle activateLiquidifyTool state changes
  useEffect(() => {
    // Only proceed if we have a valid canvas and image reference
    if (!canvasRef.current || !imageRef.current) return;

    // Then activate the appropriate tool if needed
    if (activeToolNameRef.current === "swirl") {
      setActivateLiquidifyTool("swirl");
      activateSwril();
    } else if (activeToolNameRef.current === "bulge") {
      setActivateLiquidifyTool("bulge");
      activateBulge();
    } else {
      setActivateLiquidifyTool("");
    }
  }, [canvasRef.current]);

  const handleReflectFilter = (filterName: string, value: boolean) => {
    addLog({
      section: "adjust",
      tab: "filter",
      event: "update",
      message: `${filterName} filter ${value ? "enabled" : "disabled"}`,
    });

    const filtersList = [...(currentFiltersRef.current || [])];
    console.log("old filters", filtersList);

    switch (filterName) {
      case "leftToRight":
        setEnableLeftToRightReflect(value);
        updateOrInsert(
          filtersList,
          "leftToRight",
          new ReflectFilter({
            reflectType: "leftToRight",
          }),
          value
        );
        break;

      case "rightToLeft":
        setEnableRightToLeftReflect(value);
        updateOrInsert(
          filtersList,
          "rightToLeft",
          new ReflectFilter({
            reflectType: "rightToLeft",
          }),
          value
        );
        break;

      case "bottomToTop":
        setEnableBottomToTopReflect(value);
        updateOrInsert(
          filtersList,
          "bottomToTop",
          new ReflectFilter({
            reflectType: "bottomToTop",
          }),
          value
        );
        break;

      case "topToBottom":
        setEnableTopToBottomReflect(value);
        updateOrInsert(
          filtersList,
          "topToBottom",
          new ReflectFilter({
            reflectType: "topToBottom",
          }),
          value
        );
        break;

      case "topRight":
        setEnableTopRightReflect(value);
        updateOrInsert(
          filtersList,
          "topRight",
          new ReflectFilter({
            reflectType: "topRight",
          }),
          value
        );

        break;

      case "topLeft":
        setEnableTopLeftReflect(value);
        updateOrInsert(
          filtersList,
          "topLeft",
          new ReflectFilter({
            reflectType: "topLeft",
          }),
          value
        );
        break;

      case "bottomRight":
        setEnableBottomRightReflect(value);
        updateOrInsert(
          filtersList,
          "bottomRight",
          new ReflectFilter({
            reflectType: "bottomRight",
          }),
          value
        );

        break;
      case "bottomLeft":
        setEnableBottomLeftReflect(value);
        updateOrInsert(
          filtersList,
          "bottomLeft",
          new ReflectFilter({
            reflectType: "bottomLeft",
          }),
          value
        );
        break;

      case "leftDiagonal":
        setEnableLeftDiagonalReflect(value);
        updateOrInsert(
          filtersList,
          "leftDiagonal",
          new ReflectFilter({
            reflectType: "leftDiagonal",
          }),
          value
        );
        break;

      case "rightDiagonal":
        setEnableRightDiagonalReflect(value);
        updateOrInsert(
          filtersList,
          "rightDiagonal",
          new ReflectFilter({
            reflectType: "rightDiagonal",
          }),
          value
        );
        break;

      default:
        break;
    }

    const filterInstances = filtersList.map(
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvasRef.current.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;

    canvasRef.current.fire("object:modified");
  };
  const handleReflectFilterReset = () => {
    addLog({
      section: "adjust",
      tab: "filter",
      event: "deletion",
      message: `removed all reflect filters`,
    });

    setEnableLeftToRightReflect(false);
    setEnableRightToLeftReflect(false);
    setEnableTopToBottomReflect(false);
    setEnableBottomToTopReflect(false);
    setEnableTopLeftReflect(false);
    setEnableTopRightReflect(false);
    setEnableBottomLeftReflect(false);
    setEnableBottomRightReflect(false);
    setEnableLeftDiagonalReflect(false);
    setEnableRightDiagonalReflect(false);

    const filtersList = [...(currentFiltersRef.current || [])];

    updateOrInsert(
      filtersList,
      "leftToRight",
      new ReflectFilter({ reflectType: "leftToRight" }),
      false
    );
    updateOrInsert(
      filtersList,
      "rightToLeft",
      new ReflectFilter({ reflectType: "rightToLeft" }),
      false
    );
    updateOrInsert(
      filtersList,
      "topToBottom",
      new ReflectFilter({ reflectType: "topToBottom" }),
      false
    );
    updateOrInsert(
      filtersList,
      "bottomToTop",
      new ReflectFilter({ reflectType: "bottomToTop" }),
      false
    );
    updateOrInsert(
      filtersList,
      "topLeft",
      new ReflectFilter({ reflectType: "topLeft" }),
      false
    );
    updateOrInsert(
      filtersList,
      "topRight",
      new ReflectFilter({ reflectType: "topRight" }),
      false
    );
    updateOrInsert(
      filtersList,
      "bottomLeft",
      new ReflectFilter({ reflectType: "bottomLeft" }),
      false
    );
    updateOrInsert(
      filtersList,
      "bottomRight",
      new ReflectFilter({ reflectType: "bottomRight" }),
      false
    );
    updateOrInsert(
      filtersList,
      "leftDiagonal",
      new ReflectFilter({ reflectType: "leftDiagonal" }),
      false
    );
    updateOrInsert(
      filtersList,
      "rightDiagonal",
      new ReflectFilter({ reflectType: "rightDiagonal" }),
      false
    );

    const filterInstances = filtersList.map(
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;
    imageRef.current.applyFilters();
    canvasRef.current.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;

    canvasRef.current.fire("object:modified");
  };

  const handleGaussianBlurFilterToggle = (value: boolean) => {
    const filterName = "Gaussian Blur";
    addLog({
      section: "adjust",
      tab: "filters",
      event: "update",
      message: value
        ? `enabled ${filterName} filter`
        : `disabled ${filterName} scale filter`,
    });

    const filtersList = [...(currentFiltersRef.current || [])];
    console.log("old filters", filtersList);

    updateOrInsert(
      filtersList,
      "gaussianBlur",
      new GaussianBlurFilter({
        sigma: gaussianSigma,
        matrixSize: gaussianMatrixSize,
      }),
      value
    );

    setEnableGaussianBlur(value);

    const filterInstances = filtersList.map(
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvasRef.current.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;

    canvasRef.current.fire("object:modified");
  };

  const handleGaussianBlurSigmaChange = (newSigma: number) => {
    const filterName = "Gaussian Blur";
    addLog({
      section: "adjust",
      tab: "filters",
      event: "update",
      message: `${filterName} filter sigma changed from ${gaussianSigma} to ${newSigma}`,
    });
    const filtersList = [...(currentFiltersRef.current || [])];
    console.log("old filters", filtersList);

    updateOrInsert(
      filtersList,
      "gaussianBlur",
      new GaussianBlurFilter({
        sigma: newSigma,
        matrixSize: gaussianMatrixSize,
      }),
      enableGaussianBlur
    );

    setGaussianSigma(newSigma);

    const filterInstances = filtersList.map(
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvasRef.current.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;
  };
  const handleGaussianMatrixSizeChange = (size) => {
    const newSize = parseInt(size);

    const filterName = "Gaussian Blur";
    addLog({
      section: "adjust",
      tab: "filters",
      event: "update",
      message: `${filterName} filter matrix size changed from ${gaussianMatrixSize} to ${newSize}`,
    });
    const filtersList = [...(currentFiltersRef.current || [])];
    console.log("old filters", filtersList);

    updateOrInsert(
      filtersList,
      "gaussianBlur",
      new GaussianBlurFilter({
        sigma: gaussianSigma,
        matrixSize: newSize,
      }),
      enableGaussianBlur
    );

    setGaussianMatrixSize(newSize);

    const filterInstances = filtersList.map(
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvasRef.current.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;

    setGaussianMatrixSize(newSize);

    canvasRef.current.fire("object:modified");
  };

  const handleMedianFilterToggle = (value: boolean) => {
    const filterName = "Median Blur";
    addLog({
      section: "adjust",
      tab: "filters",
      event: "update",
      message: value
        ? `enabled ${filterName} filter`
        : `disabled ${filterName} filter`,
    });

    const filtersList = [...(currentFiltersRef.current || [])];
    console.log("old filters", filtersList);

    updateOrInsert(
      filtersList,
      "medianFilter",
      new MedianFilter({
        matrixSize: medianFilterMatrixSize,
      }),
      value
    );

    setEnableMedianFilter(value);

    const filterInstances = filtersList.map(
      (tempFilter) => tempFilter.instance
    );

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvasRef.current.requestRenderAll();

    setCurrentFilters(filtersList);

    currentFiltersRef.current = filtersList;

    canvasRef.current.fire("object:modified");
  };

  const handleMedianFilterMatrixSizeChange = (size) => {
    const newSize = parseInt(size);

    const filterName = "Median Blur";
    addLog({
      section: "adjust",
      tab: "filters",
      event: "update",
      message: `${filterName} filter matrix size changed from ${medianFilterMatrixSize} to ${newSize}`,
    });
    const filtersList = [...(currentFiltersRef.current || [])];
    console.log("old filters", filtersList);

    updateOrInsert(
      filtersList,
      "medianFilter",
      new MedianFilter({
        matrixSize: newSize,
      }),
      enableMedianFilter
    );

    setMedianFilterMatrixSize(newSize);

    const filterInstances = filtersList.map(
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvasRef.current.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;

    canvasRef.current.fire("object:modified");
  };

  const handleBilateralFilterToggle = (value: boolean) => {
    const filterName = "Bilateral Blur";
    addLog({
      section: "adjust",
      tab: "filters",
      event: "update",
      message: value
        ? `enabled ${filterName} filter`
        : `disabled ${filterName} filter`,
    });

    const filtersList = [...(currentFiltersRef.current || [])];
    console.log("old filters", filtersList);

    updateOrInsert(
      filtersList,
      "bilateralFilter",
      new BilateralFilter({
        sigmaS: bilateralSigmaS,
        sigmaC: bilateralSigmaC,
      }),
      value
    );

    setEnableBilateralFilter(value);

    const filterInstances = filtersList.map(
      (tempFilter) => tempFilter.instance
    );

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvasRef.current.requestRenderAll();

    setCurrentFilters(filtersList);

    currentFiltersRef.current = filtersList;

    canvasRef.current.fire("object:modified");
  };

  const handleBilateralFilterKernelSizeChange = (size) => {
    const newSize = parseInt(size);

    const filterName = "Bilateral Blur";
    addLog({
      section: "adjust",
      tab: "filters",
      event: "update",
      message: `${filterName} filter kernel size changed from ${bilateralKernelSize} to ${newSize}`,
    });
    const filtersList = [...(currentFiltersRef.current || [])];
    console.log("old filters", filtersList);

    updateOrInsert(
      filtersList,
      "bilateralFilter",
      new BilateralFilter({
        sigmaS: bilateralSigmaS,
        sigmaC: bilateralSigmaC,
        kernelSize: newSize,
      }),
      enableBilateralFilter
    );

    setBilateralKernelSize(newSize);

    const filterInstances = filtersList.map(
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvasRef.current.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;

    canvasRef.current.fire("object:modified");
  };

  const handleBilateralFilterSigmaSChange = (size) => {
    const newSize = parseInt(size);

    const filterName = "Bilateral Blur";
    addLog({
      section: "adjust",
      tab: "filters",
      event: "update",
      message: `${filterName} filter sigmaS changed from ${bilateralSigmaS} to ${newSize}`,
    });

    const filtersList = [...(currentFiltersRef.current || [])];
    console.log("old filters", filtersList);

    updateOrInsert(
      filtersList,
      "bilateralFilter",
      new BilateralFilter({
        sigmaS: newSize,
        sigmaC: bilateralSigmaC,
        kernelSize: bilateralKernelSize,
      }),
      enableBilateralFilter
    );

    setBilateralSigmaS(newSize);

    const filterInstances = filtersList.map(
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvasRef.current.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;
  };

  const handleBilateralFilterSigmaCChange = (size) => {
    const newSize = parseInt(size);

    const filterName = "Bilateral Blur";
    addLog({
      section: "adjust",
      tab: "filters",
      event: "update",
      message: `${filterName} filter sigmaC changed from ${bilateralSigmaC} to ${newSize}`,
    });

    const filtersList = [...(currentFiltersRef.current || [])];
    console.log("old filters", filtersList);

    updateOrInsert(
      filtersList,
      "bilateralBlur",
      new BilateralFilter({
        sigmaS: bilateralSigmaS,
        sigmaC: newSize,
        kernelSize: bilateralKernelSize,
      }),
      enableBilateralFilter
    );

    setBilateralSigmaC(newSize);

    const filterInstances = filtersList.map(
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvasRef.current.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;
  };

  const handleApplyFilter = () => {
    addLog({
      section: "adjust",
      tab: "mode",
      event: "update",
      message: "filters permanently applied",
      param: "filters",
      objType: "image",
    });

    disableSavingIntoStackRef.current = true;
    // currentFilters can be null, map is on array. filterName is valid on FilterEntry.
    const filtersInCanvas: string[] = currentFiltersRef.current.map(
      (f) => f.filterName
    );

    allFiltersRef.current = allFiltersRef.current.concat(filtersInCanvas);
    setLoadState(true);

    // Temporarily set visible = false for all objects other than image type
    canvasRef.current.getObjects().forEach((obj) => {
      if (obj.type !== "image") {
        obj.set("visible", false);
      }
    });

    const scaleX = imageRef.current.scaleX;
    const scaleY = imageRef.current.scaleY;
    const flipX = imageRef.current.flipX;
    const filpY = imageRef.current.flipY;
    const angle = imageRef.current.angle;

    imageRef.current.angle = 0;
    imageRef.current.scaleX = 1;
    imageRef.current.scaleY = 1;
    imageRef.current.flipX = false;
    imageRef.current.flipY = false;

    const originalViewportTransform = canvasRef.current.viewportTransform;
    const originalZoom = canvasRef.current.getZoom();

    // Reset to neutral
    canvasRef.current.setViewportTransform([1, 0, 0, 1, 0, 0]);

    canvasRef.current.setZoom(1);
    canvasRef.current
      .getObjects() // fabric.Canvas.getObjects() is okay, find might be an issue if empty.
      .find((obj) => obj.setCoords());

    // Find the object named "Frame" or starting with "Frame"
    const bounds = getRotatedBoundingBox(imageRef.current);
    // canvas.toDataURL is a valid method.
    const dataURL = canvasRef.current.toDataURL({
      format: "png",
      left: bounds.left,
      top: bounds.top,
      width: bounds.width,
      height: bounds.height,
      multiplier: 1,
    });

    FabricImage.fromURL(dataURL).then((img) => {
      if (!img || !imageRef.current) return;
      resetFilters();
      // Replace the image content

      console.log("djf");
      imageRef.current.setElement(img.getElement());

      imageRef.current.scaleX = scaleX;
      imageRef.current.scaleY = scaleY;

      imageRef.current.flipX = flipX;
      imageRef.current.flipY = filpY;

      imageRef.current.angle = angle;

      imageRef.current.opacity = 1.0;

      // imageRef.current.filters = []

      //  set visible = true for all objects other than image type
      canvasRef.current.getObjects().forEach((obj) => {
        if (obj.type !== "image") {
          obj.set("visible", true);
        }
      });

      // Restore zoom & transform
      canvasRef.current.setViewportTransform(originalViewportTransform);
      canvasRef.current.setZoom(originalZoom);
      canvasRef.current
        .getObjects() // fabric.Canvas.getObjects() is okay, find might be an issue if empty.
        .find((obj) => obj.setCoords());

      setTimeout(() => {
        imageRef.current.filters = []; // not sure if it is needed
        disableSavingIntoStackRef.current = false;
        setLoadState(false);
        canvasRef.current.renderAll();
        canvasRef.current.fire("object:modified");
      }, 1000);
    });
  };

  // Handler for Edge Detection Type Change
  const handleEdgeTypeChange = (newType: string) => {
    addLog({
      section: "adjust",
      tab: "edge",
      event: "update",
      message: `Selected edge and applied edge type: ${newType}`,
    });

    const filtersList = [...(currentFiltersRef.current || [])];

    switch (newType) {
      case "canny":
        updateOrInsert(
          filtersList,
          "edge",
          new filters.Composed({
            subFilters: [
              new CannySobelEdge(),
              new NonMaximumSupression(),
              new DoubleThresholding({
                lowThreshold: cannyLowerThreshold,
                highThreshold: cannyUpperThreshold,
              }),
              new Hysteris(),
            ],
          }),
          true
        );
        break;
      case "horizontal":
        updateOrInsert(filtersList, "edge", new HorizontalEdgeFilter(), true);
        break;
      case "vertical":
        updateOrInsert(filtersList, "edge", new VerticalEdgeFilter(), true);
        break;
      case "sobel":
        updateOrInsert(filtersList, "edge", new SobelFilter(), true);
        break;
      default:
        updateOrInsert(
          filtersList,
          "edge",
          new filters.Composed({
            subFilters: [new CannySobelEdge(), new NonMaximumSupression()],
          }),
          false
        );
        updateOrInsert(filtersList, "sobelFilter", new SobelFilter(), false);
        updateOrInsert(
          filtersList,
          "horizontalEdgeFilter",
          new HorizontalEdgeFilter(),
          false
        );
        updateOrInsert(
          filtersList,
          "verticalEdgeFilter",
          new VerticalEdgeFilter(),
          false
        );
        break;
    }

    setSelectedEdgeType(newType);

    const filterInstances = filtersList.map(
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvasRef.current.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;

    canvasRef.current.fire("object:modified");
  };

  // Handlers for Canny Edge Thresholds
  const handleCannyLowerChange = (value: number) => {
    let newLower = value;
    if (newLower >= cannyUpperThreshold) {
      newLower = cannyUpperThreshold - 1; // Ensure lower < upper
    }
    if (newLower < 0) newLower = 0; // Min threshold

    setCannyLowerThreshold(newLower);
    addLog({
      section: "adjust",
      tab: "edge",
      event: "update",
      message: `Canny lower threshold changed to: ${newLower}`,
    });
    if (selectedEdgeType === "canny") {
      const filtersList = [...(currentFiltersRef.current || [])];
      console.log("old filters", filtersList);
      updateOrInsert(
        filtersList,
        "edge",
        new filters.Composed({
          subFilters: [
            new CannySobelEdge(),
            new NonMaximumSupression(),
            new DoubleThresholding({
              lowThreshold: newLower,
              highThreshold: cannyUpperThreshold,
            }),
            new Hysteris(),
          ],
        }),
        true
      );

      const filterInstances = filtersList.map(
        (tempFilter) => tempFilter.instance
      );
      console.log("new filters", filterInstances);

      imageRef.current.filters = filterInstances;

      imageRef.current.applyFilters();

      canvasRef.current.requestRenderAll();

      setCurrentFilters(filtersList);
      currentFiltersRef.current = filtersList;
    }
  };

  const handleCannyUpperChange = (value: number) => {
    let newUpper = value;
    if (newUpper <= cannyLowerThreshold) {
      newUpper = cannyLowerThreshold + 1; // Ensure upper > lower
    }
    if (newUpper > 255) newUpper = 255; // Max threshold

    setCannyUpperThreshold(newUpper);
    addLog({
      section: "adjust",
      tab: "edge",
      event: "update",
      message: `Canny upper threshold changed to: ${newUpper}`,
    });

    if (selectedEdgeType === "canny") {
      const filtersList = [...(currentFiltersRef.current || [])];
      console.log("old filters", filtersList);
      updateOrInsert(
        filtersList,
        "edge",
        new filters.Composed({
          subFilters: [
            new CannySobelEdge(),
            new NonMaximumSupression(),
            new DoubleThresholding({
              lowThreshold: cannyLowerThreshold,
              highThreshold: newUpper,
            }),
            new Hysteris(),
          ],
        }),
        true
      );

      const filterInstances = filtersList.map(
        (tempFilter) => tempFilter.instance
      );
      console.log("new filters", filterInstances);

      imageRef.current.filters = filterInstances;

      imageRef.current.applyFilters();

      canvasRef.current.requestRenderAll();

      setCurrentFilters(filtersList);
      currentFiltersRef.current = filtersList;
    }
  };

  const startSwril = useCallback((o) => {
    const pointer = canvasRef.current?.getScenePoint(o.e);
    if (!pointer || !imageRef.current) return;

    // Get image bounds
    const imageBounds = imageRef.current.getBoundingRect();

    // Check if click is within image bounds
    if (
      pointer.x < imageBounds.left ||
      pointer.x > imageBounds.left + imageBounds.width ||
      pointer.y < imageBounds.top ||
      pointer.y > imageBounds.top + imageBounds.height
    ) {
      return;
    }

    // Convert pointer coordinates to image-relative coordinates (0-1)
    pointer.x = (pointer.x - imageBounds.left) / imageBounds.width;
    pointer.y = (pointer.y - imageBounds.top) / imageBounds.height;

    const filtersList = [...(currentFiltersRef.current || [])];
    console.log("currentFiltersRef.current", currentFiltersRef.current);

    const index = filtersList.findIndex((f) => f.filterName === "swirl");

    if (index !== -1) {
      const swirlFilter = filtersList[index].instance as filters.Composed;
      // Create a new array with the existing subfilters plus the new one
      const newSubFilters = [
        ...swirlFilter.subFilters,
        new Swirl({
          radius: swirlRadiusRef.current,
          angle: swirlAngleRef.current,
          center: { x: pointer.x, y: pointer.y },
        }),
      ];
      // Create a new composed filter with all subfilters
      filtersList[index] = {
        instance: new filters.Composed({
          subFilters: newSubFilters,
        }),
        filterName: "swirl",
      };
    } else {
      filtersList.push({
        instance: new filters.Composed({
          subFilters: [
            new Swirl({
              radius: swirlRadiusRef.current,
              angle: swirlAngleRef.current,
              center: { x: pointer.x, y: pointer.y },
            }),
          ],
        }),
        filterName: "swirl",
      });
    }

    const filterInstances = filtersList.map(
      (tempFilter) => tempFilter.instance
    );

    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;
    imageRef.current.applyFilters();
    canvasRef.current?.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;

    addLog({
      section: "adjust",
      tab: "swirl",
      event: "create",
      message: `added new swril`,
    });
  }, []);

  const endSwril = useCallback(() => {
    canvasRef.current?.fire("object:modified");
  }, []);

  const activateSwril = () => {
    console.log("Activating swirl - adding event listeners");
    addLog({
      section: "adjust",
      tab: "swirl",
      event: "update",
      message: `Selected swirl filter`,
    });

    setActiveToolNameRef(activeToolNameRef, "swirl");

    canvasRef.current?.on("mouse:down", startSwril);
    canvasRef.current?.on("mouse:up", endSwril);
  };

  const deactivateSwril = () => {
    console.log("Deactivating swirl - removing event listeners");
    addLog({
      section: "adjust",
      tab: "swirl",
      event: "update",
      message: `Deactivated swirl filter`,
    });

    if (canvasRef.current) {
      setActiveToolNameRef(activeToolNameRef, "");
      canvasRef.current.off("mouse:down", startSwril);
      canvasRef.current.off("mouse:up", endSwril);
      console.log("Event listeners removed");
    }
  };

  const activateBulge = () => {
    console.log("started bulghe");
    addLog({
      section: "adjust",
      tab: "bulge",
      event: "update",
      message: `Selected bulge filter`,
    });

    setActiveToolNameRef(activeToolNameRef, "bulge");
    canvasRef.current?.on("mouse:down", startBulge);
    canvasRef.current?.on("mouse:up", endBulge);
  };

  const deactivateBulge = () => {
    console.log("deactivated bulge");
    addLog({
      section: "adjust",
      tab: "bulge",
      event: "update",
      message: `Deactivated bulge filter`,
    });

    setActiveToolNameRef(activeToolNameRef, "");
    canvasRef.current?.off("mouse:down", startBulge);
    canvasRef.current?.off("mouse:up", endBulge);
  };

  const startBulge = useCallback((o) => {
    const pointer = canvasRef.current?.getScenePoint(o.e);
    if (!pointer || !imageRef.current) return;

    // Get image bounds
    const imageBounds = imageRef.current.getBoundingRect();

    // Check if click is within image bounds
    if (
      pointer.x < imageBounds.left ||
      pointer.x > imageBounds.left + imageBounds.width ||
      pointer.y < imageBounds.top ||
      pointer.y > imageBounds.top + imageBounds.height
    ) {
      return;
    }

    // Convert pointer coordinates to image-relative coordinates (0-1)
    pointer.x = (pointer.x - imageBounds.left) / imageBounds.width;
    pointer.y = (pointer.y - imageBounds.top) / imageBounds.height;

    const filtersList = [...(currentFiltersRef.current || [])];

    const index = filtersList.findIndex((f) => f.filterName === "bulge");

    if (index !== -1) {
      const bulgeFilter = filtersList[index].instance as filters.Composed;
      bulgeFilter.subFilters.push(
        new BulgeFilter({
          radius: bulgeRadiusRef.current,
          strength: bulgeStrengthRef.current,
          center: { x: pointer.x, y: pointer.y },
        })
      );
      filtersList[index] = {
        instance: bulgeFilter,
        filterName: `bulge`,
      };
    } else {
      filtersList.push({
        instance: new filters.Composed({
          subFilters: [
            new BulgeFilter({
              radius: bulgeRadiusRef.current,
              strength: bulgeStrengthRef.current,
              center: { x: pointer.x, y: pointer.y },
            }),
          ],
        }),
        filterName: `bulge`,
      });
    }

    const filterInstances = filtersList.map(
      (tempFilter) => tempFilter.instance
    );

    imageRef.current.filters = filterInstances;
    imageRef.current.applyFilters();
    canvasRef.current?.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;

    addLog({
      section: "adjust",
      tab: "bulge",
      event: "create",
      message: `added new bulge`,
    });
  }, []);

  const endBulge = useCallback(() => {
    canvasRef.current?.fire("object:modified");
  }, []);

  const handleBulgeFilterReset = () => {
    const filtersList = [...(currentFiltersRef.current || [])];

    const index = filtersList.findIndex((f) => f.filterName === "bulge");
    if (index !== -1) {
      filtersList.splice(index, 1);
      const filterInstances = filtersList.map(
        (tempFilter) => tempFilter.instance
      );

      imageRef.current.filters = filterInstances;
      imageRef.current.applyFilters();
      canvasRef.current?.requestRenderAll();

      setCurrentFilters(filtersList);
      currentFiltersRef.current = filtersList;
    }

    setBulgeRadius(0.3);
    setBulgeStrength(0.5);
  };

  const handleSwirlFilterReset = () => {
    const filtersList = [...(currentFiltersRef.current || [])];
    const index = filtersList.findIndex((f) => f.filterName === "swirl");
    if (index !== -1) {
      filtersList.splice(index, 1);
    }

    const filterInstances = filtersList.map(
      (tempFilter) => tempFilter.instance
    );

    imageRef.current.filters = filterInstances;
    imageRef.current.applyFilters();
    canvasRef.current?.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;

    setSwirlRadius(0.3);
    setSwirlAngle(1.0);
  };

  const [activateTab, setActivateTab] = useState<string>("reflect");
  const prevTabRef = useRef<string>(activateTab);

  useEffect(() => {
    console.log(prevTabRef.current, activateTab);
    if (prevTabRef.current !== activateTab) {
      if (prevTabRef.current === "morph") {
        console.log("morph deactivated");
        setActivateLiquidifyTool("");
        deactivateBulge();
        deactivateSwril();
      }
    }

    prevTabRef.current = activateTab;
  }, [activateTab]);

  return (
    <div className="max-h-full flex flex-col items-center justify-center w-full gap-4">
      <Tabs
        defaultValue="reflect"
        value={activateTab}
        onValueChange={(value) => setActivateTab(value)}
        className="w-full flex-1 flex flex-col rounded-none"
      >
        <div className="border-b border-gray-200 dark:border-gray-800">
          <TabsList className="w-full grid grid-cols-3 rounded-none">
            <TabsTrigger value="reflect">Reflect</TabsTrigger>
            <TabsTrigger value="morph">Liquify</TabsTrigger>
            <TabsTrigger value="edge">Edge</TabsTrigger>
          </TabsList>
        </div>

        {/* Reflect Filters Tab */}
        <TabsContent
          value="reflect"
          className="flex-1 flex flex-col justify-center items-center"
        >
          <div className="w-[90%]">
            <Card>
              <CardHeader>
                <CardDescription className="text-center">
                  Reflection Controls
                </CardDescription>
              </CardHeader>
              <CardContent className="w-full flex flex-col gap-2">
                <div className="grid grid-cols-3 gap-4">
                  <div
                    onClick={() =>
                      handleReflectFilter(
                        "leftToRight",
                        !enableLeftToRightReflect
                      )
                    }
                    className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer ${
                      enableLeftToRightReflect
                        ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                        : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${
                        enableLeftToRightReflect
                          ? "bg-blue-200 dark:bg-blue-800"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <FlipHorizontal
                        size={20}
                        className={
                          enableLeftToRightReflect
                            ? "text-blue-600"
                            : "text-gray-600"
                        }
                      />
                    </div>
                    <span className="text-sm font-medium">Left</span>
                  </div>

                  <div
                    onClick={() =>
                      handleReflectFilter(
                        "rightToLeft",
                        !enableRightToLeftReflect
                      )
                    }
                    className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer ${
                      enableRightToLeftReflect
                        ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                        : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${
                        enableRightToLeftReflect
                          ? "bg-blue-200 dark:bg-blue-800"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <FlipHorizontal
                        size={20}
                        className={
                          enableRightToLeftReflect
                            ? "text-blue-600"
                            : "text-gray-600"
                        }
                      />
                    </div>
                    <span className="text-sm font-medium">Right</span>
                  </div>

                  <div
                    onClick={() =>
                      handleReflectFilter(
                        "topToBottom",
                        !enableTopToBottomReflect
                      )
                    }
                    className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer ${
                      enableTopToBottomReflect
                        ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                        : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${
                        enableTopToBottomReflect
                          ? "bg-blue-200 dark:bg-blue-800"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <FlipVertical
                        size={20}
                        className={
                          enableTopToBottomReflect
                            ? "text-blue-600"
                            : "text-gray-600"
                        }
                      />
                    </div>
                    <span className="text-sm font-medium">Top</span>
                  </div>

                  <div
                    onClick={() =>
                      handleReflectFilter(
                        "bottomToTop",
                        !enableBottomToTopReflect
                      )
                    }
                    className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer ${
                      enableBottomToTopReflect
                        ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                        : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${
                        enableBottomToTopReflect
                          ? "bg-blue-200 dark:bg-blue-800"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <FlipVertical
                        size={20}
                        className={
                          enableBottomToTopReflect
                            ? "text-blue-600"
                            : "text-gray-600"
                        }
                      />
                    </div>
                    <span className="text-sm font-medium">Bottom</span>
                  </div>

                  <div
                    onClick={() =>
                      handleReflectFilter("topLeft", !enableTopLeftReflect)
                    }
                    className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer ${
                      enableTopLeftReflect
                        ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                        : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${
                        enableTopLeftReflect
                          ? "bg-blue-200 dark:bg-blue-800"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <CornerLeftUp
                        size={20}
                        className={
                          enableTopLeftReflect
                            ? "text-blue-600"
                            : "text-gray-600"
                        }
                      />
                    </div>
                    <span className="text-sm font-medium pointer-events-none">
                      Top-Left
                    </span>
                  </div>

                  <div
                    onClick={() =>
                      handleReflectFilter("topRight", !enableTopRightReflect)
                    }
                    className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer ${
                      enableTopRightReflect
                        ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                        : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${
                        enableTopRightReflect
                          ? "bg-blue-200 dark:bg-blue-800"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <CornerRightUp
                        size={20}
                        className={
                          enableTopRightReflect
                            ? "text-blue-600"
                            : "text-gray-600"
                        }
                      />
                    </div>
                    <span className="text-sm font-medium pointer-events-none">
                      Top-Right
                    </span>
                  </div>

                  <div
                    onClick={() =>
                      handleReflectFilter(
                        "bottomLeft",
                        !enableBottomLeftReflect
                      )
                    }
                    className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer ${
                      enableBottomLeftReflect
                        ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                        : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${
                        enableBottomLeftReflect
                          ? "bg-blue-200 dark:bg-blue-800"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <CornerLeftDown
                        size={20}
                        className={
                          enableBottomLeftReflect
                            ? "text-blue-600"
                            : "text-gray-600"
                        }
                      />
                    </div>
                    <span className="text-sm font-medium pointer-events-none">
                      Bottom-Left
                    </span>
                  </div>

                  <div
                    onClick={() =>
                      handleReflectFilter(
                        "bottomRight",
                        !enableBottomRightReflect
                      )
                    }
                    className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer ${
                      enableBottomRightReflect
                        ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                        : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${
                        enableBottomRightReflect
                          ? "bg-blue-200 dark:bg-blue-800"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <CornerRightDown
                        size={20}
                        className={
                          enableBottomRightReflect
                            ? "text-blue-600"
                            : "text-gray-600"
                        }
                      />
                    </div>
                    <span className="text-sm font-medium pointer-events-none">
                      Bottom-Right
                    </span>
                  </div>

                  <div
                    onClick={() =>
                      handleReflectFilter(
                        "leftDiagonal",
                        !enableLeftDiagonalReflect
                      )
                    }
                    className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer ${
                      enableLeftDiagonalReflect
                        ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                        : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${
                        enableLeftDiagonalReflect
                          ? "bg-blue-200 dark:bg-blue-800"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={
                          enableLeftDiagonalReflect ? "#2563eb" : "#4b5563"
                        }
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="4" y1="20" x2="20" y2="4" />
                        <polyline points="4,4 4,20 20,20" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium pointer-events-none">
                      Left Diagonal
                    </span>
                  </div>

                  <div
                    onClick={() =>
                      handleReflectFilter(
                        "rightDiagonal",
                        !enableRightDiagonalReflect
                      )
                    }
                    className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer ${
                      enableRightDiagonalReflect
                        ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                        : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${
                        enableRightDiagonalReflect
                          ? "bg-blue-200 dark:bg-blue-800"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={
                          enableRightDiagonalReflect ? "#2563eb" : "#4b5563"
                        }
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="4" y1="4" x2="20" y2="20" />
                        <polyline points="20,4 20,20 4,20" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium pointer-events-none">
                      Right Diagonal
                    </span>
                  </div>
                </div>

                <button
                  className="w-full mt-2 p-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm"
                  onClick={() => handleReflectFilterReset()}
                >
                  Reset All
                </button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent
          value="morph"
          className="w-full flex flex-col justify-center items-center space-y-2"
          onSelect={() => {
            console.log("ksdf");
          }}
        >
          <div className="w-[90%]">
            <Card>
              <CardHeader>
                <CardDescription className="text-center">
                  Liquify Controls
                </CardDescription>
              </CardHeader>
              <CardContent className="w-full flex flex-col gap-4">
                {/* Tool Selection */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Swirl Tool */}
                  <div
                    className={`group relative flex flex-col items-center p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                      activateLiquidifyTool === "swirl"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                    onClick={() => {
                      if (activateLiquidifyTool === "swirl") {
                        deactivateSwril();
                        setActivateLiquidifyTool("");
                      } else {
                        // Deactivate other tools first
                        if (activateLiquidifyTool === "bulge") {
                          deactivateBulge();
                        }
                        activateSwril();
                        setActivateLiquidifyTool("swirl");
                      }
                    }}
                  >
                    <div
                      className={`p-3 rounded-full mb-2 transition-colors duration-200 ${
                        activateLiquidifyTool === "swirl"
                          ? "bg-blue-100 dark:bg-blue-800"
                          : "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                      }`}
                    >
                      <SwirlIcon
                        size={24}
                        className={`transition-colors duration-200 ${
                          activateLiquidifyTool === "swirl"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Swirl
                    </span>
                  </div>

                  {/* Bulge Tool */}
                  <div
                    className={`group relative flex flex-col items-center p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                      activateLiquidifyTool === "bulge"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                    onClick={() => {
                      if (activateLiquidifyTool === "bulge") {
                        deactivateBulge();
                        setActivateLiquidifyTool("");
                      } else {
                        // Deactivate other tools first
                        if (activateLiquidifyTool === "swirl") {
                          deactivateSwril();
                        }
                        activateBulge();
                        setActivateLiquidifyTool("bulge");
                      }
                    }}
                  >
                    <div
                      className={`p-3 rounded-full mb-2 transition-colors duration-200 ${
                        activateLiquidifyTool === "bulge"
                          ? "bg-blue-100 dark:bg-blue-800"
                          : "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                      }`}
                    >
                      <BulgeIcon
                        size={24}
                        className={`transition-colors duration-200 ${
                          activateLiquidifyTool === "bulge"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bulge
                    </span>
                  </div>
                </div>

                {/* Tool Controls */}
                <div className="space-y-4">
                  {/* Swirl Controls */}
                  {activateLiquidifyTool === "swirl" && (
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-4">
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 text-sm">
                          <p>Radius</p>
                          <p className="font-medium">
                            {swirlRadius.toFixed(2)}
                          </p>
                        </div>
                        <Slider
                          value={[swirlRadius]}
                          min={0}
                          max={1}
                          step={0.01}
                          onValueChange={(e) => {
                            swirlRadiusRef.current = e[0];
                            setSwirlRadius(e[0]);
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 text-sm">
                          <p>Strength</p>
                          <p className="font-medium">
                            {(swirlAngle / Math.PI).toFixed(2)}
                          </p>
                        </div>
                        <Slider
                          value={[swirlAngle]}
                          min={-3.14}
                          max={3.14}
                          step={0.01}
                          onValueChange={(e) => {
                            swirlAngleRef.current = e[0];
                            setSwirlAngle(e[0]);
                          }}
                        />
                      </div>
                      <button
                        className="w-full mt-2 p-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm"
                        onClick={() => handleSwirlFilterReset()}
                      >
                        Reset All
                      </button>
                    </div>
                  )}

                  {/* Bulge Controls */}
                  {activateLiquidifyTool === "bulge" && (
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-4">
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 text-sm">
                          <p>Radius</p>
                          <p className="font-medium">
                            {bulgeRadius.toFixed(2)}
                          </p>
                        </div>
                        <Slider
                          value={[bulgeRadius]}
                          min={0}
                          max={1}
                          step={0.01}
                          onValueChange={(e) => {
                            bulgeRadiusRef.current = e[0];
                            setBulgeRadius(e[0]);
                          }}
                        />
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 text-sm">
                          <p>Strength</p>
                          <p className="font-medium">
                            {bulgeStrength.toFixed(2)}
                          </p>
                        </div>
                        <Slider
                          value={[bulgeStrength]}
                          min={0}
                          max={1}
                          step={0.01}
                          onValueChange={(e) => {
                            bulgeStrengthRef.current = e[0];
                            setBulgeStrength(e[0]);
                          }}
                        />
                      </div>

                      <button
                        className="w-full mt-2 p-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm"
                        onClick={() => handleBulgeFilterReset()}
                      >
                        Reset All
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent
          value="edge"
          className="w-full flex flex-col justify-center items-center space-y-2"
        >
          <div className="w-[90%]">
            <Card className="w-full">
              <CardHeader>
                <CardDescription className="text-center text-base font-semibold">
                  Edge Detection Controls
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-700/30 rounded-md">
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    <strong>Note:</strong> For edge detection, images should
                    already be in gray scaled and blurrred. Canny edge detection
                    is an approximation and may not produce results identical to
                    server-side implementations.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      Edge Type
                    </label>
                    <Select
                      value={selectedEdgeType}
                      onValueChange={handleEdgeTypeChange}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="horizontal">
                          Horizontal Edge
                        </SelectItem>

                        <SelectItem value="vertical">Vertical Edge</SelectItem>
                        <SelectItem value="sobel">Sobel Edge</SelectItem>
                        <SelectItem value="canny">Canny Edge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Canny Edge Specific Options - Placeholder */}
                  {selectedEdgeType === "canny" && (
                    <div className="flex flex-col gap-4 px-2 border-t pt-4 mt-2">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Canny Edge Options
                      </h3>
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-xs">
                          <p>Lower Threshold</p>
                          <p>{cannyLowerThreshold}</p>
                        </div>
                        <Slider
                          value={[cannyLowerThreshold]}
                          min={0}
                          max={255}
                          step={1}
                          onValueChange={(e) => handleCannyLowerChange(e[0])}
                          onValueCommit={() =>
                            canvasRef.current.fire("object:modified")
                          }
                          disabled={selectedEdgeType !== "canny"}
                        />
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 text-xs">
                          <p>Upper Threshold</p>
                          <p>{cannyUpperThreshold}</p>
                        </div>
                        <Slider
                          value={[cannyUpperThreshold]}
                          min={0}
                          max={255}
                          step={1}
                          onValueChange={(e) => handleCannyUpperChange(e[0])}
                          onValueCommit={() =>
                            canvasRef.current.fire("object:modified")
                          }
                          disabled={selectedEdgeType !== "canny"}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="w-[90%]">
            <Card className="w-full">
              <CardHeader>
                <CardDescription className="text-center text-base font-semibold">
                  Blur Controls
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                {/* Gaussian Blur Section */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-row justify-between items-center pb-2 border-b">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      Gaussian Blur
                    </span>
                    <Switch
                      checked={enableGaussianBlur}
                      onCheckedChange={() => {
                        handleGaussianBlurFilterToggle(!enableGaussianBlur);
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-4 px-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600 dark:text-gray-400">
                        Matrix Size
                      </label>
                      <Select
                        value={gaussianMatrixSize.toString()}
                        onValueChange={handleGaussianMatrixSizeChange}
                        disabled={!enableGaussianBlur}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3×3</SelectItem>
                          <SelectItem value="5">5×5</SelectItem>
                          <SelectItem value="7">7×7</SelectItem>
                          <SelectItem value="9">9×9</SelectItem>
                          <SelectItem value="11">11×11</SelectItem>
                          <SelectItem value="13">13×13</SelectItem>
                          <SelectItem value="15">15×15</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center text-slate-400 text-sm">
                        <p>Sigma</p>
                        <p>{gaussianSigma}</p>
                      </div>

                      <Slider
                        value={[gaussianSigma]}
                        min={0}
                        max={10}
                        step={0.01}
                        onValueChange={(e) => {
                          handleGaussianBlurSigmaChange(e[0]);
                        }}
                        onValueCommit={() => {
                          canvasRef.current.fire("object:modified");
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bilateral Blur Section */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-row justify-between items-center pb-2 border-b">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      Bilateral Blur
                    </span>
                    <Switch
                      checked={enableBilateralFilter}
                      onCheckedChange={() => {
                        handleBilateralFilterToggle(!enableBilateralFilter);
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-4 px-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600 dark:text-gray-400">
                        Matrix Size
                      </label>
                      <Select
                        value={bilateralKernelSize.toString()}
                        onValueChange={handleBilateralFilterKernelSizeChange}
                        disabled={!enableBilateralFilter}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="7">7</SelectItem>
                          <SelectItem value="9">9</SelectItem>
                          <SelectItem value="11">11</SelectItem>
                          <SelectItem value="13">13</SelectItem>
                          <SelectItem value="15">15</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center text-slate-400 text-sm">
                        <p>Spatial Sigma</p>
                        <p>{bilateralSigmaS}</p>
                      </div>

                      <Slider
                        value={[bilateralSigmaS]}
                        min={1}
                        max={100}
                        step={1}
                        onValueChange={(e) => {
                          handleBilateralFilterSigmaSChange(e[0]);
                        }}
                        onValueCommit={() => {
                          canvasRef.current.fire("object:modified");
                        }}
                      />
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center text-slate-400 text-sm">
                        <p>Color Sigma</p>
                        <p>{bilateralSigmaC}</p>
                      </div>

                      <Slider
                        value={[bilateralSigmaC]}
                        min={1}
                        max={100}
                        step={1}
                        onValueChange={(e) => {
                          handleBilateralFilterSigmaCChange(e[0]);
                        }}
                        onValueCommit={() => {
                          canvasRef.current.fire("object:modified");
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Median Filter Section */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-row justify-between items-center pb-2 border-b">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      Median Filter
                    </span>
                    <Switch
                      checked={enableMedianFilter}
                      onCheckedChange={() => {
                        handleMedianFilterToggle(!enableMedianFilter);
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-4 px-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600 dark:text-gray-400">
                        Matrix Size
                      </label>
                      <Select
                        value={medianFilterMatrixSize.toString()}
                        onValueChange={handleMedianFilterMatrixSizeChange}
                        disabled={!enableMedianFilter}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3×3</SelectItem>
                          <SelectItem value="5">5×5</SelectItem>
                          <SelectItem value="7">7×7</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription className="text-center">Mode</CardDescription>
          </CardHeader>

          <CardContent className="w-full">
            <div className="flex flex-col gap-4 w-full">
              <button
                className="custom-button"
                onClick={() => handleApplyFilter()}
              >
                Apply
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdjustSidebarAdvanced;
