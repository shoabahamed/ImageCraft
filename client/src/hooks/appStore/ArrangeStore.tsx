import { create } from "zustand";

type ArrangeStroe = {
  flipX: boolean;
  flipY: boolean;
  imageRotation: number;
  setFlipX: (value: boolean) => void;
  setFlipY: (value: boolean) => void;
  setImageRotation: (value: number) => void;
  backgroundColor: string;
  setBackgroundColor: (value: string) => void;
};

export const useArrangeStore = create<ArrangeStroe>((set) => ({
  flipX: false,
  flipY: false,
  imageRotation: 0,
  setFlipX: (value) => set({ flipX: value }),
  setFlipY: (value) => set({ flipY: value }),
  setImageRotation: (value) => set({ imageRotation: value }),
  backgroundColor: "transparent",
  setBackgroundColor: (value) => set({ backgroundColor: value }),
}));
