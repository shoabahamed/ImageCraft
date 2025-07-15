import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

import { Canvas, FabricImage, filters } from "fabric";

import { useAdjustStore } from "@/hooks/appStore/AdjustStore";

import { Sparkles, Wand2, Moon, Palette, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ColdFilter } from "@/utils/ColdFilter";
import { SobelFilter } from "@/utils/SobelFilter";
import { WarmFilter } from "@/utils/WarmFilter";
import { FocusFilter } from "@/utils/FocusFilter";
import { Slider } from "./ui/slider";

import { CustomGrayScale } from "@/utils/CustomGrayScale";
import { useLogContext } from "@/hooks/useLogContext";
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";
import { updateOrInsert, throttle } from "@/utils/commonFunctions";
import { useRef } from "react";

type Props = {
  canvas: Canvas;
  imageRef: React.RefObject<FabricImage>;
};

const FOCUS_THROTTLE_MS = 50;

const PredefinedFilterTab = ({ canvas, imageRef }: Props) => {
  const { addLog } = useLogContext();
  const { currentFiltersRef } = useCanvasObjects();
  const enableGrayScale = useAdjustStore((state) => state.enableGrayScale);
  // const enableVintage = useAdjustStore((state) => state.enableVintage);
  const enableSepia = useAdjustStore((state) => state.enableSepia);
  const enableTechnicolor = useAdjustStore((state) => state.enableTechnicolor);
  const enableKodachrome = useAdjustStore((state) => state.enableKodachrome);
  const enableWarmFilter = useAdjustStore((state) => state.enableWarmFilter);
  const enableColdFilter = useAdjustStore((state) => state.enableColdFilter);

  const enableInvert = useAdjustStore((state) => state.enableInvert);

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
  const setEnableSharpen = useAdjustStore((state) => state.setEnableSharpen);
  const setEnableInvert = useAdjustStore((state) => state.setEnableInvert);

  const setEnableEdgeDetection = useAdjustStore(
    (state) => state.setEnableEdgeDetection
  );

  const setEnableWarmFilter = useAdjustStore(
    (state) => state.setEnableWarmFilter
  );

  const setEnableColdFilter = useAdjustStore(
    (state) => state.setEnableColdFilter
  );
  const enableFocusFilter = useAdjustStore((state) => state.enableFocusFilter);
  const radius = useAdjustStore((state) => state.radius);
  const softness = useAdjustStore((state) => state.softness);

  const darkFocus = useAdjustStore((state) => state.darkFocus);

  const setEnableFocusFilter = useAdjustStore(
    (state) => state.setEnableFocusFilter
  );

  const setRadius = useAdjustStore((state) => state.setRadius);
  const setSoftness = useAdjustStore((state) => state.setSoftness);

  const setDarkFocus = useAdjustStore((state) => state.setDarkFocus);

  const handleFocusRadiusChange = (newRadius: number) => {
    const filterName = "focus";
    addLog({
      section: "adjust",
      tab: "filters",
      event: "update",
      message: `${filterName} filter radius changed from ${radius} to ${newRadius}`,
    });

    const filtersList = [...(currentFiltersRef.current || [])];
    console.log("old filters", filtersList);

    updateOrInsert(
      filtersList,
      "focusFilter",
      new FocusFilter({
        radius: newRadius,
        softness: softness,
        dark: darkFocus,
      }),
      true
    );

    setRadius(newRadius);

    const filterInstances = filtersList.map(
      //@ts-ignore
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvas.requestRenderAll();

    currentFiltersRef.current = filtersList;
  };

  const handleFocusSoftnessChange = (newSoftness: number) => {
    const filterName = "focus";
    addLog({
      section: "adjust",
      tab: "filters",
      event: "update",
      message: `${filterName} filter softness changed from ${softness} to ${newSoftness}`,
    });

    const filtersList = [...(currentFiltersRef.current || [])];
    console.log("old filters", filtersList);

    updateOrInsert(
      filtersList,
      "focusFilter",
      new FocusFilter({
        radius: radius,
        softness: newSoftness,
        dark: darkFocus,
      }),
      true
    );

    setSoftness(newSoftness);

    const filterInstances = filtersList.map(
      //@ts-ignore
      (tempFilter) => tempFilter.instance
    );

    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvas.requestRenderAll();

    currentFiltersRef.current = filtersList;
  };

  const handlePredefinedFilterReset = () => {
    addLog({
      section: "adjust",
      tab: "filter",
      event: "deletion",
      message: `removed all predefined filters`,
    });

    setEnableGrayScale(false);
    setEnableSepia(false);
    setEnableVintage(false);
    setEnableKodachrome(false);
    setEnableTechnicolor(false);
    setEnableSharpen(false);
    setEnableInvert(false);
    setEnableEdgeDetection(false);
    setEnableColdFilter(false);
    setEnableWarmFilter(false);

    const filtersList = [...(currentFiltersRef.current || [])];

    updateOrInsert(filtersList, "grayscale", new filters.Grayscale(), false);
    updateOrInsert(filtersList, "sepia", new filters.Sepia(), false);
    updateOrInsert(filtersList, "kodachrome", new filters.Kodachrome(), false);

    updateOrInsert(
      filtersList,
      "technicolor",
      new filters.Technicolor(),
      false
    );

    updateOrInsert(filtersList, "invert", new filters.Invert(), false);

    updateOrInsert(filtersList, "sobeledge", new SobelFilter(), false);

    updateOrInsert(filtersList, "cold", new ColdFilter(), false);

    updateOrInsert(filtersList, "warm", new WarmFilter(), false);

    const filterInstances = filtersList.map(
      //@ts-ignore
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvas.requestRenderAll();

    currentFiltersRef.current = filtersList;

    canvas.fire("object:modified");
  };

  const handlePredefinedFilter = (filterName: string, value: boolean) => {
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
    switch (filterName) {
      case "grayscale":
        updateOrInsert(filtersList, "grayscale", new CustomGrayScale(), value);
        setEnableGrayScale(value);
        break;
      case "sepia":
        updateOrInsert(filtersList, "sepia", new filters.Sepia(), value);
        setEnableSepia(value);
        break;

      case "kodachrome":
        updateOrInsert(
          filtersList,
          "kodachrome",
          new filters.Kodachrome(),
          value
        );
        setEnableKodachrome(value);
        break;

      case "technicolor":
        updateOrInsert(
          filtersList,
          "technicolor",
          new filters.Technicolor(),
          value
        );
        setEnableTechnicolor(value);
        break;

      case "invert":
        updateOrInsert(filtersList, "invert", new filters.Invert(), value);
        setEnableInvert(value);
        break;

      case "sobeledge":
        updateOrInsert(filtersList, "sobeledge", new SobelFilter(), value);
        setEnableEdgeDetection(value);
        break;

      case "cold":
        updateOrInsert(filtersList, "cold", new ColdFilter(), value);
        setEnableColdFilter(value);
        break;

      case "warm":
        updateOrInsert(filtersList, "warm", new WarmFilter(), value);
        setEnableWarmFilter(value);
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

    currentFiltersRef.current = filtersList;

    canvas.fire("object:modified");
  };

  const handleFocusFilterToggle = (value: boolean) => {
    const filterName = "focus";
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
      "focusFilter",
      new FocusFilter({
        radius: radius,
        softness: softness,
        dark: darkFocus,
      }),
      value
    );

    setEnableFocusFilter(value);

    const filterInstances = filtersList.map(
      //@ts-ignore
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvas.requestRenderAll();

    currentFiltersRef.current = filtersList;

    canvas.fire("object:modified");
  };

  // Throttled handlers for FocusFilter sliders only
  const throttledFocusRadius = useRef(
    throttle((value: number) => {
      handleFocusRadiusChange(value);
    }, FOCUS_THROTTLE_MS)
  ).current;
  const throttledFocusSoftness = useRef(
    throttle((value: number) => {
      handleFocusSoftnessChange(value);
    }, FOCUS_THROTTLE_MS)
  ).current;

  const handleFocusReverseToggle = (newDarkFocus: boolean) => {
    const filterName = "focus";
    addLog({
      section: "adjust",
      tab: "filters",
      event: "update",
      message: `${filterName} filter dark focus changed from ${darkFocus} to ${newDarkFocus}`,
    });

    setDarkFocus(newDarkFocus);

    const filtersList = [...(currentFiltersRef.current || [])];
    console.log("old filters", filtersList);

    updateOrInsert(
      filtersList,
      "focusFilter",
      new FocusFilter({
        radius: radius,
        softness: softness,
        dark: newDarkFocus,
      }),
      enableFocusFilter
    );

    const filterInstances = filtersList.map(
      //@ts-ignore
      (tempFilter) => tempFilter.instance
    );

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvas.requestRenderAll();

    currentFiltersRef.current = filtersList;

    canvas.fire("object:modified");
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center">
      {" "}
      <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription className="text-center">
              Predefined Filters
            </CardDescription>
          </CardHeader>
          <CardContent className="w-full flex flex-col gap-2">
            <div className="grid grid-cols-3 md:grid-cols-2 gap-4">
              <div
                onClick={() => {
                  handlePredefinedFilter("grayscale", !enableGrayScale);
                }}
                className={`
            flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer
            ${
              enableGrayScale
                ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
            }
            transition-all
          `}
              >
                <div
                  className={`p-2 rounded-full mb-2 ${
                    enableGrayScale
                      ? "bg-blue-200 dark:bg-blue-800"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={
                      enableGrayScale
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400"
                    }
                  >
                    <Moon />
                  </span>
                </div>
                <span className="text-sm font-medium">GrayScale</span>
              </div>

              <div
                onClick={() => {
                  handlePredefinedFilter("sepia", !enableSepia);
                }}
                className={`
            flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer
            ${
              enableSepia
                ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
            }
            transition-all
          `}
              >
                <div
                  className={`p-2 rounded-full mb-2 ${
                    enableSepia
                      ? "bg-blue-200 dark:bg-blue-800"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={
                      enableSepia
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400"
                    }
                  >
                    <Palette />
                  </span>
                </div>
                <span className="text-sm font-medium">Sepia</span>
              </div>

              <div
                onClick={() => {
                  handlePredefinedFilter("kodachrome", !enableKodachrome);
                }}
                className={`
            flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer
            ${
              enableKodachrome
                ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
            }
            transition-all
          `}
              >
                <div
                  className={`p-2 rounded-full mb-2 ${
                    enableKodachrome
                      ? "bg-blue-200 dark:bg-blue-800"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={
                      enableKodachrome
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400"
                    }
                  >
                    <Wand2 />
                  </span>
                </div>
                <span className="text-sm font-medium">Kodachrome</span>
              </div>

              <div
                onClick={() => {
                  handlePredefinedFilter("technicolor", !enableTechnicolor);
                }}
                className={`
            flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer
            ${
              enableTechnicolor
                ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
            }
            transition-all
          `}
              >
                <div
                  className={`p-2 rounded-full mb-2 ${
                    enableTechnicolor
                      ? "bg-blue-200 dark:bg-blue-800"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={
                      enableTechnicolor
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400"
                    }
                  >
                    <Sparkles />
                  </span>
                </div>
                <span className="text-sm font-medium">Technicolor</span>
              </div>

              <div
                onClick={() => {
                  handlePredefinedFilter("invert", !enableInvert);
                }}
                className={`
            flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer
            ${
              enableInvert
                ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
            }
            transition-all
          `}
              >
                <div
                  className={`p-2 rounded-full mb-2 ${
                    enableInvert
                      ? "bg-blue-200 dark:bg-blue-800"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={
                      enableInvert
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400"
                    }
                  >
                    <Sparkles />
                  </span>
                </div>
                <span className="text-sm font-medium">Invert</span>
              </div>

              <div
                onClick={() => {
                  handlePredefinedFilter("cold", !enableColdFilter);
                }}
                className={`
            flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer
            ${
              enableColdFilter
                ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
            }
            transition-all
          `}
              >
                <div
                  className={`p-2 rounded-full mb-2 ${
                    enableColdFilter
                      ? "bg-blue-200 dark:bg-blue-800"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={
                      enableColdFilter
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400"
                    }
                  >
                    <Moon />
                  </span>
                </div>
                <span className="text-sm font-medium">Cold</span>
              </div>

              <div
                onClick={() => {
                  handlePredefinedFilter("warm", !enableWarmFilter);
                }}
                className={`
            flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer
            ${
              enableWarmFilter
                ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
            }
            transition-all
          `}
              >
                <div
                  className={`p-2 rounded-full mb-2 ${
                    enableWarmFilter
                      ? "bg-blue-200 dark:bg-blue-800"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={
                      enableWarmFilter
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400"
                    }
                  >
                    <Sun />
                  </span>
                </div>
                <span className="text-sm font-medium">Warm</span>
              </div>
            </div>

            <button
              className="custom-button w-full"
              onClick={handlePredefinedFilterReset}
            >
              Reset
            </button>
          </CardContent>
        </Card>
      </div>
      <div className="w-[90%] pt-4">
        <Card className="w-full">
          <CardHeader>
            <CardDescription className="">
              <div className="flex flex-row justify-between items-center">
                <span className="text-base font-semibold text-gray-800 dark:text-gray-200">
                  Focus
                </span>
                <div className="flex flex-row justify-end items-center">
                  <Switch
                    checked={enableFocusFilter}
                    onCheckedChange={() => {
                      handleFocusFilterToggle(!enableFocusFilter);
                    }}
                  />
                </div>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-8  border-t pt-4">
            <div className="flex flex-col justify-between items-center mb-3">
              <div className="w-full flex  justify-between items-center space-x-2">
                <div className="w-full flex flex-col gap-4 pt-2">
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-slate-400 text-sm">
                      <p>Radius</p>
                      <p>{radius}</p>
                    </div>

                    <Slider
                      value={[radius]}
                      min={0}
                      max={1}
                      step={0.01}
                      onValueChange={(e) => {
                        // throttledFocusRadius(e[0]);
                        handleFocusRadiusChange(e[0]);
                      }}
                      disabled={!enableFocusFilter}
                    />
                  </div>
                </div>

                <div className="w-full flex flex-col gap-4 pt-2">
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-slate-400 text-sm">
                      <p>Softness</p>
                      <p>{softness}</p>
                    </div>

                    <Slider
                      value={[softness]}
                      min={0}
                      max={1}
                      step={0.01}
                      onValueChange={(e) => {
                        // throttledFocusSoftness(e[0]);
                        handleFocusSoftnessChange(e[0]);
                      }}
                      disabled={!enableFocusFilter}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-row justify-between items-center">
              <span className="text-base font-semibold text-gray-800 dark:text-gray-200">
                Reverse
              </span>
              <div className="flex flex-row justify-end items-center">
                <Switch
                  checked={darkFocus}
                  onCheckedChange={() => {
                    handleFocusReverseToggle(!darkFocus);
                  }}
                  disabled={!enableFocusFilter}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PredefinedFilterTab;
