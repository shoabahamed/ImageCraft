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

import { getRotatedBoundingBox } from "@/utils/commonFunctions";
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

  const handleGaussianMatrixSizeChange = (size) => {
    const newSize = parseInt(size);
    setGaussianMatrixSize(newSize);
  };

  const handleBilateralKernelSizeChange = (size) => {
    const newSize = parseInt(size);
    setBilateralKernelSize(newSize);
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

        {/* Preset Filters Tab */}
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
                      setEnableLeftToRightReflect(!enableLeftToRightReflect)
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
                      setEnableRightToLeftReflect(!enableRightToLeftReflect)
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
                      setEnableTopToBottomReflect(!enableTopToBottomReflect)
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
                      setEnableBottomToTopReflect(!enableBottomToTopReflect)
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
                      setEnableTopLeftReflect(!enableTopLeftReflect)
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
                      setEnableTopRightReflect(!enableTopRightReflect)
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
                      setEnableBottomLeftReflect(!enableBottomLeftReflect)
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
                      setEnableBottomRightReflect(!enableBottomRightReflect)
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
                      setEnableLeftDiagonalReflect(!enableLeftDiagonalReflect)
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
                      setEnableRightDiagonalReflect(!enableRightDiagonalReflect)
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
                        const filterName = "Gaussian Blur";
                        addLog({
                          section: "adjust",
                          tab: "threshold",
                          event: "update",
                          message: !enableGaussianBlur
                            ? `enabled ${filterName} filter`
                            : `disabled ${filterName} filter`,
                        });

                        setEnableGaussianBlur(!enableGaussianBlur);
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

                    <CustomSlider
                      sliderName="Sigma"
                      min={0}
                      max={10}
                      step={0.01}
                      sliderValue={gaussianSigma}
                      defaultValue={gaussianSigma}
                      setSliderValue={setGaussianSigma}
                      section="adjust"
                      tab="gaussian_blur"
                      disabled={!enableGaussianBlur}
                    />
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
                        const filterName = "Bilateral Blur";
                        addLog({
                          section: "adjust",
                          tab: "blur",
                          event: "update",
                          message: !enableBilateralFilter
                            ? `enabled ${filterName} filter`
                            : `disabled ${filterName} filter`,
                        });

                        setEnableBilateralFilter(!enableBilateralFilter);
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
                        onValueChange={handleBilateralKernelSizeChange}
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

                    <CustomSlider
                      sliderName="Spatial Sigma"
                      min={1}
                      max={100}
                      step={1}
                      sliderValue={bilateralSigmaS}
                      defaultValue={bilateralSigmaS}
                      setSliderValue={setBilateralSigmaS}
                      section="adjust"
                      tab="blur"
                      disabled={!enableBilateralFilter}
                    />
                    <CustomSlider
                      sliderName="Color Sigma"
                      min={1}
                      max={100}
                      step={1}
                      sliderValue={bilateralSigmaC}
                      defaultValue={bilateralSigmaC}
                      setSliderValue={setBilateralSigmaC}
                      section="adjust"
                      tab="blur"
                      disabled={!enableBilateralFilter}
                    />
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
                        const filterName = "Median Filter";
                        addLog({
                          section: "adjust",
                          tab: "blur",
                          event: "update",
                          message: !enableMedianFilter
                            ? `enabled ${filterName} filter`
                            : `disabled ${filterName} filter`,
                        });

                        setEnableMedianFilter(!enableMedianFilter);
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
                        onValueChange={(size) =>
                          setMedianFilterMatrixSize(parseInt(size))
                        }
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
