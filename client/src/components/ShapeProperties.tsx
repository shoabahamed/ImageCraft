import { CircleProperties } from "./CircleProperties";
import { RectProperties } from "./RectProperties";
import { TriangleProperties } from "./TriangleProperties";
import { LineProperties } from "./LineProperties";

export const ShapePropertiesSwitcher = ({ type }: { type: string }) => {
  switch (type) {
    case "circle":
      return <CircleProperties />;
    case "rect":
      return <RectProperties />;
    case "triangle":
      return <TriangleProperties />;
    case "line":
      return <LineProperties />;
    default:
      return null;
  }
};
