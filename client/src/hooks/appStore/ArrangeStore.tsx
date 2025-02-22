import { create } from "zustand";

type ArrangeStroe = {
  rotateX: boolean;
  rotateY: boolean;
  setRotateX: (value: boolean) => void;
  setRotateY: (value: boolean) => void;
};

export const useArrangeStore = create<ArrangeStroe>((set) => ({
  rotateX: false,
  rotateY: false,
  setRotateX: (value) => set({ rotateX: value }),
  setRotateY: (value) => set({ rotateY: value }),
}));
