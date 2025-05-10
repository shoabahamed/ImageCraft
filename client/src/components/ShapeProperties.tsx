import { CircleProperties } from "./CircleProperties";
import { RectProperties } from "./RectProperties";
import { TriangleProperties } from "./TriangleProperties";
import { LineProperties } from "./LineProperties";

import { Canvas } from "fabric";

export const ShapePropertiesSwitcher = ({
  type,
  canvasRef,
}: {
  type: string;
  canvasRef: React.RefObject<Canvas>;
}) => {
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
};
