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
import { BBrightness } from "@/utils/BlueBrightnessFilter";
import { GBrightness } from "@/utils/GreenBrightnessValue";
import { useCommonProps } from "@/hooks/appStore/CommonProps";
import { updateOrInsert } from "@/utils/commonFunctions";

type AdjustSidebarProps = {
  canvas: Canvas;
  image: FabricImage;
  databaseFiltersName: string[] | null;
  setDatabaseFiltersName: (value: string[] | null) => void;
  databaseFiltersObject: object[] | null;
  setDatabaseFiltersObject: (value: object[] | null) => void;
};

const AdjustSidebar = ({
  canvas,
  image,
  databaseFiltersName,
  setDatabaseFiltersName,
  databaseFiltersObject,
  setDatabaseFiltersObject,
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
  const enableGrayScale = useAdjustStore((state) => state.enableGrayScale);
  const enableVintage = useAdjustStore((state) => state.enableVintage);
  const enableSepia = useAdjustStore((state) => state.enableSepia);
  const enableTechnicolor = useAdjustStore((state) => state.enableTechnicolor);
  const enableKodachrome = useAdjustStore((state) => state.enableKodachrome);
  const enableSharpen = useAdjustStore((state) => state.enableSharpen);

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

  const handleColorReset = () => {
    addLog({
      section: "adjust",
      tab: "color",
      event: "reset",
      message: `reseted all image color properties `,
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
  };

  const handleFilterReset = () => {
    addLog({
      section: "adjust",
      tab: "filter",
      event: "deletion",
      message: `removed all filters`,
    });

    setEnableGrayScale(false);
    setEnableSepia(false);
    setEnableVintage(false);
    setEnableKodachrome(false);
    setEnableTechnicolor(false);
    setEnableSharpen(false);
    setEnableInvert(false);
  };

  console.log(Math.random());
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
              variant={`${enableGrayScale ? "default" : "outline"}`}
              className={`w-full text-xs`}
              onClick={() => setEnableGrayScale(!enableGrayScale)}
            >
              Grayscale
            </Button>
            <Button
              variant={`${enableSepia ? "default" : "outline"}`}
              className="w-full text-xs"
              onClick={() => setEnableSepia(!enableSepia)}
            >
              Sepia
            </Button>
            <Button
              variant={`${enableVintage ? "default" : "outline"}`}
              className="w-full text-xs"
              onClick={() => setEnableVintage(!enableVintage)}
            >
              Vintage
            </Button>
            <Button
              variant={`${enableKodachrome ? "default" : "outline"}`}
              className="w-full text-xs"
              onClick={() => setEnableKodachrome(!enableKodachrome)}
            >
              Kodachrome
            </Button>
            <Button
              variant={`${enableTechnicolor ? "default" : "outline"}`}
              className="w-full text-xs"
              onClick={() => setEnableTechnicolor(!enableTechnicolor)}
            >
              Technicolor
            </Button>
            <Button
              variant={`${enableSharpen ? "default" : "outline"}`}
              className="w-full text-xs"
              onClick={() => setEnableSharpen(!enableSharpen)}
            >
              Sharpen
            </Button>
            <Button
              variant={`${enableInvert ? "default" : "outline"}`}
              className="w-full text-xs"
              onClick={() => setEnableInvert(!enableInvert)}
            >
              Invert
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

            <CustomSlider
              sliderName={"Blue"}
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
              sliderName={"Green"}
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

            {/* test filters ende */}

            <div className="flex flex-col gap-4 w-full">
              {/* <CustomSlider
                sliderName={"Brightness"}
                min={-1}
                max={1}
                sliderValue={brightnessValue}
                defaultValue={brightnessValue}
                step={0.01}
                setSliderValue={setBrightnessValue}
                section={"adjust"}
                tab={"color"}
              /> */}
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
    </div>
  );
};

export default AdjustSidebar;
