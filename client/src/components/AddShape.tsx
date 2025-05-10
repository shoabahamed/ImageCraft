import { useCallback, useEffect, useRef, useState } from "react";

import { Canvas, Rect, Circle, Triangle, Line } from "fabric";
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
  Triangle as IconTriangle,
  Circle as IconCircle,
  Minus,
  Brush,
} from "lucide-react";
import { useShapeStore } from "@/hooks/appStore/ShapeStore";
import Draw from "./Draw";
import { ShapePropertiesSwitcher } from "./ShapeProperties";

type Props = {
  canvasRef: React.RefObject<Canvas>;
};

const AddShape = ({ canvasRef }: Props) => {
  const { selectedObject, setSelectedObject, disableSavingIntoStackRef } =
    useCanvasObjects();
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
    if (!canvasRef.current) return;

    return () => {
      deactivateAddingLine();
      deactivateAddingRect();
      deactivateAddingTriangle();
      deactivateAddingCircle();
      setShapeType("");
    };
  }, [canvasRef]);

  // code for adding circle
  const startAddingRect = useCallback((o) => {
    const pointer = canvasRef.current.getScenePoint(o.e);

    const rect = new Rect({
      left: pointer.x,
      top: pointer.y,
      width: 1,
      height: 1,
      fill: rectFill,
      selectable: false,
    });
    disableSavingIntoStackRef.current = true;
    rectRef.current = rect;
    canvasRef.current.add(rect);
    canvasRef.current.requestRenderAll();
  }, []);

  const startDrawingRect = useCallback((o) => {
    if (rectRef.current) {
      const pointer = canvasRef.current.getScenePoint(o.e);
      const width = pointer.x - rectRef.current.left;
      const height = pointer.y - rectRef.current.top;

      disableSavingIntoStackRef.current = true;

      rectRef.current.set({
        width: Math.round(Math.abs(width)),
        height: Math.round(Math.abs(height)),
      });

      canvasRef.current.renderAll();
    }
  }, []);

  const stopDrawingRect = useCallback(() => {
    rectRef.current?.setCoords();
    rectRef.current = null;
    disableSavingIntoStackRef.current = false;
    canvasRef.current.fire("object:modified");
    addLog({
      section: "shape",
      tab: "shape",
      event: "creation",
      message: `created shape rect`,
      objType: "rect",
    });
  }, []);

  const activateAddingRect = () => {
    canvasRef.current.on("mouse:down", startAddingRect);
    canvasRef.current.on("mouse:move", startDrawingRect);
    canvasRef.current.on("mouse:up", stopDrawingRect);

    canvasRef.current.selection = false;

    canvasRef.current.getObjects().forEach((obj) => {
      obj.set({
        selectable: false,
        hoverCursor: "crosshair",
      });
    });
  };

  const deactivateAddingRect = () => {
    canvasRef.current.off("mouse:down", startAddingRect);
    canvasRef.current.off("mouse:move", startDrawingRect);
    canvasRef.current.off("mouse:up", stopDrawingRect);
    canvasRef.current.selection = true;

    canvasRef.current.getObjects().forEach((obj) => {
      if (obj.type !== "image") {
        obj.set({
          selectable: true,
          hoverCursor: "default",
        });
      }
      if (obj.type === "image") {
        obj.set({
          hoverCursor: "default",
        });
      }
    });

    canvasRef.current.hoverCursor = "all-scroll";
  };

  // code for adding Line
  const startAddingLine = useCallback((o) => {
    const pointer = canvasRef.current.getScenePoint(o.e);

    const line = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
      strokeWidth: 3,
      stroke: lineStroke,
      selectable: false,
    });
    disableSavingIntoStackRef.current = true;
    lineRef.current = line;
    canvasRef.current.add(line);
    canvasRef.current.requestRenderAll();
  }, []);

  const startDrawingLine = useCallback((o) => {
    if (lineRef.current) {
      const pointer = canvasRef.current.getScenePoint(o.e);
      disableSavingIntoStackRef.current = true;
      lineRef.current.set({
        x2: pointer.x,
        y2: pointer.y,
      });

      canvasRef.current.renderAll();
    }
  }, []);

  const stopDrawingLine = useCallback(() => {
    lineRef.current?.setCoords();
    lineRef.current = null;
    disableSavingIntoStackRef.current = false;
    canvasRef.current.fire("object:modified");
    addLog({
      section: "shape",
      tab: "shape",
      event: "creation",
      message: `created shape rect`,
      objType: "line",
    });
  }, []);

  const activateAddingLine = () => {
    canvasRef.current.on("mouse:down", startAddingLine);
    canvasRef.current.on("mouse:move", startDrawingLine);
    canvasRef.current.on("mouse:up", stopDrawingLine);
    canvasRef.current.hoverCursor = "auto";
    canvasRef.current.selection = false;

    canvasRef.current.getObjects().forEach((obj) => {
      obj.set({
        selectable: false,
        hoverCursor: "crosshair",
      });
    });
  };

  const deactivateAddingLine = () => {
    canvasRef.current.off("mouse:down", startAddingLine);
    canvasRef.current.off("mouse:move", startDrawingLine);
    canvasRef.current.off("mouse:up", stopDrawingLine);
    canvasRef.current.selection = true;

    canvasRef.current.getObjects().forEach((obj) => {
      if (obj.type !== "image") {
        obj.set({
          selectable: true,
          hoverCursor: "default",
        });
      }
      if (obj.type === "image") {
        obj.set({
          hoverCursor: "default",
        });
      }
    });

    canvasRef.current.hoverCursor = "all-scroll";
  };

  // code for adding circle
  const startAddingCircle = useCallback((o) => {
    const pointer = canvasRef.current.getScenePoint(o.e);

    const circle = new Circle({
      top: pointer.y,
      left: pointer.x,
      fill: circleFill,
      radius: 1,
      originX: "center",
      originY: "center",
      selectable: false,
    });

    disableSavingIntoStackRef.current = true;
    circleRef.current = circle;
    canvasRef.current.add(circle);
    canvasRef.current.requestRenderAll();
  }, []);

  const startDrawingCircle = useCallback((o) => {
    if (circleRef.current) {
      const pointer = canvasRef.current.getScenePoint(o.e);
      const radius = Math.round(Math.abs(pointer.y - circleRef.current.top));

      disableSavingIntoStackRef.current = true;
      circleRef.current.set({
        x2: pointer.x,
        y2: pointer.y,
        radius: radius,
      });

      canvasRef.current.renderAll();
    }
  }, []);

  const stopDrawingCircle = useCallback(() => {
    circleRef.current?.setCoords();
    circleRef.current = null;

    disableSavingIntoStackRef.current = false;
    canvasRef.current.fire("object:modified");
    addLog({
      section: "shape",
      tab: "shape",
      event: "creation",
      message: `created shape circle`,
      objType: "circle",
    });
  }, []);

  const activateAddingCircle = () => {
    canvasRef.current.on("mouse:down", startAddingCircle);
    canvasRef.current.on("mouse:move", startDrawingCircle);
    canvasRef.current.on("mouse:up", stopDrawingCircle);
    canvasRef.current.hoverCursor = "auto";
    canvasRef.current.selection = false;

    canvasRef.current.getObjects().forEach((obj) => {
      obj.set({
        selectable: false,
        hoverCursor: "crosshair",
      });
    });
  };

  const deactivateAddingCircle = () => {
    canvasRef.current.off("mouse:down", startAddingCircle);
    canvasRef.current.off("mouse:move", startDrawingCircle);
    canvasRef.current.off("mouse:up", stopDrawingCircle);
    canvasRef.current.selection = true;

    canvasRef.current.getObjects().forEach((obj) => {
      if (obj.type !== "image") {
        obj.set({
          selectable: true,
          hoverCursor: "default",
        });
      }
      if (obj.type === "image") {
        obj.set({
          hoverCursor: "default",
        });
      }
    });

    canvasRef.current.hoverCursor = "all-scroll";
  };

  // code for adding triangle
  const startAddingTriangle = useCallback((o) => {
    const pointer = canvasRef.current.getScenePoint(o.e);

    const triangle = new Triangle({
      left: pointer.x,
      top: pointer.y,
      width: 1,
      height: 1,
      fill: triangleFill,
      selectable: false,
    });

    disableSavingIntoStackRef.current = true;
    triangleRef.current = triangle;
    canvasRef.current.add(triangle);
    canvasRef.current.requestRenderAll();
  }, []);

  const startDrawingTriangle = useCallback((o) => {
    if (triangleRef.current) {
      const pointer = canvasRef.current.getScenePoint(o.e);
      const width = pointer.x - triangleRef.current.left;
      const height = pointer.y - triangleRef.current.top;

      disableSavingIntoStackRef.current = true;
      triangleRef.current.set({
        width: Math.round(Math.abs(width)),
        height: Math.round(Math.abs(height)),
      });

      canvasRef.current.renderAll();
    }
  }, []);

  const stopDrawingTriangle = useCallback(() => {
    triangleRef.current?.setCoords();
    triangleRef.current = null;

    disableSavingIntoStackRef.current = false;
    canvasRef.current.fire("object:modified");
    addLog({
      section: "shape",
      tab: "shape",
      event: "creation",
      message: `created shape triangle`,
      objType: "triangle",
    });
  }, []);

  const activateAddingTriangle = () => {
    canvasRef.current.on("mouse:down", startAddingTriangle);
    canvasRef.current.on("mouse:move", startDrawingTriangle);
    canvasRef.current.on("mouse:up", stopDrawingTriangle);
    canvasRef.current.hoverCursor = "auto";
    canvasRef.current.selection = false;

    canvasRef.current.getObjects().forEach((obj) => {
      obj.set({
        selectable: false,
        hoverCursor: "crosshair",
      });
    });
  };

  const deactivateAddingTriangle = () => {
    canvasRef.current.off("mouse:down", startAddingTriangle);
    canvasRef.current.off("mouse:move", startDrawingTriangle);
    canvasRef.current.off("mouse:up", stopDrawingTriangle);
    canvasRef.current.selection = true;

    canvasRef.current.getObjects().forEach((obj) => {
      if (obj.type !== "image") {
        obj.set({
          selectable: true,
          hoverCursor: "default",
        });
      }
      if (obj.type === "image") {
        obj.set({
          hoverCursor: "default",
        });
      }
    });

    canvasRef.current.hoverCursor = "all-scroll";
  };

  return (
    <div className="flex flex-col items-center justify-center w-full gap-4">
      <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription>Shape</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-6 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    canvasRef.current.isDrawingMode = false;
                  }
                }}
                extraStyles={`${shapeType === "brush" ? "bg-slate-200" : ""}`}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      {selectedObject &&
      ["circle", "rect", "triangle", "line"].includes(selectedObject.type) ? (
        <Card className="w-[90%]">
          <CardHeader>
            <CardDescription>Shape Properties</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ShapePropertiesSwitcher
              type={selectedObject.type}
              canvasRef={canvasRef}
            />
          </CardContent>
        </Card>
      ) : null}

      {shapeType === "brush" && <Draw canvas={canvasRef.current} />}
    </div>
  );
};

export default AddShape;
