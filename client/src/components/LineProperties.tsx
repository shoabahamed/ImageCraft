import { Input } from "@/components/ui/input";
import { Slider } from "./ui/slider";
import { useShapeStore } from "@/hooks/appStore/ShapeStore";
import { useLogContext } from "@/hooks/useLogContext";
import { Canvas, Shadow } from "fabric";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { PenTool, Layers } from "lucide-react";

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
    shadowEnabled,
    shadowColor,
    shadowBlur,
    shadowOffsetX,
    shadowOffsetY,
    setLineStroke,
    setLineStrokeWidth,
    setLineOpacity,
    setShadowEnabled,
    setShadowColor,
    setShadowBlur,
    setShadowOffsetX,
    setShadowOffsetY,
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

  const handleShadowToggle = (checked: boolean) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject) {
      addLog({
        section: "shape",
        tab: "shape",
        event: "update",
        message: `Line shadow ${checked ? "enabled" : "disabled"}`,
        param: "shadow",
        objType: "line",
      });

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
      addLog({
        section: "shape",
        tab: "shape",
        event: "update",
        message: `Line shadow color changed to ${value}`,
        param: "shadowColor",
        objType: "line",
      });

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
      addLog({
        section: "shape",
        tab: "shape",
        event: "update",
        message: `Line shadow blur changed to ${value}`,
        param: "shadowBlur",
        objType: "line",
      });

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
      addLog({
        section: "shape",
        tab: "shape",
        event: "update",
        message: `Line shadow offset X changed to ${value}`,
        param: "shadowOffsetX",
        objType: "line",
      });

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
      addLog({
        section: "shape",
        tab: "shape",
        event: "update",
        message: `Line shadow offset Y changed to ${value}`,
        param: "shadowOffsetY",
        objType: "line",
      });

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
              handleLineStroke(
                lineStroke === "transparent" ? "#000000" : "transparent"
              )
            }
            className={`h-8 w-8 rounded-full ${
              lineStroke !== "transparent"
                ? "bg-slate-200 dark:bg-slate-700"
                : ""
            }`}
          >
            <PenTool className="h-4 w-4" />
          </Button>
        </div>

        {lineStroke !== "transparent" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Stroke</span>
              <Input
                type="color"
                value={lineStroke}
                onChange={(e) => {
                  handleLineStroke(e.target.value);
                }}
                className="h-8 w-full cursor-pointer"
              />
            </div>
            <div className="flex flex-col gap-2">
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
          </div>
        )}
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
