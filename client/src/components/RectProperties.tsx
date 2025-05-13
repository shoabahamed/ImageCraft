import { Input } from "@/components/ui/input";
import { useShapeStore } from "@/hooks/appStore/ShapeStore";
import { useLogContext } from "@/hooks/useLogContext";
import { Canvas, Shadow } from "fabric";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Droplet, PenTool, Layers } from "lucide-react";

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
    shadowEnabled,
    shadowColor,
    shadowBlur,
    shadowOffsetX,
    shadowOffsetY,
    setRectStrokeWidth,
    setRectFill,
    setRectStroke,
    setRectWidth,
    setRectHeight,
    setRectOpacity,
    setShadowEnabled,
    setShadowColor,
    setShadowBlur,
    setShadowOffsetX,
    setShadowOffsetY,
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
        message: `Rectangle stroke width changed to ${value}`,
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

  const handleShadowToggle = (checked: boolean) => {
    const selectedObject = canvasRef.current.getActiveObject();
    if (selectedObject) {
      addLog({
        section: "shape",
        tab: "shape",
        event: "update",
        message: `Rectangle shadow ${checked ? "enabled" : "disabled"}`,
        param: "shadow",
        objType: "rect",
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
        message: `Rectangle shadow color changed to ${value}`,
        param: "shadowColor",
        objType: "rect",
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
        message: `Rectangle shadow blur changed to ${value}`,
        param: "shadowBlur",
        objType: "rect",
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
        message: `Rectangle shadow offset X changed to ${value}`,
        param: "shadowOffsetX",
        objType: "rect",
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
        message: `Rectangle shadow offset Y changed to ${value}`,
        param: "shadowOffsetY",
        objType: "rect",
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
              handleRectFill(
                rectFill === "transparent" ? "#ffffff" : "transparent"
              )
            }
            className={`h-8 w-8 rounded-full ${
              rectFill !== "transparent" ? "bg-slate-200 dark:bg-slate-700" : ""
            }`}
          >
            <Droplet className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              handleRectStroke(
                rectStroke === "transparent" ? "#000000" : "transparent"
              )
            }
            className={`h-8 w-8 rounded-full ${
              rectStroke !== "transparent"
                ? "bg-slate-200 dark:bg-slate-700"
                : ""
            }`}
          >
            <PenTool className="h-4 w-4" />
          </Button>
        </div>

        {rectFill !== "transparent" && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Fill</span>
              <Input
                type="color"
                value={rectFill === "transparent" ? "#ffffff" : rectFill}
                onChange={(e) => {
                  handleRectFill(e.target.value);
                }}
                className="h-8 w-full cursor-pointer"
              />
            </div>
          </div>
        )}

        {rectStroke !== "transparent" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Stroke</span>
              <Input
                type="color"
                value={rectStroke}
                onChange={(e) => {
                  handleRectStroke(e.target.value);
                }}
                className="h-8 w-full cursor-pointer"
              />
            </div>
            <div className="flex flex-col gap-2">
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
          </div>
        )}
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
