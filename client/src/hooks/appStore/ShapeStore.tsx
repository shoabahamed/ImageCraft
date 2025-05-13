import { create } from "zustand";

type ShapeStore = {
  shapeType: string;
  setShapeType: (value: string) => void;
  showFillColor: boolean;
  setShowFillColor: (value: boolean) => void;
  showStrokeColor: boolean;
  setShowStrokeColor: (value: boolean) => void;

  // Shadow properties
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  setShadowEnabled: (value: boolean) => void;
  setShadowColor: (value: string) => void;
  setShadowBlur: (value: number) => void;
  setShadowOffsetX: (value: number) => void;
  setShadowOffsetY: (value: number) => void;

  // Rectangle properties
  rectWidth: number;
  rectHeight: number;
  rectFill: string;
  rectStroke: string;
  rectStrokeWidth: number;
  rectOpacity: number;
  rectCornerRadius: number;
  rectSkewX: number;
  rectSkewY: number;
  setRectWidth: (value: number) => void;
  setRectHeight: (value: number) => void;
  setRectFill: (value: string) => void;
  setRectStroke: (value: string) => void;
  setRectStrokeWidth: (value: number) => void;
  setRectOpacity: (value: number) => void;
  setRectCornerRadius: (value: number) => void;
  setRectSkewX: (value: number) => void;
  setRectSkewY: (value: number) => void;

  // Circle properties
  circleRadius: number;
  circleFill: string;
  circleStroke: string;
  circleStrokeWidth: number;
  circleOpacity: number;
  circleSkewX: number;
  circleSkewY: number;
  setCircleRadius: (value: number) => void;
  setCircleFill: (value: string) => void;
  setCircleStroke: (value: string) => void;
  setCircleStrokeWidth: (value: number) => void;
  setCircleOpacity: (value: number) => void;
  setCircleSkewX: (value: number) => void;
  setCircleSkewY: (value: number) => void;

  // Triangle properties
  triangleWidth: number;
  triangleHeight: number;
  triangleFill: string;
  triangleStroke: string;
  triangleStrokeWidth: number;
  triangleOpacity: number;
  triangleSkewX: number;
  triangleSkewY: number;
  setTriangleWidth: (value: number) => void;
  setTriangleHeight: (value: number) => void;
  setTriangleFill: (value: string) => void;
  setTriangleStroke: (value: string) => void;
  setTriangleStrokeWidth: (value: number) => void;
  setTriangleOpacity: (value: number) => void;
  setTriangleSkewX: (value: number) => void;
  setTriangleSkewY: (value: number) => void;

  // Line properties
  lineStroke: string;
  lineStrokeWidth: number;
  lineOpacity: number;
  lineSkewX: number;
  lineSkewY: number;
  setLineStroke: (value: string) => void;
  setLineStrokeWidth: (value: number) => void;
  setLineOpacity: (value: number) => void;
  setLineSkewX: (value: number) => void;
  setLineSkewY: (value: number) => void;
};

export const useShapeStore = create<ShapeStore>((set) => ({
  shapeType: "",
  setShapeType: (value: string) => set({ shapeType: value }),

  // Shadow properties
  shadowEnabled: false,
  shadowColor: "rgba(0,0,0,0.3)",
  shadowBlur: 10,
  shadowOffsetX: 5,
  shadowOffsetY: 5,
  setShadowEnabled: (value) => set({ shadowEnabled: value }),
  setShadowColor: (value) => set({ shadowColor: value }),
  setShadowBlur: (value) => set({ shadowBlur: value }),
  setShadowOffsetX: (value) => set({ shadowOffsetX: value }),
  setShadowOffsetY: (value) => set({ shadowOffsetY: value }),

  // Rectangle
  rectWidth: 100,
  rectHeight: 60,
  rectFill: "transparent",
  rectStroke: "#000000",
  rectStrokeWidth: 10,
  rectOpacity: 1,
  rectCornerRadius: 0,
  rectSkewX: 0,
  rectSkewY: 0,
  setRectWidth: (value) => set({ rectWidth: value }),
  setRectHeight: (value) => set({ rectHeight: value }),
  setRectFill: (value) => set({ rectFill: value }),
  setRectStroke: (value) => set({ rectStroke: value }),
  setRectStrokeWidth: (value) => set({ rectStrokeWidth: value }),
  setRectOpacity: (value) => set({ rectOpacity: value }),
  setRectCornerRadius: (value) => set({ rectCornerRadius: value }),
  setRectSkewX: (value) => set({ rectSkewX: value }),
  setRectSkewY: (value) => set({ rectSkewY: value }),

  // Circle
  circleRadius: 50,
  circleFill: "transparent",
  circleStroke: "#000000",
  circleStrokeWidth: 10,
  circleOpacity: 1,
  circleSkewX: 0,
  circleSkewY: 0,
  setCircleRadius: (value) => set({ circleRadius: value }),
  setCircleFill: (value) => set({ circleFill: value }),
  setCircleStroke: (value) => set({ circleStroke: value }),
  setCircleStrokeWidth: (value) => set({ circleStrokeWidth: value }),
  setCircleOpacity: (value) => set({ circleOpacity: value }),
  setCircleSkewX: (value) => set({ circleSkewX: value }),
  setCircleSkewY: (value) => set({ circleSkewY: value }),

  // Triangle
  triangleWidth: 60,
  triangleHeight: 60,
  triangleFill: "transparent",
  triangleStroke: "#000000",
  triangleStrokeWidth: 10,
  triangleOpacity: 1,
  triangleSkewX: 0,
  triangleSkewY: 0,
  setTriangleWidth: (value) => set({ triangleWidth: value }),
  setTriangleHeight: (value) => set({ triangleHeight: value }),
  setTriangleFill: (value) => set({ triangleFill: value }),
  setTriangleStroke: (value) => set({ triangleStroke: value }),
  setTriangleStrokeWidth: (value) => set({ triangleStrokeWidth: value }),
  setTriangleOpacity: (value) => set({ triangleOpacity: value }),
  setTriangleSkewX: (value) => set({ triangleSkewX: value }),
  setTriangleSkewY: (value) => set({ triangleSkewY: value }),

  showFillColor: false,
  setShowFillColor: (value) => set({ showFillColor: value }),
  showStrokeColor: true,
  setShowStrokeColor: (value) => set({ showStrokeColor: value }),

  // Line
  lineStroke: "#000000",
  lineStrokeWidth: 10,
  lineOpacity: 1,
  lineSkewX: 0,
  lineSkewY: 0,
  setLineStroke: (value) => set({ lineStroke: value }),
  setLineStrokeWidth: (value) => set({ lineStrokeWidth: value }),
  setLineOpacity: (value) => set({ lineOpacity: value }),
  setLineSkewX: (value) => set({ lineSkewX: value }),
  setLineSkewY: (value) => set({ lineSkewY: value }),
}));
