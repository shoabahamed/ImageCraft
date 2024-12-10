import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

import CustomSlider from "@/components/custom-slider";
import { useEffect, useState } from "react";
import { Canvas, FabricImage } from "fabric";

type AdjustSidebarProps = {
  canvas: Canvas;
  image: FabricImage;
};

const AdjustSidebar = ({ canvas, image }: AdjustSidebarProps) => {
  const [opacityValue, setOpacityValue] = useState(1);
  const [saturationValue, setSaturationValue] = useState(0);
  const [tintValue, setTintValue] = useState(0);
  const [hueValue, setHueValue] = useState(0);
  const [vibranceValue, setVibranceValue] = useState(0);
  const [temperatureValue, setTemperatureValue] = useState(0);

  useEffect(() => {
    image.set("opacity", opacityValue);
    canvas.renderAll();
  }, [opacityValue]);

  return (
    <div className="flex flex-col items-center justify-center w-full gap-4">
      <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription>Color</CardDescription>
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
                sliderName={"Vibrance"}
                min={-100}
                max={100}
                sliderValue={vibranceValue}
                defaultValue={0}
                setSliderValue={setVibranceValue}
              />
              <CustomSlider
                sliderName={"Saturation"}
                min={-100}
                max={100}
                sliderValue={saturationValue}
                defaultValue={0}
                setSliderValue={setSaturationValue}
              />
              <CustomSlider
                sliderName={"Hue"}
                min={-100}
                max={100}
                sliderValue={hueValue}
                defaultValue={0}
                setSliderValue={setHueValue}
              />

              <CustomSlider
                sliderName={"Tint"}
                min={-100}
                max={100}
                sliderValue={tintValue}
                defaultValue={0}
                setSliderValue={setTintValue}
              />

              <CustomSlider
                sliderName={"Temperature"}
                min={-100}
                max={100}
                sliderValue={temperatureValue}
                defaultValue={0}
                setSliderValue={setTemperatureValue}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdjustSidebar;
