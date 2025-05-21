import { CircleProperties } from "./CircleProperties";
import { RectProperties } from "./RectProperties";
import { TriangleProperties } from "./TriangleProperties";
import { LineProperties } from "./LineProperties";

import { Canvas } from "fabric";
import { RectPropertiesAdmin } from "./RectPropertiesAdmin";
import { CirclePropertiesAdmin } from "./CirclePropertiesAdmin";
import { LinePropertiesAdmin } from "./LinePropertiesAdmin";
import { TrianglePropertiesAdmin } from "./TrianglePropertiesAdmin";

export const ShapePropertiesSwitcher = ({
  type,
  canvasRef,
  role = "user",
}: {
  type: string;
  canvasRef: React.RefObject<Canvas>;
  role?: string;
}) => {
  if (role === "admin") {
    switch (type) {
      case "circle":
        return <CirclePropertiesAdmin canvasRef={canvasRef} />;
      case "rect":
        return <RectPropertiesAdmin canvasRef={canvasRef} />;
      case "triangle":
        return <TrianglePropertiesAdmin canvasRef={canvasRef} />;
      case "line":
        return <LinePropertiesAdmin canvasRef={canvasRef} />;
      default:
        return null;
    }
  } else {
    switch (type) {
      case "circle":
        return <CircleProperties canvasRef={canvasRef} />;
      case "rect":
        return <RectProperties canvasRef={canvasRef} />;
      case "triangle":
        return <TriangleProperties canvasRef={canvasRef} />;
      case "line":
        return <LineProperties canvasRef={canvasRef} />;
      default:
        return null;
    }
  }
};
