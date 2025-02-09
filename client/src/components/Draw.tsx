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
  canvas: fabric.Canvas;
};

const Draw = ({ canvas }: DrawProps) => {
  const { firstLoad, setFirstLoad } = useState(false);
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
    if (canvas) {
      if (brushType !== "none") {
        canvas.isDrawingMode = true;
        const brush = createBrush(canvas, brushType, brushColor, brushSize);
        canvas.freeDrawingBrush = brush;
      } else {
        canvas.isDrawingMode = false;
      }
    }
  }, [canvas, brushType, brushColor, brushSize]);

  const clearBrushStrokes = () => {
    if (!canvas) return;
    addLog({
      section: "draw",
      tab: "draw",
      event: "reset",
      message: `Cleared all created brush strokes`,
    });

    // Filter objects that are created in drawing mode
    const objectsToRemove = canvas.getObjects().filter((obj) => {
      // Exclude objects that are not part of brush strokes
      return (
        obj.type === "path" || // Pencil Brush objects
        obj.type === "circle" || // Circle Brush objects
        obj.type === "spray" || // Spray Brush group objects
        obj.type === "group" // Group objects (used by Spray Brush sometimes)
      );
    });

    // Remove the filtered objects
    objectsToRemove.forEach((obj) => canvas.remove(obj));

    canvas.renderAll(); // Refresh the canvas
  };

  useEffect(() => {
    if (!canvas) return;

    // Function to handle selection of an object
    const handleObjectCreated = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        setSelectedObject(activeObject); // Update the context with the selected object
      }
    };

    const handleObjectUpdated = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        const objectName = activeObject.type || "Unknown Object";
        setSelectedObject(activeObject); // Update the context with the selected object
      }
    };

    const handleObjectModified = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        const objectName = activeObject.type || "Unknown Object";

        setSelectedObject(activeObject); // Update the context with the selected object
      }
    };

    const handleObjectScaled = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        const objectName = activeObject.type || "Unknown Object";
        const scaleX = activeObject.scaleX?.toFixed(2) || "N/A";
        const scaleY = activeObject.scaleY?.toFixed(2) || "N/A";

        addLog({
          section: "draw",
          tab: "draw",
          event: "update",
          message: `Scaled selected object: ${objectName}. scaleX changed to ${scaleX}, scaleY changed to ${scaleY}`,
          param: "scale",
          objType: "brush",
        });

        setSelectedObject(activeObject); // Update the context with the selected object
      }
    };

    // Function to handle deselection of objects
    const handleObjectDeselected = () => {
      setSelectedObject(null); // Clear the selected object in the context
    };

    const handlePathCreated = () => {
      addLog({
        section: "draw",
        tab: "draw",
        event: "create",
        message: `created brush strokes`,
      });
    };
    // Attach event listeners
    canvas.on("selection:created", handleObjectCreated);
    canvas.on("selection:updated", handleObjectUpdated);
    canvas.on("object:modified", handleObjectModified);
    canvas.on("object:scaling", handleObjectScaled);
    canvas.on("selection:cleared", handleObjectDeselected);
    // Attach event listener for path creation
    canvas.on("path:created", handlePathCreated);

    // Cleanup event listeners on unmount or canvas changes
    return () => {
      canvas.off("selection:created", handleObjectCreated);
      canvas.off("selection:updated", handleObjectUpdated);
      canvas.off("object:modified", handleObjectModified);
      canvas.off("object:scaling", handleObjectScaled);
      canvas.off("selection:cleared", handleObjectDeselected);
      // Attach event listener for path creation
      canvas.off("path:created", handlePathCreated);
    };
  }, [canvas, setSelectedObject]);

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
                <SelectItem value="none">None</SelectItem>
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
