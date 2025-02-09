import { create } from "zustand";

// Defining types for the store state
type DrawStore = {
  brushSize: number;
  brushColor: string;
  brushType: string;
  setBrushSize: (size: number) => void;
  setBrushColor: (color: string) => void;
  setBrushType: (type: string) => void;
};

const useDrawStore = create<DrawStore>((set) => ({
  brushSize: 3,
  brushColor: "#00ff00",
  brushType: "none",
  setBrushSize: (size) => set({ brushSize: size }),
  setBrushColor: (color) => set({ brushColor: color }),
  setBrushType: (type) => set({ brushType: type }),
}));

export default useDrawStore;
