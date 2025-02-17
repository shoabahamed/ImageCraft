import React, { useCallback, useEffect, useRef, useState } from "react";

import { Canvas, Rect, Circle, Triangle, Ellipse, Line } from "fabric";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import IconComponent from "./icon-component";
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";
import { useLogContext } from "@/hooks/useLogContext";

import {
  Square,
  Blend,
  Triangle as IconTriangle,
  Circle as IconCircle,
  Minus,
  Brush,
} from "lucide-react";
import { useShapeStore } from "@/hooks/appStore/ShapeStore";
import CustomSlider from "./custom-slider";
import { Input } from "./ui/input";
import Draw from "./Draw";

type Props = {
  canvas: Canvas;
};

const AddShape = ({ canvas }: Props) => {
  const { selectedObject, setSelectedObject } = useCanvasObjects();
  const { addLog } = useLogContext();

  const {
    // Rectangle properties
    rectWidth,
    rectHeight,
    rectFill,
    rectStroke,
    rectStrokeWidth,
    rectOpacity,
    setRectWidth,
    setRectHeight,
    setRectFill,
    setRectStroke,
    setRectStrokeWidth,
    setRectOpacity,

    // Circle properties
    circleRadius,
    circleFill,
    circleStroke,
    circleStrokeWidth,
    circleOpacity,
    setCircleRadius,
    setCircleFill,
    setCircleStroke,
    setCircleStrokeWidth,
    setCircleOpacity,

    // Triangle properties
    triangleWidth,
    triangleHeight,
    triangleFill,
    triangleStroke,
    triangleStrokeWidth,
    triangleOpacity,
    setTriangleWidth,
    setTriangleHeight,
    setTriangleFill,
    setTriangleStroke,
    setTriangleStrokeWidth,
    setTriangleOpacity,

    // Line properties
    lineStroke,
    lineStrokeWidth,
    lineOpacity,
    setLineStroke,
    setLineStrokeWidth,
    setLineOpacity,
  } = useShapeStore();

  const [shapeType, setShapeType] = useState("");
  const lineRef = useRef<Line | null>(null);
  const circleRef = useRef<Circle | null>(null);
  const rectRef = useRef<Rect | null>(null);

  const triangleRef = useRef<Triangle | null>(null);

  useEffect(() => {
    if (!canvas) return;

    const handleObjectSelected = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        setSelectedObject(activeObject);

        switch (activeObject.type) {
          case "rect":
            setRectWidth(activeObject.width || 100);
            setRectHeight(activeObject.height || 60);
            setRectFill(activeObject.fill as string);
            setRectStroke(activeObject.stroke as string);
            setRectStrokeWidth(activeObject.strokeWidth || 1);
            setRectOpacity(activeObject.opacity || 1);
            break;

          case "circle":
            setCircleRadius((activeObject as any).radius || 50);
            setCircleFill(activeObject.fill as string);
            setCircleStroke(activeObject.stroke as string);
            setCircleStrokeWidth(activeObject.strokeWidth || 1);
            setCircleOpacity(activeObject.opacity || 1);
            break;

          case "triangle":
            setTriangleWidth(activeObject.width || 60);
            setTriangleHeight(activeObject.height || 60);
            setTriangleFill(activeObject.fill as string);
            setTriangleStroke(activeObject.stroke as string);
            setTriangleStrokeWidth(activeObject.strokeWidth || 1);
            setTriangleOpacity(activeObject.opacity || 1);
            break;

          case "line":
            setLineStroke(activeObject.stroke as string);
            setLineStrokeWidth(activeObject.strokeWidth || 3);
            setLineOpacity(activeObject.opacity || 1);
            break;

          default:
            break;
        }
      } else {
        setSelectedObject(null);
      }
    };

    const handleObjectDeselected = () => {
      setSelectedObject(null);
    };

    const handleObjectScaled = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        const objectName = activeObject.type || "Unknown Object";
        const scaleX = activeObject.scaleX?.toFixed(2) || "N/A";
        const scaleY = activeObject.scaleY?.toFixed(2) || "N/A";

        addLog({
          section: "shape",
          tab: "shape",
          event: "update",
          message: `Scaled selected object: ${objectName}. scaleX changed to ${scaleX}, scaleY changed to ${scaleY}`,
          param: "scale",
          objType: objectName,
        });

        setSelectedObject(activeObject); // Update the context with the selected object
      }
    };

    const handleObjectModified = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.type !== "textbox") {
        const objectName = activeObject.type || "Unknown Object";
        addLog({
          section: "shape",
          tab: "shape",
          event: "update",
          message: `Modified selected object: ${objectName}`,
          objType: objectName,
        });
      } else {
        setSelectedObject(null);
      }
    };

    canvas.on("selection:created", handleObjectSelected);
    canvas.on("selection:updated", handleObjectSelected);
    canvas.on("object:scaling", handleObjectScaled);
    canvas.on("object:modified", handleObjectModified);
    canvas.on("selection:cleared", handleObjectDeselected);

    return () => {
      canvas.off("selection:created", handleObjectSelected);
      canvas.off("selection:updated", handleObjectSelected);
      canvas.off("selection:cleared", handleObjectDeselected);
      canvas.off("object:modified", handleObjectModified);
      canvas.off("object:scaling", handleObjectScaled);
    };
  }, [canvas]);

  // Function to update properties in Fabric.js
  const updateShapeProperties = () => {
    if (selectedObject) {
      switch (selectedObject.type) {
        case "rect":
          selectedObject.set({
            width: rectWidth,
            height: rectHeight,
            fill: rectFill,
            stroke: rectStroke,
            strokeWidth: rectStrokeWidth,
            opacity: rectOpacity,
          });
          break;

        case "circle":
          selectedObject.set({
            radius: circleRadius,
            fill: circleFill,
            stroke: circleStroke,
            strokeWidth: circleStrokeWidth,
            opacity: circleOpacity,
          });
          break;

        case "triangle":
          selectedObject.set({
            width: triangleWidth,
            height: triangleHeight,
            fill: triangleFill,
            stroke: triangleStroke,
            strokeWidth: triangleStrokeWidth,
            opacity: triangleOpacity,
          });
          break;

        case "line":
          selectedObject.set({
            stroke: lineStroke,
            strokeWidth: lineStrokeWidth,
            opacity: lineOpacity,
          });
          break;

        default:
          break;
      }

      canvas.renderAll();
    }
  };

  // code for adding circle
  const startAddingRect = useCallback((o) => {
    const pointer = canvas.getViewportPoint(o.e);

    const rect = new Rect({
      left: pointer.x,
      top: pointer.y,
      width: 1,
      height: 1,
      fill: rectFill,
      selectable: false,
    });

    rectRef.current = rect;
    canvas.add(rect);
    canvas.requestRenderAll();
  }, []);

  const startDrawingRect = useCallback((o) => {
    if (rectRef.current) {
      const pointer = canvas.getViewportPoint(o.e);
      const width = pointer.x - rectRef.current.left;
      const height = pointer.y - rectRef.current.top;

      rectRef.current.set({
        width: Math.round(Math.abs(width)),
        height: Math.round(Math.abs(height)),
      });

      canvas.renderAll();
    }
  }, []);

  const stopDrawingRect = useCallback(() => {
    rectRef.current?.setCoords();
    rectRef.current = null;

    addLog({
      section: "shape",
      tab: "shape",
      event: "creation",
      message: `created shape rect`,
      objType: "rect",
    });
  }, []);

  const activateAddingRect = () => {
    canvas.on("mouse:down", startAddingRect);
    canvas.on("mouse:move", startDrawingRect);
    canvas.on("mouse:up", stopDrawingRect);
    canvas.hoverCursor = "auto";
    canvas.selection = false;

    canvas.getObjects().forEach((obj) => {
      obj.set({
        selectable: false,
      });
    });
  };

  const deactivateAddingRect = () => {
    canvas.off("mouse:down", startAddingRect);
    canvas.off("mouse:move", startDrawingRect);
    canvas.off("mouse:up", stopDrawingRect);
    canvas.selection = true;

    canvas.getObjects().forEach((obj) => {
      if (obj.type !== "image") {
        obj.set({
          selectable: true,
        });
      }
    });

    canvas.hoverCursor = "all-scroll";
  };

  // code for adding Line
  const startAddingLine = useCallback((o) => {
    const pointer = canvas.getViewportPoint(o.e);

    const line = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
      strokeWidth: 3,
      stroke: lineStroke,
      selectable: false,
    });

    lineRef.current = line;
    canvas.add(line);
    canvas.requestRenderAll();
  }, []);

  const startDrawingLine = useCallback((o) => {
    if (lineRef.current) {
      const pointer = canvas.getViewportPoint(o.e);
      lineRef.current.set({
        x2: pointer.x,
        y2: pointer.y,
      });

      canvas.renderAll();
    }
  }, []);

  const stopDrawingLine = useCallback(() => {
    lineRef.current?.setCoords();
    lineRef.current = null;

    addLog({
      section: "shape",
      tab: "shape",
      event: "creation",
      message: `created shape rect`,
      objType: "line",
    });
  }, []);

  const activateAddingLine = () => {
    canvas.on("mouse:down", startAddingLine);
    canvas.on("mouse:move", startDrawingLine);
    canvas.on("mouse:up", stopDrawingLine);
    canvas.hoverCursor = "auto";
    canvas.selection = false;

    canvas.getObjects().forEach((obj) => {
      obj.set({
        selectable: false,
      });
    });
  };

  const deactivateAddingLine = () => {
    canvas.off("mouse:down", startAddingLine);
    canvas.off("mouse:move", startDrawingLine);
    canvas.off("mouse:up", stopDrawingLine);
    canvas.selection = true;

    canvas.getObjects().forEach((obj) => {
      if (obj.type !== "image") {
        obj.set({
          selectable: true,
        });
      }
    });

    canvas.hoverCursor = "all-scroll";
  };

  // code for adding circle
  const startAddingCircle = useCallback((o) => {
    const pointer = canvas.getViewportPoint(o.e);

    const circle = new Circle({
      top: pointer.y,
      left: pointer.x,
      fill: circleFill,
      radius: 1,
      originX: "center",
      originY: "center",
      selectable: false,
    });
    circleRef.current = circle;
    canvas.add(circle);
    canvas.requestRenderAll();
  }, []);

  const startDrawingCircle = useCallback((o) => {
    if (circleRef.current) {
      const pointer = canvas.getViewportPoint(o.e);
      const radius = Math.round(Math.abs(pointer.y - circleRef.current.top));

      circleRef.current.set({
        x2: pointer.x,
        y2: pointer.y,
        radius: radius,
      });

      canvas.renderAll();
    }
  }, []);
  const stopDrawingCircle = useCallback(() => {
    circleRef.current?.setCoords();
    circleRef.current = null;

    addLog({
      section: "shape",
      tab: "shape",
      event: "creation",
      message: `created shape circle`,
      objType: "circle",
    });
  }, []);

  const activateAddingCircle = () => {
    canvas.on("mouse:down", startAddingCircle);
    canvas.on("mouse:move", startDrawingCircle);
    canvas.on("mouse:up", stopDrawingCircle);
    canvas.hoverCursor = "auto";
    canvas.selection = false;

    canvas.getObjects().forEach((obj) => {
      obj.set({
        selectable: false,
      });
    });
  };

  const deactivateAddingCircle = () => {
    canvas.off("mouse:down", startAddingCircle);
    canvas.off("mouse:move", startDrawingCircle);
    canvas.off("mouse:up", stopDrawingCircle);
    canvas.selection = true;

    canvas.getObjects().forEach((obj) => {
      if (obj.type !== "image") {
        obj.set({
          selectable: true,
        });
      }
    });

    canvas.hoverCursor = "all-scroll";
  };

  // code for adding triangle
  const startAddingTriangle = useCallback((o) => {
    const pointer = canvas.getViewportPoint(o.e);

    const triangle = new Triangle({
      left: pointer.x,
      top: pointer.y,
      width: 1,
      height: 1,
      fill: triangleFill,
      selectable: false,
    });

    triangleRef.current = triangle;
    canvas.add(triangle);
    canvas.requestRenderAll();
  }, []);

  const startDrawingTriangle = useCallback((o) => {
    if (triangleRef.current) {
      const pointer = canvas.getViewportPoint(o.e);
      const width = pointer.x - triangleRef.current.left;
      const height = pointer.y - triangleRef.current.top;

      triangleRef.current.set({
        width: Math.round(Math.abs(width)),
        height: Math.round(Math.abs(height)),
      });

      canvas.renderAll();
    }
  }, []);

  const stopDrawingTriangle = useCallback(() => {
    triangleRef.current?.setCoords();
    triangleRef.current = null;

    addLog({
      section: "shape",
      tab: "shape",
      event: "creation",
      message: `created shape triangle`,
      objType: "triangle",
    });
  }, []);

  const activateAddingTriangle = () => {
    canvas.on("mouse:down", startAddingTriangle);
    canvas.on("mouse:move", startDrawingTriangle);
    canvas.on("mouse:up", stopDrawingTriangle);
    canvas.hoverCursor = "auto";
    canvas.selection = false;

    canvas.getObjects().forEach((obj) => {
      obj.set({
        selectable: false,
      });
    });
  };

  const deactivateAddingTriangle = () => {
    canvas.off("mouse:down", startAddingTriangle);
    canvas.off("mouse:move", startDrawingTriangle);
    canvas.off("mouse:up", stopDrawingTriangle);
    canvas.selection = true;

    canvas.getObjects().forEach((obj) => {
      if (obj.type !== "image") {
        obj.set({
          selectable: true,
        });
      }
    });

    canvas.hoverCursor = "all-scroll";
  };

  return (
    <div className="flex flex-col items-center justify-center w-full gap-4">
      <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription>Shape</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <IconComponent
                icon={<IconCircle />}
                iconName="Circle"
                handleClick={() => {
                  if (shapeType !== "circle") {
                    deactivateAddingLine();
                    deactivateAddingRect();
                    deactivateAddingTriangle();
                    activateAddingCircle();
                    setShapeType("circle");
                  } else {
                    deactivateAddingCircle();
                    setShapeType("");
                  }
                }}
                extraStyles={`${shapeType === "circle" ? "bg-slate-200" : ""}`}
              />
              <IconComponent
                icon={<Square />}
                iconName="Rect"
                handleClick={() => {
                  if (shapeType !== "rect") {
                    deactivateAddingLine();
                    deactivateAddingCircle();
                    deactivateAddingTriangle();
                    activateAddingRect();
                    setShapeType("rect");
                  } else {
                    deactivateAddingRect();
                    setShapeType("");
                  }
                }}
                extraStyles={`${shapeType === "rect" ? "bg-slate-200" : ""}`}
              />
              <IconComponent
                icon={<IconTriangle />}
                iconName="Triangle"
                handleClick={() => {
                  if (shapeType !== "triangle") {
                    deactivateAddingLine();
                    deactivateAddingRect();
                    deactivateAddingCircle();
                    activateAddingTriangle();
                    setShapeType("triangle");
                  } else {
                    deactivateAddingTriangle();
                    setShapeType("");
                  }
                }}
                extraStyles={`${
                  shapeType === "triangle" ? "bg-slate-200" : ""
                }`}
              />

              <IconComponent
                icon={<Minus />}
                iconName="Line"
                handleClick={() => {
                  if (shapeType !== "line") {
                    deactivateAddingCircle();
                    deactivateAddingRect();
                    deactivateAddingTriangle();
                    activateAddingLine();
                    setShapeType("line");
                  } else {
                    deactivateAddingLine();
                    setShapeType("");
                  }
                }}
                extraStyles={`${shapeType === "line" ? "bg-slate-200" : ""}`}
              />

              <IconComponent
                icon={<Brush />}
                iconName="Brush"
                handleClick={() => {
                  if (shapeType !== "brush") {
                    deactivateAddingCircle();
                    deactivateAddingRect();
                    deactivateAddingTriangle();
                    deactivateAddingLine();
                    setShapeType("brush");
                  } else {
                    setShapeType("");
                    canvas.isDrawingMode = false;
                  }
                }}
                extraStyles={`${shapeType === "brush" ? "bg-slate-200" : ""}`}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      {selectedObject &&
      (selectedObject.type === "circle" ||
        selectedObject.type === "line" ||
        selectedObject.type === "triangle" ||
        selectedObject.type === "rect") ? (
        <Card className="w-[90%]">
          <CardHeader>
            <CardDescription>Shape Properties</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {selectedObject.type !== "line" && (
              <div className="flex flex-col gap-2">
                <label className="text-sm text-slate-400">Fill Color</label>

                <Input
                  type="color"
                  value={
                    selectedObject.type === "rect"
                      ? rectFill
                      : selectedObject.type === "circle"
                      ? circleFill
                      : selectedObject.type === "triangle"
                      ? triangleFill
                      : "#000000"
                  }
                  onChange={(e) => {
                    if (selectedObject.type === "rect") {
                      addLog({
                        section: "shape",
                        tab: "shape",
                        event: "update",
                        message: `rect fill color Changed from ${rectFill} to ${e.target.value}`,
                        param: "fillColor",
                        objType: "rect",
                      });

                      setRectFill(e.target.value);
                    } else if (selectedObject.type === "circle") {
                      addLog({
                        section: "shape",
                        tab: "shape",
                        event: "update",
                        message: `circle fill color Changed from ${circleFill} to ${e.target.value}`,
                        param: "fillColor",
                        objType: "cirle",
                      });

                      setCircleFill(e.target.value);
                    } else if (selectedObject.type === "triangle") {
                      addLog({
                        section: "shape",
                        tab: "shape",
                        event: "update",
                        message: `triangle fill color Changed from ${triangleFill} to ${e.target.value}`,
                        param: "fillColor",
                        objType: "triangle",
                      });
                      setTriangleFill(e.target.value);
                    }

                    updateShapeProperties();
                  }}
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-400">Stroke Color</label>
              <Input
                type="color"
                value={
                  selectedObject.type === "rect"
                    ? rectStroke
                    : selectedObject.type === "circle"
                    ? circleStroke
                    : selectedObject.type === "triangle"
                    ? triangleStroke
                    : lineStroke
                }
                onChange={(e) => {
                  if (selectedObject.type === "rect") {
                    addLog({
                      section: "shape",
                      tab: "shape",
                      event: "update",
                      message: `rect stroke color Changed from ${rectStroke} to ${e.target.value}`,
                      param: "stroke",
                      objType: "rect",
                    });
                    setRectStroke(e.target.value);
                  } else if (selectedObject.type === "circle") {
                    addLog({
                      section: "shape",
                      tab: "shape",
                      event: "update",
                      message: `circle stroke color Changed from ${circleStroke} to ${e.target.value}`,
                      param: "stroke",
                      objType: "circle",
                    });
                    setCircleStroke(e.target.value);
                  } else if (selectedObject.type === "triangle") {
                    addLog({
                      section: "shape",
                      tab: "shape",
                      event: "update",
                      message: `triangle stroke color Changed from ${triangleStroke} to ${e.target.value}`,
                      param: "stroke",
                      objType: "triangle",
                    });
                    setTriangleStroke(e.target.value);
                  } else if (selectedObject.type === "line") {
                    addLog({
                      section: "shape",
                      tab: "shape",
                      event: "update",
                      message: `line stroke color Changed from ${lineStroke} to ${e.target.value}`,
                      param: "stroke",
                      objType: "line",
                    });
                    setTriangleStroke(e.target.value);
                    setLineStroke(e.target.value);
                  }

                  updateShapeProperties();
                }}
              />
            </div>

            {selectedObject.type === "line" ? (
              <CustomSlider
                sliderName="Stroke Width"
                min={1}
                max={20}
                defaultValue={lineStrokeWidth}
                sliderValue={lineStrokeWidth}
                setSliderValue={(value) => {
                  setLineStrokeWidth(value);
                  updateShapeProperties();
                }}
                logName="Line Stroke width"
                section={"shape"}
                tab={"shape"}
              />
            ) : selectedObject.type === "circle" ? (
              <CustomSlider
                sliderName="Radius"
                min={10}
                max={200}
                defaultValue={circleRadius}
                sliderValue={circleRadius}
                setSliderValue={(value) => {
                  setCircleRadius(value);
                  updateShapeProperties();
                }}
                logName="circle radius"
                section={"shape"}
                tab={"shape"}
              />
            ) : (
              <>
                <CustomSlider
                  sliderName="Width"
                  min={10}
                  max={500}
                  defaultValue={
                    selectedObject.type === "rect"
                      ? rectWidth
                      : selectedObject.type === "triangle"
                      ? triangleWidth
                      : 100
                  }
                  sliderValue={
                    selectedObject.type === "rect"
                      ? rectWidth
                      : selectedObject.type === "triangle"
                      ? triangleWidth
                      : 100
                  }
                  setSliderValue={(value) => {
                    if (selectedObject.type === "rect") setRectWidth(value);
                    else if (selectedObject.type === "triangle")
                      setTriangleWidth(value);
                    updateShapeProperties();
                  }}
                  logName={selectedObject.type + "width"}
                  section={"shape"}
                  tab={"shape"}
                />
                <CustomSlider
                  sliderName="Height"
                  min={10}
                  max={500}
                  defaultValue={
                    selectedObject.type === "rect"
                      ? rectHeight
                      : selectedObject.type === "triangle"
                      ? triangleHeight
                      : 60
                  }
                  sliderValue={
                    selectedObject.type === "rect"
                      ? rectHeight
                      : selectedObject.type === "triangle"
                      ? triangleHeight
                      : 60
                  }
                  setSliderValue={(value) => {
                    if (selectedObject.type === "rect") setRectHeight(value);
                    else if (selectedObject.type === "triangle")
                      setTriangleHeight(value);
                    updateShapeProperties();
                  }}
                  logName={selectedObject.type + "height"}
                  section={"shape"}
                  tab={"shape"}
                />
              </>
            )}

            <CustomSlider
              sliderName="Opacity"
              min={0}
              max={1}
              step={0.01}
              defaultValue={
                selectedObject.type === "rect"
                  ? rectOpacity
                  : selectedObject.type === "circle"
                  ? circleOpacity
                  : selectedObject.type === "triangle"
                  ? triangleOpacity
                  : lineOpacity
              }
              sliderValue={
                selectedObject.type === "rect"
                  ? rectOpacity
                  : selectedObject.type === "circle"
                  ? circleOpacity
                  : selectedObject.type === "triangle"
                  ? triangleOpacity
                  : lineOpacity
              }
              setSliderValue={(value) => {
                if (selectedObject.type === "rect") setRectOpacity(value);
                else if (selectedObject.type === "circle")
                  setCircleOpacity(value);
                else if (selectedObject.type === "triangle")
                  setTriangleOpacity(value);
                else if (selectedObject.type === "line") setLineOpacity(value);
                updateShapeProperties();
              }}
              logName={selectedObject.type + "opacity"}
              section={"shape"}
              tab={"shape"}
            />
          </CardContent>
        </Card>
      ) : null}

      {shapeType === "brush" && <Draw canvas={canvas} />}
    </div>
  );
};

export default AddShape;
