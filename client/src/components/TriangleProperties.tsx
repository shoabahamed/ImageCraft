import { Input } from "@/components/ui/input";
import CustomSlider from "./custom-slider";
import { useShapeStore } from "@/hooks/appStore/ShapeStore";
import { useLogContext } from "@/hooks/useLogContext";

export const TriangleProperties = () => {
  const { addLog } = useLogContext();
  const {
    triangleFill,
    triangleStroke,
    triangleWidth,
    triangleHeight,
    triangleOpacity,
    setTriangleFill,
    setTriangleStroke,
    setTriangleWidth,
    setTriangleHeight,
    setTriangleOpacity,
  } = useShapeStore();

  const handlePropertyChange = (prop: string, value: any) => {
    addLog({
      section: "shape",
      tab: "shape",
      event: "update",
      message: `Triangle ${prop} changed to ${value}`,
      param: prop,
      objType: "triangle",
    });
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <label className="text-sm text-slate-400">Fill Color</label>
        <Input
          type="color"
          value={triangleFill}
          onChange={(e) => {
            setTriangleFill(e.target.value);
            handlePropertyChange("fill", e.target.value);
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-slate-400">Stroke Color</label>
        <Input
          type="color"
          value={triangleStroke}
          onChange={(e) => {
            setTriangleStroke(e.target.value);
            handlePropertyChange("stroke", e.target.value);
          }}
        />
      </div>

      <CustomSlider
        sliderName="Width"
        min={10}
        max={500}
        defaultValue={triangleWidth}
        sliderValue={triangleWidth}
        setSliderValue={(value) => {
          setTriangleWidth(value);
          handlePropertyChange("width", value);
        }}
        logName="triangle width"
        section="shape"
        tab="shape"
      />

      <CustomSlider
        sliderName="Height"
        min={10}
        defaultValue={triangleHeight}
        max={500}
        sliderValue={triangleHeight}
        setSliderValue={(value) => {
          setTriangleHeight(value);
          handlePropertyChange("height", value);
        }}
        logName="triangle height"
        section="shape"
        tab="shape"
      />

      <CustomSlider
        sliderName="Opacity"
        min={0}
        max={1}
        step={0.01}
        defaultValue={triangleOpacity}
        sliderValue={triangleOpacity}
        setSliderValue={(value) => {
          setTriangleOpacity(value);
          handlePropertyChange("opacity", value);
        }}
        logName="triangle opacity"
        section="shape"
        tab="shape"
      />
    </>
  );
};
