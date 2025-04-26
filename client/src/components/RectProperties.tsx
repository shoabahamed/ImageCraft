import { Input } from "@/components/ui/input";

import { useShapeStore } from "@/hooks/appStore/ShapeStore";
import { useLogContext } from "@/hooks/useLogContext";
import CustomSlider from "./custom-slider";

export const RectProperties = () => {
  const { addLog } = useLogContext();
  const {
    rectFill,
    rectStroke,
    rectWidth,
    rectHeight,
    rectOpacity,
    setRectFill,
    setRectStroke,
    setRectWidth,
    setRectHeight,
    setRectOpacity,
  } = useShapeStore();

  const handlePropertyChange = (prop: string, value: any) => {
    addLog({
      section: "shape",
      tab: "shape",
      event: "update",
      message: `Rectangle ${prop} changed to ${value}`,
      param: prop,
      objType: "rect",
    });
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <label className="text-sm text-slate-400">Fill Color</label>
        <Input
          type="color"
          value={rectFill}
          onChange={(e) => {
            setRectFill(e.target.value);
            handlePropertyChange("fill", e.target.value);
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-slate-400">Stroke Color</label>
        <Input
          type="color"
          value={rectStroke}
          onChange={(e) => {
            setRectStroke(e.target.value);
            handlePropertyChange("stroke", e.target.value);
          }}
        />
      </div>

      <CustomSlider
        sliderName="Width"
        min={10}
        max={500}
        defaultValue={rectWidth}
        sliderValue={rectWidth}
        setSliderValue={(value) => {
          setRectWidth(value);
          handlePropertyChange("width", value);
        }}
        logName="rect width"
        section="shape"
        tab="shape"
      />

      <CustomSlider
        sliderName="Height"
        min={10}
        max={500}
        defaultValue={rectHeight}
        sliderValue={rectHeight}
        setSliderValue={(value) => {
          setRectHeight(value);
          handlePropertyChange("height", value);
        }}
        logName="rect height"
        section="shape"
        tab="shape"
      />

      <CustomSlider
        sliderName="Opacity"
        min={0}
        max={1}
        step={0.01}
        defaultValue={rectOpacity}
        sliderValue={rectOpacity}
        setSliderValue={(value) => {
          setRectOpacity(value);
          handlePropertyChange("opacity", value);
        }}
        logName="rect opacity"
        section="shape"
        tab="shape"
      />
    </>
  );
};
