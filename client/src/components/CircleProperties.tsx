import { Input } from "@/components/ui/input";

import { useShapeStore } from "@/hooks/appStore/ShapeStore";
import { useLogContext } from "@/hooks/useLogContext";
import { Canvas } from "fabric";
import { Slider } from "./ui/slider";

export const CircleProperties = ({
  canvasRef,
}: {
  canvasRef: React.RefObject<Canvas>;
}) => {
  const { addLog } = useLogContext();
  const {
    circleFill,
    circleStroke,
    circleRadius,
    circleOpacity,
    circleStrokeWidth,
    setCircleStrokeWidth,
    setCircleFill,
    setCircleStroke,
    setCircleRadius,
    setCircleOpacity,
  } = useShapeStore();

  const handleCircleFill = (value) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject) {
      addLog({
        section: "shape",
        tab: "shape",
        event: "update",
        message: `Circle color changed to ${value}`,
        param: "color",
        objType: "circle",
      });

      selectedObject.set({
        fill: value,
      });

      setCircleFill(value);

      selectedObject.setCoords();
      canvasRef.current.fire("object:modified");

      canvasRef.current.renderAll();
    }
  };

  const handleCircleStroke = (value) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject) {
      addLog({
        section: "shape",
        tab: "shape",
        event: "update",
        message: `Circle stroke color changed to ${value}`,
        param: "stroke",
        objType: "circle",
      });

      selectedObject.set({
        stroke: value,
      });

      setCircleStroke(value);

      selectedObject.setCoords();
      canvasRef.current.fire("object:modified");

      canvasRef.current.renderAll();
    }
  };

  const handleCircleRadius = (value) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject) {
      addLog({
        section: "shape",
        tab: "shape",
        event: "update",
        message: `Circle radius changed to ${value}`,
        param: "radius",
        objType: "circle",
      });

      selectedObject.set({
        radius: value,
      });

      setCircleRadius(value);

      selectedObject.setCoords();
      canvasRef.current.fire("object:modified");

      canvasRef.current.renderAll();
    }
  };

  const handleCircleOpacity = (value) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject) {
      addLog({
        section: "shape",
        tab: "shape",
        event: "update",
        message: `Circle opacity changed to ${value}`,
        param: "opacity",
        objType: "circle",
      });

      selectedObject.set({
        opacity: value,
      });

      setCircleOpacity(value);

      selectedObject.setCoords();
      canvasRef.current.fire("object:modified");

      canvasRef.current.renderAll();
    }
  };

  const handleCircleStrokeWidth = (value) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject) {
      addLog({
        section: "shape",
        tab: "shape",
        event: "update",
        message: `Line stroke width changed to ${value}`,
        param: "strokeWidth",
        objType: "circle",
      });

      selectedObject.set({
        strokeWidth: value,
      });

      setCircleStrokeWidth(value);

      selectedObject.setCoords();
      canvasRef.current.fire("object:modified");

      canvasRef.current.renderAll();
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <label className="text-sm text-slate-400">Fill Color</label>
        <Input
          type="color"
          value={circleFill}
          onChange={(e) => {
            handleCircleFill(e.target.value);
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-slate-400">Stroke Color</label>
        <Input
          type="color"
          value={circleStroke}
          onChange={(e) => {
            handleCircleStroke(e.target.value);
          }}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center text-slate-400 text-sm">
          <p>Stroke Width</p>
          <p>{circleStrokeWidth}</p>
        </div>

        <Slider
          value={[circleStrokeWidth]}
          min={1}
          max={20}
          step={1}
          onValueChange={(e) => {
            handleCircleStrokeWidth(e[0]);
          }}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center text-slate-400 text-sm">
          <p>Size</p>
          <p>{circleRadius}</p>
        </div>

        <Slider
          value={[circleRadius]}
          min={1}
          max={500}
          step={1}
          onValueChange={(e) => {
            handleCircleRadius(e[0]);
          }}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center text-slate-400 text-sm">
          <p>Opacity</p>
          <p>{circleOpacity}</p>
        </div>

        <Slider
          value={[circleOpacity]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={(e) => {
            handleCircleOpacity(e[0]);
          }}
        />
      </div>
    </>
  );
};
