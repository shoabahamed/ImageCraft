import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

import CustomSlider from "@/components/custom-slider";
import { Canvas, FabricImage } from "fabric";
import { useLogContext } from "@/hooks/useLogContext";
import { useAdjustStore } from "@/hooks/appStore/AdjustStore";

import { getRotatedBoundingBox, updateOrInsert } from "@/utils/commonFunctions";
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

type AdjustSidebarProps = {
  canvas: Canvas;
  image: FabricImage;
  imageRef: React.RefObject<FabricImage>;
  databaseFiltersName: string[] | null;
  databaseFiltersObject: object[] | null;
  setLoadState: (value: boolean) => void;
};

const AdjustSidebarAdvanced = ({
  canvas,
  image,
  imageRef,
  setLoadState,
}: AdjustSidebarProps) => {
  const { addLog } = useLogContext(); // Use log context
  const { disableSavingIntoStackRef, allFiltersRef } = useCanvasObjects();
  const currentFilters = useCommonProps((state) => state.currentFilters);
  const setCurrentFilters = useCommonProps((state) => state.setCurrentFilters);
  const { currentFiltersRef } = useCanvasObjects();

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

  const handleReflectFilter = (filterName: string, value: boolean) => {
    addLog({
      section: "adjust",
      tab: "filter",
      event: "update",
      message: `${filterName} filter ${value ? "enabled" : "disabled"}`,
    });

    const filtersList = [...(currentFilters || [])];
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
      //@ts-ignore
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvas.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;

    canvas.fire("object:modified");
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

    const filtersList = [...(currentFilters || [])];

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
      //@ts-ignore
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;
    imageRef.current.applyFilters();
    canvas.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;

    canvas.fire("object:modified");
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

    const filtersList = [...(currentFilters || [])];
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
      //@ts-ignore
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvas.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;

    canvas.fire("object:modified");
  };

  const handleGaussianBlurSigmaChange = (newSigma: number) => {
    const filterName = "Gaussian Blur";
    addLog({
      section: "adjust",
      tab: "filters",
      event: "update",
      message: `${filterName} filter sigma changed from ${gaussianSigma} to ${newSigma}`,
    });
    const filtersList = [...(currentFilters || [])];
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
      //@ts-ignore
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvas.requestRenderAll();

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
    const filtersList = [...(currentFilters || [])];
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
      //@ts-ignore
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvas.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;

    setGaussianMatrixSize(newSize);

    canvas.fire("object:modified");
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

    const filtersList = [...(currentFilters || [])];
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
      //@ts-ignore
      (tempFilter) => tempFilter.instance
    );

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvas.requestRenderAll();

    setCurrentFilters(filtersList);

    currentFiltersRef.current = filtersList;

    canvas.fire("object:modified");
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
    const filtersList = [...(currentFilters || [])];
    console.log("old filters", filtersList);

    updateOrInsert(
      filtersList,
      "medianBlur",
      new MedianFilter({
        matrixSize: newSize,
      }),
      enableMedianFilter
    );

    setMedianFilterMatrixSize(newSize);

    const filterInstances = filtersList.map(
      //@ts-ignore
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvas.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;

    canvas.fire("object:modified");
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

    const filtersList = [...(currentFilters || [])];
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
      //@ts-ignore
      (tempFilter) => tempFilter.instance
    );

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvas.requestRenderAll();

    setCurrentFilters(filtersList);

    currentFiltersRef.current = filtersList;

    canvas.fire("object:modified");
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
    const filtersList = [...(currentFilters || [])];
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
      //@ts-ignore
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvas.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;

    canvas.fire("object:modified");
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

    const filtersList = [...(currentFilters || [])];
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
      //@ts-ignore
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvas.requestRenderAll();

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

    const filtersList = [...(currentFilters || [])];
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
      //@ts-ignore
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvas.requestRenderAll();

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
    //@ts-ignore
    const filtersInCanvas: string[] = currentFilters.map((f) => f.filterName);
    allFiltersRef.current = allFiltersRef.current.concat(filtersInCanvas);
    setLoadState(true);

    // Temporarily set visible = false for all objects other than image type
    canvas.getObjects().forEach((obj) => {
      if (obj.type !== "image") {
        obj.set("visible", false);
      }
    });

    const scaleX = image.scaleX;
    const scaleY = image.scaleY;
    const flipX = image.flipX;
    const filpY = image.flipY;
    const angle = image.angle;

    image.angle = 0;
    image.scaleX = 1;
    image.scaleY = 1;
    image.flipX = false;
    image.flipY = false;

    const originalViewportTransform = canvas.viewportTransform;
    const originalZoom = canvas.getZoom();

    // Reset to neutral
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

    canvas.setZoom(1);
    canvas
      .getObjects() // @ts-ignore
      .find((obj) => obj.setCoords());

    // Find the object named "Frame" or starting with "Frame"
    const bounds = getRotatedBoundingBox(image);
    //@ts-ignore
    const dataURL = canvas.toDataURL({
      format: "png",
      left: bounds.left,
      top: bounds.top,
      width: bounds.width,
      height: bounds.height,
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

      image = imageRef.current;

      //  set visible = true for all objects other than image type
      canvas.getObjects().forEach((obj) => {
        if (obj.type !== "image") {
          obj.set("visible", true);
        }
      });

      // Restore zoom & transform
      canvas.setViewportTransform(originalViewportTransform);
      canvas.setZoom(originalZoom);
      canvas
        .getObjects() // @ts-ignore
        .find((obj) => obj.setCoords());

      setTimeout(() => {
        imageRef.current.filters = []; // not sure if it is needed
        disableSavingIntoStackRef.current = false;
        setLoadState(false);
        canvas.renderAll();
        canvas.fire("object:modified");
      }, 1000);
    });
  };

  return (
    <div className="max-h-full flex flex-col items-center justify-center w-full gap-4">
      <Tabs
        defaultValue="reflect"
        className="w-full flex-1 flex flex-col rounded-none"
      >
        <div className="border-b border-gray-200 dark:border-gray-800">
          <TabsList className="w-full grid grid-cols-4 rounded-none">
            <TabsTrigger value="reflect">Reflect</TabsTrigger>
            <TabsTrigger value="blur">Blur</TabsTrigger>
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
                    <span className="text-sm font-medium">Top-Left</span>
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
                    <span className="text-sm font-medium">Top-Right</span>
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
                    <span className="text-sm font-medium">Bottom-Left</span>
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
                    <span className="text-sm font-medium">Bottom-Right</span>
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
                    <span className="text-sm font-medium">Left Diagonal</span>
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
                    <span className="text-sm font-medium">Right Diagonal</span>
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
          value="blur"
          className="w-full flex flex-col justify-center items-center space-y-2"
        >
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
                          canvas.fire("object:modified");
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
                          canvas.fire("object:modified");
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
                          canvas.fire("object:modified");
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
