import { Input } from "@/components/ui/input";
import { Slider } from "./ui/slider";
import { useShapeStore } from "@/hooks/appStore/ShapeStore";
import { useLogContext } from "@/hooks/useLogContext";

import { Canvas } from "fabric";

export const LineProperties = ({
  canvasRef,
}: {
  canvasRef: React.RefObject<Canvas>;
}) => {
  const { addLog } = useLogContext();
  const {
    lineStroke,
    lineStrokeWidth,
    lineOpacity,
    setLineStroke,
    setLineStrokeWidth,
    setLineOpacity,
  } = useShapeStore();

  const handleLineStroke = (value) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject) {
      addLog({
        section: "shape",
        tab: "shape",
        event: "update",
        message: `Line stroke color changed to ${value}`,
        param: "stroke",
        objType: "line",
      });

      selectedObject.set({
        stroke: value,
      });

      setLineStroke(value);

      selectedObject.setCoords();
      canvasRef.current.fire("object:modified");

      canvasRef.current.renderAll();
    }
  };

  const handleLineStrokeWidth = (value) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject) {
      addLog({
        section: "shape",
        tab: "shape",
        event: "update",
        message: `Line stroke width changed to ${value}`,
        param: "strokeWidth",
        objType: "line",
      });

      selectedObject.set({
        strokeWidth: value,
      });

      setLineStrokeWidth(value);

      selectedObject.setCoords();
      canvasRef.current.fire("object:modified");

      canvasRef.current.renderAll();
    }
  };

  const handleLineOpacity = (value) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject) {
      addLog({
        section: "shape",
        tab: "shape",
        event: "update",
        message: `Line opacity changed to ${value}`,
        param: "opacity",
        objType: "line",
      });

      selectedObject.set({
        opacity: value,
      });

      setLineOpacity(value);

      selectedObject.setCoords();
      canvasRef.current.fire("object:modified");

      canvasRef.current.renderAll();
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <label className="text-sm text-slate-400">Stroke Color</label>
        <Input
          type="color"
          value={lineStroke}
          onChange={(e) => {
            handleLineStroke(e.target.value);
          }}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center text-slate-400 text-sm">
          <p>Stroke Width</p>
          <p>{lineStrokeWidth}</p>
        </div>

        <Slider
          value={[lineStrokeWidth]}
          min={1}
          max={20}
          step={1}
          onValueChange={(e) => {
            handleLineStrokeWidth(e[0]);
          }}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center text-slate-400 text-sm">
          <p>Opacity</p>
          <p>{lineOpacity}</p>
        </div>

        <Slider
          value={[lineOpacity]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={(e) => {
            handleLineOpacity(e[0]);
          }}
        />
      </div>
    </>
  );
};
