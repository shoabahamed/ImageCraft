import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "./ui/input";
import CustomSlider from "./custom-slider";
import * as fabric from "fabric";
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";
import { useLogContext } from "@/hooks/useLogContext";
import useDrawStore from "@/hooks/appStore/DrawStore";

type DrawProps = {
  canvasRef: React.RefObject<fabric.Canvas>;
};

const Draw = ({ canvasRef }: DrawProps) => {
  // const { firstLoad, setFirstLoad } = useState(false);
  // @ts-ignore
  const { selectedObject, setSelectedObject } = useCanvasObjects();
  const { addLog } = useLogContext();
  // Deconstruct each value individually from the store
  const brushSize = useDrawStore((state) => state.brushSize);
  const brushColor = useDrawStore((state) => state.brushColor);
  const brushType = useDrawStore((state) => state.brushType);

  // Deconstruct the setter functions individually as well
  const setBrushSize = useDrawStore((state) => state.setBrushSize);
  const setBrushColor = useDrawStore((state) => state.setBrushColor);
  const setBrushType = useDrawStore((state) => state.setBrushType);

  const createBrush = (
    canvas: fabric.Canvas,
    type: string,
    color: string,
    size: number
  ) => {
    let brush: fabric.BaseBrush;

    switch (type) {
      case "circle":
        brush = new fabric.CircleBrush(canvas);
        brush.width = size;
        brush.color = color;
        break;

      case "spray":
        brush = new fabric.SprayBrush(canvas);
        brush.width = size;
        brush.color = color;
        break;

      default:
        brush = new fabric.PencilBrush(canvas);
        brush.color = color;
        brush.width = size;
    }

    return brush;
  };

  useEffect(() => {
    if (canvasRef.current) {
      if (brushType !== "none") {
        setSelectedObject(null); // Clear selected object when drawing mode is enabled
        canvasRef.current.discardActiveObject();
        canvasRef.current.isDrawingMode = true;
        const brush = createBrush(
          canvasRef.current,
          brushType,
          brushColor,
          brushSize
        );
        canvasRef.current.freeDrawingBrush = brush;
      } else {
        canvasRef.current.isDrawingMode = false;
      }
    }

    return () => {
      canvasRef.current.isDrawingMode = false;
    };
  }, [canvasRef.current, brushType, brushColor, brushSize]);

  const clearBrushStrokes = () => {
    if (!canvasRef.current) return;
    addLog({
      section: "draw",
      tab: "draw",
      event: "reset",
      message: `Cleared all created brush strokes`,
    });

    // Filter objects that are created in drawing mode
    const objectsToRemove = canvasRef.current.getObjects().filter((obj) => {
      // Exclude objects that are not part of brush strokes
      return (
        obj.type === "path" || // Pencil Brush objects
        obj.type === "circle" || // Circle Brush objects
        obj.type === "spray" || // Spray Brush group objects
        obj.type === "group" // Group objects (used by Spray Brush sometimes)
      );
    });

    // Remove the filtered objects
    objectsToRemove.forEach((obj) => canvasRef.current.remove(obj));

    canvasRef.current.renderAll(); // Refresh the canvas
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const handlePathCreated = () => {
      addLog({
        section: "draw",
        tab: "draw",
        event: "create",
        message: `created brush strokes`,
      });
    };
    // Attach event listener for path creation
    canvasRef.current.on("path:created", handlePathCreated);

    // Cleanup event listeners on unmount or canvas changes
    return () => {
      // Attach event listener for path creation
      canvasRef.current.off("path:created", handlePathCreated);
    };
  }, [canvasRef.current, setSelectedObject]);

  return (
    <div className="flex flex-col items-center justify-center w-full gap-4">
      {/* Brush Selector */}
      <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription>Tool</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              onValueChange={(value) => {
                addLog({
                  section: "draw",
                  tab: "draw",
                  event: "update",
                  message: "Changed brush type " + brushType + " to " + value,
                  param: "brush type",
                  value: value,
                });

                setBrushType(value);
              }}
              defaultValue={brushType}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a brush" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value="none">None</SelectItem> */}
                <SelectItem value="pencil">Pencil</SelectItem>
                <SelectItem value="circle">Circle</SelectItem>
                <SelectItem value="spray">Spray</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Color and Size Controls */}
      <div className="w-[90%]">
        <Card>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="color_picker"
                  className="text-sm text-slate-400 mt-2"
                >
                  Color
                </label>
                <Input
                  id="color_picker"
                  type="color"
                  value={brushColor}
                  onChange={(e) => {
                    addLog({
                      section: "draw",
                      tab: "draw",
                      event: "update",
                      message:
                        "Changed brush color " +
                        brushColor +
                        " to " +
                        e.target.value,
                      param: "brush color",
                      value: e.target.value,
                    });

                    setBrushColor(e.target.value);
                  }}
                />
              </div>
              <CustomSlider
                sliderName="Width"
                min={1}
                max={20}
                defaultValue={brushSize}
                sliderValue={brushSize}
                setSliderValue={setBrushSize}
                logName="BrushSize"
                section={"draw"}
                tab={"tab"}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription>Actions</CardDescription>
          </CardHeader>
          <CardContent>
            <button
              className="custom-button w-full"
              onClick={clearBrushStrokes}
            >
              Reset Drawing
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Draw;
