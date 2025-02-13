import { create } from "zustand";

type ShapeStore = {
  // Rectangle properties
  rectWidth: number;
  rectHeight: number;
  rectFill: string;
  rectStroke: string;
  rectStrokeWidth: number;
  rectOpacity: number;
  setRectWidth: (value: number) => void;
  setRectHeight: (value: number) => void;
  setRectFill: (value: string) => void;
  setRectStroke: (value: string) => void;
  setRectStrokeWidth: (value: number) => void;
  setRectOpacity: (value: number) => void;

  // Circle properties
  circleRadius: number;
  circleFill: string;
  circleStroke: string;
  circleStrokeWidth: number;
  circleOpacity: number;
  setCircleRadius: (value: number) => void;
  setCircleFill: (value: string) => void;
  setCircleStroke: (value: string) => void;
  setCircleStrokeWidth: (value: number) => void;
  setCircleOpacity: (value: number) => void;

  // Triangle properties
  triangleWidth: number;
  triangleHeight: number;
  triangleFill: string;
  triangleStroke: string;
  triangleStrokeWidth: number;
  triangleOpacity: number;
  setTriangleWidth: (value: number) => void;
  setTriangleHeight: (value: number) => void;
  setTriangleFill: (value: string) => void;
  setTriangleStroke: (value: string) => void;
  setTriangleStrokeWidth: (value: number) => void;
  setTriangleOpacity: (value: number) => void;

  // Line properties
  lineStroke: string;
  lineStrokeWidth: number;
  lineOpacity: number;
  setLineStroke: (value: string) => void;
  setLineStrokeWidth: (value: number) => void;
  setLineOpacity: (value: number) => void;
};

export const useShapeStore = create<ShapeStore>((set) => ({
  // Rectangle
  rectWidth: 100,
  rectHeight: 60,
  rectFill: "#FF0000",
  rectStroke: "#000000",
  rectStrokeWidth: 1,
  rectOpacity: 1,
  setRectWidth: (value) => set({ rectWidth: value }),
  setRectHeight: (value) => set({ rectHeight: value }),
  setRectFill: (value) => set({ rectFill: value }),
  setRectStroke: (value) => set({ rectStroke: value }),
  setRectStrokeWidth: (value) => set({ rectStrokeWidth: value }),
  setRectOpacity: (value) => set({ rectOpacity: value }),

  // Circle
  circleRadius: 50,
  circleFill: "#FF0000",
  circleStroke: "#000000",
  circleStrokeWidth: 1,
  circleOpacity: 1,
  setCircleRadius: (value) => set({ circleRadius: value }),
  setCircleFill: (value) => set({ circleFill: value }),
  setCircleStroke: (value) => set({ circleStroke: value }),
  setCircleStrokeWidth: (value) => set({ circleStrokeWidth: value }),
  setCircleOpacity: (value) => set({ circleOpacity: value }),

  // Triangle
  triangleWidth: 60,
  triangleHeight: 60,
  triangleFill: "#FF0000",
  triangleStroke: "#000000",
  triangleStrokeWidth: 1,
  triangleOpacity: 1,
  setTriangleWidth: (value) => set({ triangleWidth: value }),
  setTriangleHeight: (value) => set({ triangleHeight: value }),
  setTriangleFill: (value) => set({ triangleFill: value }),
  setTriangleStroke: (value) => set({ triangleStroke: value }),
  setTriangleStrokeWidth: (value) => set({ triangleStrokeWidth: value }),
  setTriangleOpacity: (value) => set({ triangleOpacity: value }),

  // Line
  lineStroke: "#FF0000",
  lineStrokeWidth: 3,
  lineOpacity: 1,
  setLineStroke: (value) => set({ lineStroke: value }),
  setLineStrokeWidth: (value) => set({ lineStrokeWidth: value }),
  setLineOpacity: (value) => set({ lineOpacity: value }),
}));
