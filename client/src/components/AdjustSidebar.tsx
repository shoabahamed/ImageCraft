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
  Camera,
  Filter,
  Sparkles,
  Wand2,
  Moon,
  Palette,
  Sun,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCommonProps } from "@/hooks/appStore/CommonProps";

type AdjustSidebarProps = {
  canvas: Canvas;
  image: FabricImage;
  imageRef: React.RefObject<FabricImage>;
  databaseFiltersName: string[] | null;
  databaseFiltersObject: object[] | null;
  setLoadState: (value: boolean) => void;
};

const AdjustSidebar = ({
  canvas,
  image,
  imageRef,
  setLoadState,
}: AdjustSidebarProps) => {
  const { addLog } = useLogContext(); // Use log context
  const { disableSavingIntoStackRef, allFiltersRef } = useCanvasObjects();
  const currentFilters = useCommonProps((state) => state.currentFilters);

  const redBrightnessValue = useAdjustStore(
    (state) => state.redBrightnessValue
  );

  const contrastValue = useAdjustStore((state) => state.contrastValue);
  const saturationValue = useAdjustStore((state) => state.saturationValue);
  const vibranceValue = useAdjustStore((state) => state.vibranceValue);
  const opacityValue = useAdjustStore((state) => state.opacityValue);
  const hueValue = useAdjustStore((state) => state.hueValue);
  const blurValue = useAdjustStore((state) => state.blurValue);
  const noiseValue = useAdjustStore((state) => state.noiseValue);
  const pixelateValue = useAdjustStore((state) => state.pixelateValue);
  const enableGrayScale = useAdjustStore((state) => state.enableGrayScale);
  const enableVintage = useAdjustStore((state) => state.enableVintage);
  const enableSepia = useAdjustStore((state) => state.enableSepia);
  const enableTechnicolor = useAdjustStore((state) => state.enableTechnicolor);
  const enableKodachrome = useAdjustStore((state) => state.enableKodachrome);
  const enableSharpen = useAdjustStore((state) => state.enableSharpen);
  const enableWarmFilter = useAdjustStore((state) => state.enableWarmFilter);
  const enableColdFilter = useAdjustStore((state) => state.enableColdFilter);

  const enableInvert = useAdjustStore((state) => state.enableInvert);

  const blueBrightnessValue = useAdjustStore(
    (state) => state.blueBrightnessValue
  );
  const greenBrightnessValue = useAdjustStore(
    (state) => state.greenBrightnessValue
  );

  const setBlueBrightnessValue = useAdjustStore(
    (state) => state.setBlueBrightnessValue
  );
  const setGreenBrightnessValue = useAdjustStore(
    (state) => state.setGreenBrightnessValue
  );

  const gammaBlue = useAdjustStore((state) => state.gammaBlue);
  const gammaGreen = useAdjustStore((state) => state.gammaGreen);
  const gammaRed = useAdjustStore((state) => state.gammaRed);

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
  const setEnableSharpen = useAdjustStore((state) => state.setEnableSharpen);
  const setEnableInvert = useAdjustStore((state) => state.setEnableInvert);

  const setEnableEdgeDetection = useAdjustStore(
    (state) => state.setEnableEdgeDetection
  );
  const enableEdgeDetection = useAdjustStore(
    (state) => state.enableEdgeDetection
  );

  const setEnableWarmFilter = useAdjustStore(
    (state) => state.setEnableWarmFilter
  );

  const setEnableColdFilter = useAdjustStore(
    (state) => state.setEnableColdFilter
  );

  // Set functions for each value
  const setBrightnessValue = useAdjustStore(
    (state) => state.setBrightnessValue
  );
  const setContrastValue = useAdjustStore((state) => state.setContrastValue);
  const setSaturationValue = useAdjustStore(
    (state) => state.setSaturationValue
  );
  const setRedBrightnessValue = useAdjustStore(
    (state) => state.setRedBrightnessValue
  );
  const setVibranceValue = useAdjustStore((state) => state.setVibranceValue);
  const setOpacityValue = useAdjustStore((state) => state.setOpacityValue);
  const setHueValue = useAdjustStore((state) => state.setHueValue);
  const setBlurValue = useAdjustStore((state) => state.setBlurValue);
  const setNoiseValue = useAdjustStore((state) => state.setNoiseValue);
  const setPixelateValue = useAdjustStore((state) => state.setPixelateValue);

  const resetFilters = useAdjustStore((state) => state.resetFilters);

  const handleColorReset = () => {
    addLog({
      section: "adjust",
      tab: "color",
      event: "reset",
      message: `reseted all image color related properties `,
    });

    setBrightnessValue(0);
    setRedBrightnessValue(0);
    setBlueBrightnessValue(0);
    setGreenBrightnessValue(0);
    setGammaBlueValue(1);
    setGammaGreenValue(1);
    setGammaRedValue(1);
    setVibranceValue(0);
    setContrastValue(0);
    setSaturationValue(0);
    setHueValue(0);
  };

  const handleDetailReset = () => {
    addLog({
      section: "adjust",
      tab: "detail",
      event: "reset",
      message: `reseted all image detail properties `,
    });

    setOpacityValue(1);
    setPixelateValue(0);
    setNoiseValue(0);
    setBlurValue(0);
    setEnableBlueThresholding(false);
    setEnableRedThresholding(false);
    setEnableGreenThresholding(false);
  };

  const handleFilterReset = () => {
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
  };

  // const handleFullReset = () => {
  //   addLog({
  //     section: "adjust",
  //     tab: "filter",
  //     event: "deletion",
  //     message: `removed all filters`,
  //   });
  //   resetFilters();
  // };

  const handleApplyFilter = () => {
    disableSavingIntoStackRef.current = true;
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

  const red = useAdjustStore((state) => state.red);
  const setRed = useAdjustStore((state) => state.setRed);

  const green = useAdjustStore((state) => state.green);
  const setGreen = useAdjustStore((state) => state.setGreen);

  const blue = useAdjustStore((state) => state.blue);
  const setBlue = useAdjustStore((state) => state.setBlue);

  const enableBlueThresholding = useAdjustStore(
    (state) => state.enableBlueThresholding
  );

  const enableGreenThresholding = useAdjustStore(
    (state) => state.enableGreenThresholding
  );

  const enableRedThresholding = useAdjustStore(
    (state) => state.enableRedThresholding
  );
  const setEnableRedThresholding = useAdjustStore(
    (state) => state.setEnableRedThresholding
  );

  const setEnableGreenThresholding = useAdjustStore(
    (state) => state.setEnableGreenThresholding
  );

  const setEnableBlueThresholding = useAdjustStore(
    (state) => state.setEnableBlueThresholding
  );

  return (
    <div className="max-h-full flex flex-col items-center justify-center w-full gap-4">
      <Tabs
        defaultValue="presets"
        className="w-full flex-1 flex flex-col rounded-none"
      >
        <div className="border-b border-gray-200 dark:border-gray-800">
          <TabsList className="w-full grid grid-cols-3 rounded-none">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
        </div>

        {/* Preset Filters Tab */}
        <TabsContent
          value="presets"
          className="flex-1 flex flex-col justify-center items-center"
        >
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
                      const filterName = "gray scale";
                      addLog({
                        section: "adjust",
                        tab: "filters",
                        event: "update",
                        message: !enableGrayScale
                          ? `enabled ${filterName} filter`
                          : `disabled ${filterName} scale filter`,
                      });
                      setEnableGrayScale(!enableGrayScale);
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
                      const filterName = "sepia";
                      addLog({
                        section: "adjust",
                        tab: "filters",
                        event: "update",
                        message: !enableSepia
                          ? `enabled ${filterName} filter`
                          : `disabled ${filterName} scale filter`,
                      });
                      setEnableSepia(!enableSepia);
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
                      const filterName = "vintage";
                      addLog({
                        section: "adjust",
                        tab: "filters",
                        event: "update",
                        message: !enableVintage
                          ? `enabled ${filterName} filter`
                          : `disabled ${filterName} scale filter`,
                      });
                      setEnableVintage(!enableVintage);
                    }}
                    className={`
                    flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer
                    ${
                      enableVintage
                        ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                        : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                    transition-all
                  `}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${
                        enableVintage
                          ? "bg-blue-200 dark:bg-blue-800"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={
                          enableVintage
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }
                      >
                        <Camera />
                      </span>
                    </div>
                    <span className="text-sm font-medium">Vintage</span>
                  </div>

                  <div
                    onClick={() => {
                      const filterName = "kodachrome";
                      addLog({
                        section: "adjust",
                        tab: "filters",
                        event: "update",
                        message: !enableKodachrome
                          ? `enabled ${filterName} filter`
                          : `disabled ${filterName} scale filter`,
                      });
                      setEnableKodachrome(!enableKodachrome);
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
                      const filterName = "Technicolor";
                      addLog({
                        section: "adjust",
                        tab: "filters",
                        event: "update",
                        message: !enableTechnicolor
                          ? `enabled ${filterName} filter`
                          : `disabled ${filterName} scale filter`,
                      });
                      setEnableTechnicolor(!enableTechnicolor);
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
                      const filterName = "Sharpen";
                      addLog({
                        section: "adjust",
                        tab: "filters",
                        event: "update",
                        message: !enableSharpen
                          ? `enabled ${filterName} filter`
                          : `disabled ${filterName} scale filter`,
                      });
                      setEnableSharpen(!enableSharpen);
                    }}
                    className={`
                    flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer
                    ${
                      enableSharpen
                        ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                        : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                    transition-all
                  `}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${
                        enableSharpen
                          ? "bg-blue-200 dark:bg-blue-800"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={
                          enableSharpen
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }
                      >
                        <Filter />
                      </span>
                    </div>
                    <span className="text-sm font-medium">Sharpen</span>
                  </div>

                  <div
                    onClick={() => {
                      const filterName = "Invert";
                      addLog({
                        section: "adjust",
                        tab: "filters",
                        event: "update",
                        message: !enableInvert
                          ? `enabled ${filterName} filter`
                          : `disabled ${filterName} scale filter`,
                      });
                      setEnableInvert(!enableInvert);
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
                      const filterName = "Sobel Edge Detection";
                      addLog({
                        section: "adjust",
                        tab: "filters",
                        event: "update",
                        message: !enableEdgeDetection
                          ? `enabled ${filterName} filter`
                          : `disabled ${filterName} scale filter`,
                      });
                      setEnableEdgeDetection(!enableEdgeDetection);
                    }}
                    className={`
                    flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer
                    ${
                      enableEdgeDetection
                        ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                        : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                    transition-all
                  `}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${
                        enableEdgeDetection
                          ? "bg-blue-200 dark:bg-blue-800"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={
                          enableEdgeDetection
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }
                      >
                        <Wand2 />
                      </span>
                    </div>
                    <span className="text-sm font-medium">Sobel</span>
                  </div>

                  <div
                    onClick={() => {
                      const filterName = "Cold";
                      addLog({
                        section: "adjust",
                        tab: "filters",
                        event: "update",
                        message: !enableColdFilter
                          ? `enabled ${filterName} filter`
                          : `disabled ${filterName} scale filter`,
                      });
                      setEnableColdFilter(!enableColdFilter);
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
                      const filterName = "Warm";
                      addLog({
                        section: "adjust",
                        tab: "filters",
                        event: "update",
                        message: !enableWarmFilter
                          ? `enabled ${filterName} filter`
                          : `disabled ${filterName} scale filter`,
                      });
                      setEnableWarmFilter(!enableWarmFilter);
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
                  onClick={handleFilterReset}
                >
                  Reset
                </button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent
          value="colors"
          className="w-full flex flex-col justify-center items-center"
        >
          <div className="w-[90%]">
            <Card className="w-full">
              <CardHeader>
                <CardDescription className="text-center">
                  Color Adjustments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 w-full">
                  {/* test filters start */}
                  <CustomSlider
                    sliderName={"Brightness Red"}
                    min={-1}
                    max={1}
                    sliderValue={redBrightnessValue}
                    defaultValue={redBrightnessValue}
                    step={0.01}
                    setSliderValue={setRedBrightnessValue}
                    section={"adjust"}
                    tab={"color"}
                  />

                  <CustomSlider
                    sliderName={"Brightness Blue"}
                    min={-1}
                    max={1}
                    sliderValue={blueBrightnessValue}
                    defaultValue={blueBrightnessValue}
                    step={0.01}
                    setSliderValue={setBlueBrightnessValue}
                    section={"adjust"}
                    tab={"color"}
                  />
                  <CustomSlider
                    sliderName={"Brightness Green"}
                    min={-1}
                    max={1}
                    sliderValue={greenBrightnessValue}
                    defaultValue={greenBrightnessValue}
                    step={0.01}
                    setSliderValue={setGreenBrightnessValue}
                    section={"adjust"}
                    tab={"color"}
                  />

                  <CustomSlider
                    sliderName={"Gamma Red"}
                    min={0.01}
                    max={2.2}
                    sliderValue={gammaRed}
                    defaultValue={gammaRed}
                    step={0.01}
                    setSliderValue={setGammaRedValue}
                    section={"adjust"}
                    tab={"color"}
                  />

                  <CustomSlider
                    sliderName={"Gamma Blue"}
                    min={0.01}
                    max={2.2}
                    sliderValue={gammaBlue}
                    defaultValue={gammaBlue}
                    step={0.01}
                    setSliderValue={setGammaBlueValue}
                    section={"adjust"}
                    tab={"color"}
                  />

                  <CustomSlider
                    sliderName={"Gamma Green"}
                    min={0.01}
                    max={2.2}
                    sliderValue={gammaGreen}
                    defaultValue={gammaGreen}
                    step={0.01}
                    setSliderValue={setGammaGreenValue}
                    section={"adjust"}
                    tab={"color"}
                  />

                  <CustomSlider
                    sliderName={"Contrast"}
                    min={-1}
                    max={1}
                    step={0.01}
                    sliderValue={contrastValue}
                    defaultValue={contrastValue}
                    setSliderValue={setContrastValue}
                    section={"adjust"}
                    tab={"color"}
                  />
                  <CustomSlider
                    sliderName={"Saturation"}
                    min={-1}
                    max={1}
                    step={0.01}
                    sliderValue={saturationValue}
                    defaultValue={saturationValue}
                    setSliderValue={setSaturationValue}
                    section={"adjust"}
                    tab={"color"}
                  />
                  <CustomSlider
                    sliderName={"Vibrance"}
                    min={-1}
                    max={1}
                    step={0.01}
                    sliderValue={vibranceValue}
                    defaultValue={vibranceValue}
                    setSliderValue={setVibranceValue}
                    section={"adjust"}
                    tab={"color"}
                  />
                  <CustomSlider
                    sliderName={"Hue"}
                    min={-1}
                    max={1}
                    step={0.01}
                    sliderValue={hueValue}
                    defaultValue={hueValue}
                    setSliderValue={setHueValue}
                    section={"adjust"}
                    tab={"color"}
                  />
                  <button className="custom-button" onClick={handleColorReset}>
                    Reset
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Details Tab */}

        <TabsContent
          value="details"
          className="w-full flex flex-col justify-center items-center space-y-2"
        >
          <div className="w-[90%]">
            <Card className="w-full">
              <CardHeader>
                <CardDescription className="">
                  <div className="flex flex-row justify-between items-center">
                    <span className="text-base font-semibold text-gray-800 dark:text-gray-200">
                      RGB Channel Threshold
                    </span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-8">
                <div className="flex flex-col gap-6">
                  {/* Red Channel */}
                  <div className="flex flex-row justify-evenly items-center">
                    <Switch
                      checked={enableRedThresholding}
                      onCheckedChange={setEnableRedThresholding}
                    />
                    <Switch
                      checked={enableGreenThresholding}
                      onCheckedChange={setEnableGreenThresholding}
                    />
                    <Switch
                      checked={enableBlueThresholding}
                      onCheckedChange={setEnableBlueThresholding}
                    />
                  </div>

                  <div className="flex flex-col gap-4 border-t pt-4">
                    <CustomSlider
                      sliderName="Red"
                      min={0}
                      max={255}
                      step={1}
                      sliderValue={red.threshold}
                      defaultValue={128}
                      setSliderValue={(val: number) =>
                        setRed({ ...red, threshold: val })
                      }
                      section="adjust"
                      tab="threshold"
                      disabled={!enableRedThresholding}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <CustomSlider
                        sliderName="Red Lower"
                        min={0}
                        max={255}
                        step={1}
                        sliderValue={red.below}
                        defaultValue={0}
                        setSliderValue={(val: number) =>
                          setRed({ ...red, below: val })
                        }
                        section="adjust"
                        tab="threshold"
                        disabled={!enableRedThresholding}
                      />
                      <CustomSlider
                        sliderName="Red Upper"
                        min={0}
                        max={255}
                        step={1}
                        sliderValue={red.above}
                        defaultValue={255}
                        setSliderValue={(val: number) =>
                          setRed({ ...red, above: val })
                        }
                        section="adjust"
                        tab="threshold"
                        disabled={!enableRedThresholding}
                      />
                    </div>
                  </div>

                  {/* Green Channel */}
                  <div className="flex flex-col gap-4 border-t pt-4">
                    <CustomSlider
                      sliderName="Green"
                      min={0}
                      max={255}
                      step={1}
                      sliderValue={green.threshold}
                      defaultValue={128}
                      setSliderValue={(val: number) =>
                        setGreen({ ...green, threshold: val })
                      }
                      section="adjust"
                      tab="threshold"
                      disabled={!enableGreenThresholding}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <CustomSlider
                        sliderName="Green Lower"
                        min={0}
                        max={255}
                        step={1}
                        sliderValue={green.below}
                        defaultValue={0}
                        setSliderValue={(val: number) =>
                          setGreen({ ...green, below: val })
                        }
                        section="adjust"
                        tab="threshold"
                        disabled={!enableGreenThresholding}
                      />
                      <CustomSlider
                        sliderName="Green Upper"
                        min={0}
                        max={255}
                        step={1}
                        sliderValue={green.above}
                        defaultValue={255}
                        setSliderValue={(val: number) =>
                          setGreen({ ...green, above: val })
                        }
                        section="adjust"
                        tab="threshold"
                        disabled={!enableGreenThresholding}
                      />
                    </div>
                  </div>

                  {/* Blue Channel */}
                  <div className="flex flex-col gap-4 border-t pt-4">
                    <CustomSlider
                      sliderName="Blue"
                      min={0}
                      max={255}
                      step={1}
                      sliderValue={blue.threshold}
                      defaultValue={128}
                      setSliderValue={(val: number) =>
                        setBlue({ ...red, threshold: val })
                      }
                      section="adjust"
                      tab="threshold"
                      disabled={!enableBlueThresholding}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <CustomSlider
                        sliderName="Blue Lower"
                        min={0}
                        max={255}
                        step={1}
                        sliderValue={blue.below}
                        defaultValue={0}
                        setSliderValue={(val: number) =>
                          setBlue({ ...blue, below: val })
                        }
                        section="adjust"
                        tab="threshold"
                        disabled={!enableBlueThresholding}
                      />
                      <CustomSlider
                        sliderName="Blue Upper"
                        min={0}
                        max={255}
                        step={1}
                        sliderValue={blue.above}
                        defaultValue={255}
                        setSliderValue={(val: number) =>
                          setBlue({ ...blue, above: val })
                        }
                        section="adjust"
                        tab="threshold"
                        disabled={!enableBlueThresholding}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="w-[90%]">
            <Card className="w-full">
              <CardHeader>
                <CardDescription className="text-center">
                  Color Adjustments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 w-full">
                  <CustomSlider
                    sliderName={"Opacity"}
                    min={0}
                    max={1}
                    sliderValue={opacityValue}
                    defaultValue={1}
                    setSliderValue={setOpacityValue}
                    step={0.01}
                    section={"adjust"}
                    tab={"detail"}
                  />

                  <CustomSlider
                    sliderName={"Blur"}
                    min={0}
                    max={1}
                    step={0.01}
                    sliderValue={blurValue}
                    defaultValue={blurValue + 1}
                    setSliderValue={setBlurValue}
                    section={"adjust"}
                    tab={"detail"}
                  />
                  <CustomSlider
                    sliderName={"Noise"}
                    min={0}
                    max={100}
                    step={2}
                    sliderValue={noiseValue}
                    defaultValue={noiseValue}
                    setSliderValue={setNoiseValue}
                    section={"adjust"}
                    tab={"detail"}
                  />
                  <CustomSlider
                    sliderName={"Pixelate"}
                    min={0}
                    max={50}
                    step={1}
                    sliderValue={pixelateValue}
                    defaultValue={pixelateValue}
                    setSliderValue={setPixelateValue}
                    section={"adjust"}
                    tab={"detail"}
                  />
                  <button className="custom-button" onClick={handleDetailReset}>
                    Reset
                  </button>
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

export default AdjustSidebar;
