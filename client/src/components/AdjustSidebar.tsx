
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

type AdjustSidebarProps = {
  canvas: Canvas;
  image: FabricImage;
};

const AdjustSidebar = ({ canvas, image }: AdjustSidebarProps) => {
  const [brightnessValue, setBrightnessValue] = useState(0);
  const [contrastValue, setContrastValue] = useState(0);
  const [saturationValue, setSaturationValue] = useState(0);
  const [vibranceValue, setVibranceValue] = useState(0);
  const [opacityValue, setOpacityValue] = useState(1);
  const [hueValue, setHueValue] = useState(0);
  const [blurValue, setBlurValue] = useState(0);
  const [noiseValue, setNoiseValue] = useState(0);
  const [pixelateValue, setPixelateValue] = useState(0);
  const [predefinedFilter, setPredefinedFilter] = useState<string | null>(null);

  // Function to apply filters to the image
  const applyFilters = () => {
    const currentFilters: filters.BaseFilter[] = [];

    // Add predefined filter first if any
    if (predefinedFilter) {
      switch (predefinedFilter) {
        case "grayscale":
          currentFilters.push(new filters.Grayscale());
          break;
        case "sepia":
          currentFilters.push(new filters.Sepia());
          break;
        case "vintage":
          currentFilters.push(new filters.Vintage());
          break;
        case "kodachrome":
          currentFilters.push(new filters.Kodachrome());
          break;
        case "technicolor":
          currentFilters.push(new filters.Technicolor());
          break;
        default:
          break;
      }
    }

    // Add dynamic filters
    if (brightnessValue !== 0) {
      currentFilters.push(
        new filters.Brightness({ brightness: brightnessValue })
      );
    }

    if (contrastValue !== 0) {
      currentFilters.push(new filters.Contrast({ contrast: contrastValue }));
    }

    if (saturationValue !== 0) {
      currentFilters.push(
        new filters.Saturation({ saturation: saturationValue })
      );
    }

    if (vibranceValue !== 0) {
      currentFilters.push(new filters.Vibrance({ vibrance: vibranceValue }));
    }

    if (blurValue !== 0) {
      currentFilters.push(new filters.Blur({ blur: blurValue }));
    }

    if (hueValue !== 0) {
      currentFilters.push(new filters.HueRotation({ rotation: hueValue }));
    }

    if (noiseValue !== 0) {
      currentFilters.push(new filters.Noise({ noise: noiseValue }));
    }

    if (pixelateValue !== 0) {
      currentFilters.push(new filters.Pixelate({ blocksize: pixelateValue }));
    }

    image.filters = currentFilters;
    image.applyFilters();
    canvas.renderAll();
  };

  const applyPredefinedFilter = (filterType: string) => {
    if (predefinedFilter && filterType === predefinedFilter) {
      setPredefinedFilter("");
    } else {
      setPredefinedFilter(filterType);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [
    brightnessValue,
    contrastValue,
    saturationValue,
    vibranceValue,
    blurValue,
    hueValue,
    noiseValue,
    pixelateValue,
    predefinedFilter,
  ]);

  useEffect(() => {
    image.set("opacity", opacityValue);
    canvas.renderAll();
  }, [opacityValue]);

  const handleColorReset = () => {
    setBrightnessValue(0);
    setVibranceValue(0);
    setContrastValue(0);
    setSaturationValue(0);
    setHueValue(0);
  };

  const handleDetailReset = () => {
    setOpacityValue(1);
    setPixelateValue(0);
    setNoiseValue(0);
    setBlurValue(0);
  };

  const handleFilterReset = () => {
    setPredefinedFilter("");
  };


return (
    <div className="flex flex-col items-center justify-center w-full gap-4">
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
            <Button onClick={handleFilterReset}>Reset</Button>
          </CardContent>
        </Card>
      </div>
      {/* <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription className="text-center">Colors</CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            <div className="flex flex-col gap-4 w-full">
              <CustomSlider
                sliderName={"Brightness"}
                min={-1}
                max={1}
                sliderValue={brightnessValue}
                defaultValue={brightnessValue}
                step={0.01}
                setSliderValue={setBrightnessValue}
              />
              <CustomSlider
                sliderName={"Contrast"}
                min={-1}
                max={1}
                step={0.01}
                sliderValue={contrastValue}
                defaultValue={contrastValue}
                setSliderValue={setContrastValue}
              />
              <CustomSlider
                sliderName={"Saturation"}
                min={-1}
                max={1}
                step={0.01}
                sliderValue={saturationValue}
                defaultValue={saturationValue}
                setSliderValue={setSaturationValue}
              />
              <CustomSlider
                sliderName={"Vibrance"}
                min={-1}
                max={1}
                step={0.01}
                sliderValue={vibranceValue}
                defaultValue={vibranceValue}
                setSliderValue={setVibranceValue}
              />
              <CustomSlider
                sliderName={"Hue"}
                min={-1}
                max={1}
                step={0.01}
                sliderValue={hueValue}
                defaultValue={hueValue}
                setSliderValue={setHueValue}
              />
              <Button onClick={handleColorReset}>Reset</Button>
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
              />

              <CustomSlider
                sliderName={"Blur"}
                min={0}
                max={1}
                step={0.01}
                sliderValue={blurValue}
                defaultValue={blurValue}
                setSliderValue={setBlurValue}
              />
              <CustomSlider
                sliderName={"Noise"}
                min={0}
                max={5000}
                step={10}
                sliderValue={noiseValue}
                defaultValue={noiseValue}
                setSliderValue={setNoiseValue}
              />
              <CustomSlider
                sliderName={"Pixelate"}
                min={0}
                max={50}
                step={1}
                sliderValue={pixelateValue}
                defaultValue={pixelateValue}
                setSliderValue={setPixelateValue}
              />
              <Button onClick={handleDetailReset}>Reset</Button>
            </div>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
};

export default AdjustSidebar;