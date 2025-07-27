import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

import { Canvas, FabricImage, filters } from "fabric";
import { useLogContext } from "@/hooks/useLogContext";
import { useAdjustStore } from "@/hooks/appStore/AdjustStore";

import { updateOrInsert } from "@/utils/commonFunctions";
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";

import { Switch } from "@/components/ui/switch";
import { useCommonProps } from "@/hooks/appStore/CommonProps";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { GaussianBlurFilter } from "@/utils/GaussianBlurFilter";
import { MedianFilter } from "@/utils/MedianFilter";
import { BilateralFilter } from "@/utils/BilteralFilter";
import { Slider } from "./ui/slider";
import { SobelFilter } from "@/utils/SobelFilter";
import { HorizontalEdgeFilter } from "@/utils/HorizontalEdge";
import { VerticalEdgeFilter } from "@/utils/VerticalFilter";
import { NonMaximumSupression } from "@/utils/NonMaximumSupression";
import { CannySobelEdge } from "@/utils/CannySobelEdge";
import { DoubleThresholding } from "@/utils/DoubleThresholding";
import { Hysteris } from "@/utils/Hysteris";

interface FilterEntry {
  filterName: string;
  instance: filters.BaseFilter<
    string,
    Record<string, unknown>,
    Record<string, unknown>
  >;
}

type Props = {
  canvasRef: React.RefObject<Canvas>;
  imageRef: React.RefObject<FabricImage>;
};

const EdgeFiltersTab = ({ canvasRef, imageRef }: Props) => {
  const { addLog } = useLogContext();
  const setCurrentFilters = useCommonProps((state) => state.setCurrentFilters);
  const { currentFiltersRef } = useCanvasObjects() as {
    currentFiltersRef: React.MutableRefObject<FilterEntry[] | null>;
  };

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
      "bilateralFilter",
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

  return (
    <>
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
                <strong>Note:</strong> For edge detection, images should already
                be in gray scaled and blurrred. Canny edge detection is an
                approximation and may not produce results identical to
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
                    <SelectItem value="horizontal">Horizontal Edge</SelectItem>

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
    </>
  );
};

export default EdgeFiltersTab;
