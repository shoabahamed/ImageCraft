import { Input } from "@/components/ui/input";
import { Slider } from "./ui/slider";
import { useShapeStore } from "@/hooks/appStore/ShapeStore";
import { useLogContext } from "@/hooks/useLogContext";
import { Canvas } from "fabric";

export const TriangleProperties = ({
  canvasRef,
}: {
  canvasRef: React.RefObject<Canvas>;
}) => {
  const { addLog } = useLogContext();
  const {
    triangleFill,
    triangleStroke,
    triangleWidth,
    triangleHeight,
    triangleOpacity,
    triangleStrokeWidth,
    setTriangleStrokeWidth,
    setTriangleFill,
    setTriangleStroke,
    setTriangleWidth,
    setTriangleHeight,
    setTriangleOpacity,
  } = useShapeStore();

  const handleTriangleFill = (value) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject) {
      addLog({
        section: "shape",
        tab: "shape",
        event: "update",
        message: `Triangle fill color changed to ${value}`,
        param: "fill",
        objType: "triangle",
      });

      selectedObject.set({
        fill: value,
      });

      setTriangleFill(value);

      selectedObject.setCoords();
      canvasRef.current.fire("object:modified");

      canvasRef.current.renderAll();
    }
  };

  const handleTriangleStroke = (value) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject) {
      addLog({
        section: "shape",
        tab: "shape",
        event: "update",
        message: `Triangle stroke color changed to ${value}`,
        param: "stroke",
        objType: "triangle",
      });

      selectedObject.set({
        stroke: value,
      });

      setTriangleStroke(value);

      selectedObject.setCoords();
      canvasRef.current.fire("object:modified");

      canvasRef.current.renderAll();
    }
  };

  const handleTriangleWidth = (value) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject) {
      addLog({
        section: "shape",
        tab: "shape",
        event: "update",
        message: `Triangle width changed to ${value}`,
        param: "width",
        objType: "triangle",
      });

      selectedObject.set({
        width: value,
      });

      setTriangleWidth(value);

      selectedObject.setCoords();
      canvasRef.current.fire("object:modified");

      canvasRef.current.renderAll();
    }
  };

  const handleTriangleHeight = (value) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject) {
      addLog({
        section: "shape",
        tab: "shape",
        event: "update",
        message: `Triangle height changed to ${value}`,
        param: "height",
        objType: "triangle",
      });

      selectedObject.set({
        height: value,
      });

      setTriangleHeight(value);

      selectedObject.setCoords();
      canvasRef.current.fire("object:modified");

      canvasRef.current.renderAll();
    }
  };

  const handleTriangleOpacity = (value) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject) {
      addLog({
        section: "shape",
        tab: "shape",
        event: "update",
        message: `Triangle opacity changed to ${value}`,
        param: "opacity",
        objType: "triangle",
      });

      selectedObject.set({
        opacity: value,
      });

      setTriangleOpacity(value);

      selectedObject.setCoords();
      canvasRef.current.fire("object:modified");

      canvasRef.current.renderAll();
    }
  };

  const handleTriangleStrokeWidth = (value) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject) {
      addLog({
        section: "shape",
        tab: "shape",
        event: "update",
        message: `Line stroke width changed to ${value}`,
        param: "strokeWidth",
        objType: "triangle",
      });

      selectedObject.set({
        strokeWidth: value,
      });

      setTriangleStrokeWidth(value);

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
          value={triangleFill}
          onChange={(e) => {
            handleTriangleFill(e.target.value);
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-slate-400">Stroke Color</label>
        <Input
          type="color"
          value={triangleStroke}
          onChange={(e) => {
            handleTriangleStroke(e.target.value);
          }}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center text-slate-400 text-sm">
          <p>Stroke Width</p>
          <p>{triangleStrokeWidth}</p>
        </div>

        <Slider
          value={[triangleStrokeWidth]}
          min={1}
          max={20}
          step={1}
          onValueChange={(e) => {
            handleTriangleStrokeWidth(e[0]);
          }}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center text-slate-400 text-sm">
          <p>Width</p>
          <p>{triangleWidth}</p>
        </div>

        <Slider
          value={[triangleWidth]}
          min={10}
          max={500}
          step={1}
          onValueChange={(e) => {
            handleTriangleWidth(e[0]);
          }}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center text-slate-400 text-sm">
          <p>Height</p>
          <p>{triangleHeight}</p>
        </div>

        <Slider
          value={[triangleHeight]}
          min={10}
          max={500}
          step={1}
          onValueChange={(e) => {
            handleTriangleHeight(e[0]);
          }}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center text-slate-400 text-sm">
          <p>Opacity</p>
          <p>{triangleOpacity}</p>
        </div>

        <Slider
          value={[triangleOpacity]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={(e) => {
            handleTriangleOpacity(e[0]);
          }}
        />
      </div>
    </>
  );
};
