import { Input } from "@/components/ui/input";

import { useShapeStore } from "@/hooks/appStore/ShapeStore";
import { useLogContext } from "@/hooks/useLogContext";
import CustomSlider from "./custom-slider";

import { Canvas } from "fabric";
import { Slider } from "./ui/slider";

export const RectProperties = ({
  canvasRef,
}: {
  canvasRef: React.RefObject<Canvas>;
}) => {
  const { addLog } = useLogContext();
  const {
    rectFill,
    rectStroke,
    rectWidth,
    rectHeight,
    rectOpacity,
    rectStrokeWidth,
    setRectStrokeWidth,
    setRectFill,
    setRectStroke,
    setRectWidth,
    setRectHeight,
    setRectOpacity,
  } = useShapeStore();

  const handleRectFill = (value) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject) {
      addLog({
        section: "shape",
        tab: "shape",
        event: "update",
        message: `Rectangle fill color changed to ${value}`,
        param: "fill",
        objType: "rect",
      });

      selectedObject.set({
        fill: value,
      });

      setRectFill(value);

      selectedObject.setCoords();
      canvasRef.current.fire("object:modified");

      canvasRef.current.renderAll();
    }
  };

  const handleRectStroke = (value) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject) {
      addLog({
        section: "shape",
        tab: "shape",
        event: "update",
        message: `Rectangle stroke color changed to ${value}`,
        param: "stroke",
        objType: "rect",
      });

      selectedObject.set({
        stroke: value,
      });

      setRectStroke(value);

      selectedObject.setCoords();
      canvasRef.current.fire("object:modified");

      canvasRef.current.renderAll();
    }
  };

  const handleRectWidth = (value) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject) {
      addLog({
        section: "shape",
        tab: "shape",
        event: "update",
        message: `Rectangle width changed to ${value}`,
        param: "width",
        objType: "rect",
      });

      selectedObject.set({
        width: value,
      });

      setRectWidth(value);

      selectedObject.setCoords();
      canvasRef.current.fire("object:modified");

      canvasRef.current.renderAll();
    }
  };

  const handleRectHeight = (value) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject) {
      addLog({
        section: "shape",
        tab: "shape",
        event: "update",
        message: `Rectangle height changed to ${value}`,
        param: "height",
        objType: "rect",
      });

      selectedObject.set({
        height: value,
      });

      setRectHeight(value);

      selectedObject.setCoords();
      canvasRef.current.fire("object:modified");

      canvasRef.current.renderAll();
    }
  };

  const handleRectOpacity = (value) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject) {
      addLog({
        section: "shape",
        tab: "shape",
        event: "update",
        message: `Rectangle opacity changed to ${value}`,
        param: "opacity",
        objType: "rect",
      });

      selectedObject.set({
        opacity: value,
      });

      setRectOpacity(value);

      selectedObject.setCoords();
      canvasRef.current.fire("object:modified");

      canvasRef.current.renderAll();
    }
  };

  const handleRectStrokeWidth = (value) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject) {
      addLog({
        section: "shape",
        tab: "shape",
        event: "update",
        message: `Line stroke width changed to ${value}`,
        param: "strokeWidth",
        objType: "rect",
      });

      selectedObject.set({
        strokeWidth: value,
      });

      setRectStrokeWidth(value);

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
          value={rectFill}
          onChange={(e) => {
            handleRectFill(e.target.value);
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-slate-400">Stroke Color</label>
        <Input
          type="color"
          value={rectStroke}
          onChange={(e) => {
            handleRectStroke(e.target.value);
          }}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center text-slate-400 text-sm">
          <p>Stroke Width</p>
          <p>{rectStrokeWidth}</p>
        </div>

        <Slider
          value={[rectStrokeWidth]}
          min={1}
          max={20}
          step={1}
          onValueChange={(e) => {
            handleRectStrokeWidth(e[0]);
          }}
        />
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center text-slate-400 text-sm">
          <p>Width</p>
          <p>{rectWidth}</p>
        </div>

        <Slider
          value={[rectWidth]}
          min={1}
          max={500}
          step={1}
          onValueChange={(e) => {
            handleRectWidth(e[0]);
          }}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center text-slate-400 text-sm">
          <p>Height</p>
          <p>{rectHeight}</p>
        </div>

        <Slider
          value={[rectHeight]}
          min={1}
          max={500}
          step={1}
          onValueChange={(e) => {
            handleRectHeight(e[0]);
          }}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center text-slate-400 text-sm">
          <p>Opacity</p>
          <p>{rectOpacity}</p>
        </div>

        <Slider
          value={[rectOpacity]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={(e) => {
            handleRectOpacity(e[0]);
          }}
        />
      </div>
    </>
  );
};
