import { Input } from "@/components/ui/input";
import { Slider } from "./ui/slider";
import { useShapeStore } from "@/hooks/appStore/ShapeStore";
import { Canvas, Shadow } from "fabric";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Droplet, PenTool, Layers } from "lucide-react";

export const TrianglePropertiesAdmin = ({
  canvasRef,
}: {
  canvasRef: React.RefObject<Canvas>;
}) => {
  const {
    triangleFill,
    triangleStroke,
    triangleWidth,
    triangleHeight,
    triangleOpacity,
    triangleStrokeWidth,
    shadowEnabled,
    shadowColor,
    shadowBlur,
    shadowOffsetX,
    shadowOffsetY,
    setTriangleStrokeWidth,
    setTriangleFill,
    setTriangleStroke,
    setTriangleWidth,
    setTriangleHeight,
    setTriangleOpacity,
    setShadowEnabled,
    setShadowColor,
    setShadowBlur,
    setShadowOffsetX,
    setShadowOffsetY,
  } = useShapeStore();

  const handleTriangleFill = (value) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject) {
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
      selectedObject.set({
        strokeWidth: value,
      });

      setTriangleStrokeWidth(value);

      selectedObject.setCoords();
      canvasRef.current.fire("object:modified");
      canvasRef.current.renderAll();
    }
  };

  const handleShadowToggle = (checked: boolean) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject) {
      if (checked) {
        const shadow = new Shadow({
          color: shadowColor,
          blur: shadowBlur,
          offsetX: shadowOffsetX,
          offsetY: shadowOffsetY,
        });
        selectedObject.set("shadow", shadow);
        setShadowEnabled(true);
      } else {
        selectedObject.set("shadow", null);
        setShadowEnabled(false);
      }
      selectedObject.setCoords();
      canvasRef.current.fire("object:modified");
      canvasRef.current.renderAll();
    }
  };

  const handleShadowColor = (value: string) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject && selectedObject.shadow) {
      const shadow = selectedObject.shadow;
      shadow.color = value;
      selectedObject.set("shadow", shadow);
      setShadowColor(value);
      selectedObject.setCoords();
      canvasRef.current.fire("object:modified");
      canvasRef.current.renderAll();
    }
  };

  const handleShadowBlur = (value: number) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject && selectedObject.shadow) {
      const shadow = selectedObject.shadow;
      shadow.blur = value;
      selectedObject.set("shadow", shadow);
      setShadowBlur(value);
      selectedObject.setCoords();
      canvasRef.current.fire("object:modified");
      canvasRef.current.renderAll();
    }
  };

  const handleShadowOffsetX = (value: number) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject && selectedObject.shadow) {
      const shadow = selectedObject.shadow;
      shadow.offsetX = value;
      selectedObject.set("shadow", shadow);
      setShadowOffsetX(value);
      selectedObject.setCoords();
      canvasRef.current.fire("object:modified");
      canvasRef.current.renderAll();
    }
  };

  const handleShadowOffsetY = (value: number) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject && selectedObject.shadow) {
      const shadow = selectedObject.shadow;
      shadow.offsetY = value;
      selectedObject.set("shadow", shadow);
      setShadowOffsetY(value);
      selectedObject.setCoords();
      canvasRef.current.fire("object:modified");
      canvasRef.current.renderAll();
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
        <div className="flex items-center gap-2 border-b pb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              handleTriangleFill(
                triangleFill === "transparent" ? "#ffffff" : "transparent"
              )
            }
            className={`h-8 w-8 rounded-full ${
              triangleFill !== "transparent"
                ? "bg-slate-200 dark:bg-slate-700"
                : ""
            }`}
          >
            <Droplet className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              handleTriangleStroke(
                triangleStroke === "transparent" ? "#000000" : "transparent"
              )
            }
            className={`h-8 w-8 rounded-full ${
              triangleStroke !== "transparent"
                ? "bg-slate-200 dark:bg-slate-700"
                : ""
            }`}
          >
            <PenTool className="h-4 w-4" />
          </Button>
        </div>

        {triangleFill !== "transparent" && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Fill</span>
              <Input
                type="color"
                value={
                  triangleFill === "transparent" ? "#ffffff" : triangleFill
                }
                onChange={(e) => {
                  handleTriangleFill(e.target.value);
                }}
                className="h-8 w-full cursor-pointer"
              />
            </div>
          </div>
        )}

        {triangleStroke !== "transparent" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Stroke</span>
              <Input
                type="color"
                value={triangleStroke}
                onChange={(e) => {
                  handleTriangleStroke(e.target.value);
                }}
                className="h-8 w-full cursor-pointer"
              />
            </div>
            <div className="flex flex-col gap-2">
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
          </div>
        )}
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

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-400" />
            <label className="text-sm text-slate-400">Shadow</label>
          </div>
          <Switch
            checked={shadowEnabled}
            onCheckedChange={handleShadowToggle}
          />
        </div>
        {shadowEnabled && (
          <div className="flex flex-col gap-4 pl-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-400">Shadow Color</label>
              <Input
                type="color"
                value={shadowColor}
                onChange={(e) => {
                  handleShadowColor(e.target.value);
                }}
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center text-slate-400 text-sm">
                <p>Blur</p>
                <p>{shadowBlur}</p>
              </div>
              <Slider
                value={[shadowBlur]}
                min={0}
                max={50}
                step={1}
                onValueChange={(e) => {
                  handleShadowBlur(e[0]);
                }}
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center text-slate-400 text-sm">
                <p>Offset X</p>
                <p>{shadowOffsetX}</p>
              </div>
              <Slider
                value={[shadowOffsetX]}
                min={-50}
                max={50}
                step={1}
                onValueChange={(e) => {
                  handleShadowOffsetX(e[0]);
                }}
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center text-slate-400 text-sm">
                <p>Offset Y</p>
                <p>{shadowOffsetY}</p>
              </div>
              <Slider
                value={[shadowOffsetY]}
                min={-50}
                max={50}
                step={1}
                onValueChange={(e) => {
                  handleShadowOffsetY(e[0]);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};
