import { Input } from "@/components/ui/input";
import CustomSlider from "./custom-slider";
import { useShapeStore } from "@/hooks/appStore/ShapeStore";
import { useLogContext } from "@/hooks/useLogContext";

export const LineProperties = () => {
  const { addLog } = useLogContext();
  const {
    lineStroke,
    lineStrokeWidth,
    lineOpacity,
    setLineStroke,
    setLineStrokeWidth,
    setLineOpacity,
  } = useShapeStore();

  const handlePropertyChange = (prop: string, value: any) => {
    addLog({
      section: "shape",
      tab: "shape",
      event: "update",
      message: `Line ${prop} changed to ${value}`,
      param: prop,
      objType: "line",
    });
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <label className="text-sm text-slate-400">Stroke Color</label>
        <Input
          type="color"
          value={lineStroke}
          onChange={(e) => {
            setLineStroke(e.target.value);
            handlePropertyChange("stroke", e.target.value);
          }}
        />
      </div>

      <CustomSlider
        sliderName="Stroke Width"
        min={1}
        max={20}
        defaultValue={lineStrokeWidth}
        sliderValue={lineStrokeWidth}
        setSliderValue={(value) => {
          setLineStrokeWidth(value);
          handlePropertyChange("stroke width", value);
        }}
        logName="Line Stroke width"
        section="shape"
        tab="shape"
      />

      <CustomSlider
        sliderName="Opacity"
        min={0}
        max={1}
        step={0.01}
        defaultValue={lineOpacity}
        sliderValue={lineOpacity}
        setSliderValue={(value) => {
          setLineOpacity(value);
          handlePropertyChange("opacity", value);
        }}
        logName="line opacity"
        section="shape"
        tab="shape"
      />
    </>
  );
};
