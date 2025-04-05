import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

import CustomSlider from "@/components/custom-slider";
import { useEffect, useState } from "react";
import { Canvas, FabricImage, filters } from "fabric";
import { Button } from "./ui/button";
import { useLogContext } from "@/hooks/useLogContext";
import { useAdjustStore } from "@/hooks/appStore/AdjustStore";
import { Exposure } from "@/utils/ExposureFilter";
import { RBrightness } from "@/utils/RedBrightnessFilter";

type AdjustSidebarProps = {
  canvas: Canvas;
  image: FabricImage;
  databaseFilters: object[] | null;
  setDatabaseFilters: (value: object[] | null) => void;
};

const AdjustSidebar = ({
  canvas,
  image,
  databaseFilters,
  setDatabaseFilters,
}: AdjustSidebarProps) => {
  const { addLog } = useLogContext(); // Use log context

  const redBrightnessValue = useAdjustStore(
    (state) => state.redBrightnessValue
  );

  const brightnessValue = useAdjustStore((state) => state.brightnessValue);
  const contrastValue = useAdjustStore((state) => state.contrastValue);
  const saturationValue = useAdjustStore((state) => state.saturationValue);
  const vibranceValue = useAdjustStore((state) => state.vibranceValue);
  const opacityValue = useAdjustStore((state) => state.opacityValue);
  const hueValue = useAdjustStore((state) => state.hueValue);
  const blurValue = useAdjustStore((state) => state.blurValue);
  const noiseValue = useAdjustStore((state) => state.noiseValue);
  const pixelateValue = useAdjustStore((state) => state.pixelateValue);
  const predefinedFilter = useAdjustStore((state) => state.predefinedFilter);

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
  const setPredefinedFilter = useAdjustStore(
    (state) => state.setPredefinedFilter
  );

  // Function to apply filters to the image
  // const applyFilters = () => {
  //   // @ts-ignore
  //   const currentFilters: filters.BaseFilter[] = [];

  //   // Add predefined filter first if any
  //   if (predefinedFilter) {
  //     switch (predefinedFilter) {
  //       case "grayscale":
  //         currentFilters.push(new filters.Grayscale());
  //         break;
  //       case "sepia":
  //         currentFilters.push(new filters.Sepia());
  //         break;
  //       case "vintage":
  //         currentFilters.push(new filters.Vintage());
  //         break;
  //       case "kodachrome":
  //         currentFilters.push(new filters.Kodachrome());
  //         break;
  //       case "technicolor":
  //         currentFilters.push(new filters.Technicolor());
  //         break;
  //       default:
  //         break;
  //     }
  //   }

  //   //test filters start
  //   if (redBrightnessValue !== 0) {
  //     currentFilters.push(new RBrightness({ RBrightness: redBrightnessValue }));
  //   }

  //   // test filters end

  //   // Add dynamic filters
  //   if (brightnessValue !== 0) {
  //     currentFilters.push(
  //       new filters.Brightness({ brightness: brightnessValue })
  //     );
  //   }

  //   if (contrastValue !== 0) {
  //     currentFilters.push(new filters.Contrast({ contrast: contrastValue }));
  //   }

  //   if (saturationValue !== 0) {
  //     currentFilters.push(
  //       new filters.Saturation({ saturation: saturationValue })
  //     );
  //   }

  //   if (vibranceValue !== 0) {
  //     currentFilters.push(new filters.Vibrance({ vibrance: vibranceValue }));
  //   }

  //   if (blurValue !== 0) {
  //     currentFilters.push(new filters.Blur({ blur: blurValue }));
  //   }

  //   if (hueValue !== 0) {
  //     currentFilters.push(new filters.HueRotation({ rotation: hueValue }));
  //   }

  //   if (noiseValue !== 0) {
  //     currentFilters.push(new filters.Noise({ noise: noiseValue }));
  //   }

  //   if (pixelateValue !== 0) {
  //     currentFilters.push(new filters.Pixelate({ blocksize: pixelateValue }));
  //   }

  //   image.filters = currentFilters;
  //   image.applyFilters();
  //   canvas.renderAll();
  // };

  const applyPredefinedFilter = (filterType: string) => {
    if (predefinedFilter) {
      addLog({
        section: "adjust",
        tab: "filter",
        event: "deletion",
        message: `removed filter ${predefinedFilter} `,
      });
    }
    if (predefinedFilter && filterType === predefinedFilter) {
      setPredefinedFilter("");
    } else {
      addLog({
        section: "adjust",
        tab: "filter",
        event: "update",
        message: `applied filter ${filterType} `,
        value: predefinedFilter,
      });

      setPredefinedFilter(filterType);
    }
  };

  useEffect(() => {
    if (databaseFilters) {
      databaseFilters.map((filter) => {
        switch (filter.type) {
          case filters.Grayscale.type:
            setPredefinedFilter("grayscale");
            break;
          case filters.Sepia.type:
            setPredefinedFilter("sepia");
            break;
          case filters.Vintage.type:
            setPredefinedFilter("vintage");
            break;
          case filters.Kodachrome.type:
            setPredefinedFilter("kodachrome");
            break;
          case filters.Technicolor.type:
            setPredefinedFilter("technicolor");
            break;

          case RBrightness.type:
            setRedBrightnessValue(filter.RBrightness);
            break;
          case filters.Brightness.type:
            setBrightnessValue(filter.brightness);
            break;
          case filters.Contrast.type:
            setContrastValue(filter.contrast);
            break;
          case filters.Saturation.type:
            setSaturationValue(filter.saturation);
            break;
          case filters.Vibrance.type:
            setVibranceValue(filter.vibrance);
            break;
          case filters.Blur.type:
            setBlurValue(filter.blur);
            break;
          case filters.HueRotation.type:
            setHueValue(filter.hueValue);
            break;
          case filters.Noise.type:
            setNoiseValue(filter.noise);
            break;
          case filters.Pixelate.type:
            setPixelateValue(filter.blocksize);
            break;
        }
      });
    }

    return () => {
      setDatabaseFilters(null);
    };
  }, []);

  // useEffect(() => {
  //   applyFilters();
  // }, [
  //   redBrightnessValue,
  //   brightnessValue,
  //   contrastValue,
  //   saturationValue,
  //   vibranceValue,
  //   blurValue,
  //   hueValue,
  //   noiseValue,
  //   pixelateValue,
  //   predefinedFilter,
  // ]);

  // useEffect(() => {
  //   image.set("opacity", opacityValue);
  //   canvas.renderAll();
  // }, [opacityValue]);

  const handleColorReset = () => {
    addLog({
      section: "adjust",
      tab: "color",
      event: "reset",
      message: `reseted all image color properties `,
    });

    addLog({
      section: "adjust",
      tab: "color",
      event: "reset",
      message: `reseted all image color properties `,
    });

    setBrightnessValue(0);
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
  };

  const handleFilterReset = () => {
    addLog({
      section: "adjust",
      tab: "filter",
      event: "deletion",
      message: `removed all filters`,
    });

    setPredefinedFilter("");
  };

  return (
    <div className="max-h-full flex flex-col items-center justify-center w-full gap-4">
      <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription className="text-center">
              Predefined Filters
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 lg:grid-cols-2 gap-4">
            <Button
              variant={`${
                predefinedFilter === "grayscale" ? "default" : "outline"
              }`}
              className={`w-full text-xs`}
              onClick={() => applyPredefinedFilter("grayscale")}
            >
              Grayscale
            </Button>
            <Button
              variant={`${
                predefinedFilter === "sepia" ? "default" : "outline"
              }`}
              className="w-full text-xs"
              onClick={() => applyPredefinedFilter("sepia")}
            >
              Sepia
            </Button>
            <Button
              variant={`${
                predefinedFilter === "vintage" ? "default" : "outline"
              }`}
              className="w-full text-xs"
              onClick={() => applyPredefinedFilter("vintage")}
            >
              Vintage
            </Button>
            <Button
              variant={`${
                predefinedFilter === "kodachrome" ? "default" : "outline"
              }`}
              className="w-full text-xs"
              onClick={() => applyPredefinedFilter("kodachrome")}
            >
              Kodachrome
            </Button>
            <Button
              variant={`${
                predefinedFilter === "technicolor" ? "default" : "outline"
              }`}
              className="w-full text-xs"
              onClick={() => applyPredefinedFilter("technicolor")}
            >
              Technicolor
            </Button>
            <button className="custom-button" onClick={handleFilterReset}>
              Reset
            </button>
          </CardContent>
        </Card>
      </div>
      <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription className="text-center">Colors</CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            {/* test filters start */}
            <CustomSlider
              sliderName={"Red"}
              min={-1}
              max={1}
              sliderValue={redBrightnessValue}
              defaultValue={redBrightnessValue}
              step={0.01}
              setSliderValue={setRedBrightnessValue}
              section={"adjust"}
              tab={"color"}
            />

            {/* test filters ende */}

            <div className="flex flex-col gap-4 w-full">
              <CustomSlider
                sliderName={"Brightness"}
                min={-1}
                max={1}
                sliderValue={brightnessValue}
                defaultValue={brightnessValue}
                step={0.01}
                setSliderValue={setBrightnessValue}
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
      <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription className="text-center">Details</CardDescription>
          </CardHeader>

          <CardContent className="w-full">
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
                defaultValue={blurValue}
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
    </div>
  );
};

export default AdjustSidebar;
