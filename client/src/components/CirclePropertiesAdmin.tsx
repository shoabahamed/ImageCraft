import { Input } from "@/components/ui/input";
import { useShapeStore } from "@/hooks/appStore/ShapeStore";
import { useLogContext } from "@/hooks/useLogContext";
import { Canvas, Shadow } from "fabric";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Droplet, PenTool, Layers } from "lucide-react";

export const CirclePropertiesAdmin = ({
  canvasRef,
}: {
  canvasRef: React.RefObject<Canvas>;
}) => {
  const {
    circleFill,
    circleStroke,
    circleRadius,
    circleOpacity,
    circleStrokeWidth,
    shadowEnabled,
    shadowColor,
    shadowBlur,
    shadowOffsetX,
    shadowOffsetY,
    circleSkewX,
    circleSkewY,
    setCircleStrokeWidth,
    setCircleFill,
    setCircleStroke,
    setCircleRadius,
    setCircleOpacity,
    setShadowEnabled,
    setShadowColor,
    setShadowBlur,
    setShadowOffsetX,
    setShadowOffsetY,
    setCircleSkewX,
    setCircleSkewY,
  } = useShapeStore();

  const handleCircleFill = (value) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject) {
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
      selectedObject.set({
        strokeWidth: value,
      });

      setCircleStrokeWidth(value);
      selectedObject.setCoords();
      canvasRef.current.fire("object:modified");
      canvasRef.current.renderAll();
    }
  };

  const handleCircleSkewX = (value) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject) {
      selectedObject.set({
        skewX: value,
      });
      setCircleSkewX(value);
      selectedObject.setCoords();
      canvasRef.current.fire("object:modified");
      canvasRef.current.renderAll();
    }
  };

  const handleCircleSkewY = (value) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject) {
      selectedObject.set({
        skewY: value,
      });
      setCircleSkewY(value);
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
              handleCircleFill(
                circleFill === "transparent" ? "#ffffff" : "transparent"
              )
            }
            className={`h-8 w-8 rounded-full ${
              circleFill !== "transparent"
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
              handleCircleStroke(
                circleStroke === "transparent" ? "#000000" : "transparent"
              )
            }
            className={`h-8 w-8 rounded-full ${
              circleStroke !== "transparent"
                ? "bg-slate-200 dark:bg-slate-700"
                : ""
            }`}
          >
            <PenTool className="h-4 w-4" />
          </Button>
        </div>

        {circleFill !== "transparent" && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Fill</span>
              <Input
                type="color"
                value={circleFill === "transparent" ? "#ffffff" : circleFill}
                onChange={(e) => {
                  handleCircleFill(e.target.value);
                }}
                className="h-8 w-full cursor-pointer"
              />
            </div>
          </div>
        )}

        {circleStroke !== "transparent" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Stroke</span>
              <Input
                type="color"
                value={circleStroke}
                onChange={(e) => {
                  handleCircleStroke(e.target.value);
                }}
                className="h-8 w-full cursor-pointer"
              />
            </div>
            <div className="flex flex-col gap-2">
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
          </div>
        )}
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

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center text-slate-400 text-sm">
          <p>Skew X</p>
          <p>{circleSkewX}°</p>
        </div>
        <Slider
          value={[circleSkewX]}
          min={-45}
          max={45}
          step={1}
          onValueChange={(e) => {
            handleCircleSkewX(e[0]);
          }}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center text-slate-400 text-sm">
          <p>Skew Y</p>
          <p>{circleSkewY}°</p>
        </div>
        <Slider
          value={[circleSkewY]}
          min={-45}
          max={45}
          step={1}
          onValueChange={(e) => {
            handleCircleSkewY(e[0]);
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
