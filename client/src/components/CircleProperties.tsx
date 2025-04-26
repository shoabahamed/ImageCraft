import { Input } from "@/components/ui/input";

import { useShapeStore } from "@/hooks/appStore/ShapeStore";
import { useLogContext } from "@/hooks/useLogContext";
import CustomSlider from "./custom-slider";

export const CircleProperties = () => {
  const { addLog } = useLogContext();
  const {
    circleFill,
    circleStroke,
    circleRadius,
    circleOpacity,
    setCircleFill,
    setCircleStroke,
    setCircleRadius,
    setCircleOpacity,
  } = useShapeStore();

  const handlePropertyChange = (prop: string, value: any) => {
    addLog({
      section: "shape",
      tab: "shape",
      event: "update",
      message: `Circle ${prop} changed to ${value}`,
      param: prop,
      objType: "circle",
    });
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <label className="text-sm text-slate-400">Fill Color</label>
        <Input
          type="color"
          value={circleFill}
          onChange={(e) => {
            setCircleFill(e.target.value);
            handlePropertyChange("fill", e.target.value);
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-slate-400">Stroke Color</label>
        <Input
          type="color"
          value={circleStroke}
          onChange={(e) => {
            setCircleStroke(e.target.value);
            handlePropertyChange("stroke", e.target.value);
          }}
        />
      </div>

      <CustomSlider
        sliderName="Radius"
        min={10}
        max={200}
        sliderValue={circleRadius}
        setSliderValue={(value) => {
          setCircleRadius(value);
          handlePropertyChange("radius", value);
        }}
        logName="circle radius"
        section="shape"
        tab="shape"
      />

      <CustomSlider
        sliderName="Opacity"
        min={0}
        max={1}
        step={0.01}
        sliderValue={circleOpacity}
        setSliderValue={(value) => {
          setCircleOpacity(value);
          handlePropertyChange("opacity", value);
        }}
        logName="circle opacity"
        section="shape"
        tab="shape"
      />
    </>
  );
};
