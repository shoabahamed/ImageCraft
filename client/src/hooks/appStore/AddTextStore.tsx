import { create } from "zustand";

// Defining types for the store state
interface AddTextStore {
  textValue: string;
  textColorValue: string;
  textFont: string;
  textSize: number;
  textOpacity: number;
  textLineSpacing: number;
  textAlignValue: string;
  isUpper: boolean;
  isItalic: boolean;
  isBold: boolean;
  isUnderLine: boolean;
  charSpacing: number;
  setTextValue: (value: string) => void;
  setTextColorValue: (value: string) => void;
  setTextFont: (value: string) => void;
  setTextSize: (value: number) => void;
  setTextOpacity: (value: number) => void;
  setTextLineSpacing: (value: number) => void;
  setTextAlignValue: (value: string) => void;
  setUpper: (value: boolean) => void;
  setItalic: (value: boolean) => void;
  setBold: (value: boolean) => void;
  setUnderLine: (value: boolean) => void;
  setCharSpacing: (value: number) => void;
}

const useAddTextStore = create<AddTextStore>((set) => ({
  textValue: "",
  textColorValue: "#000000",
  textFont: "arial",
  textSize: 20,
  textOpacity: 1,
  textLineSpacing: 1,
  textAlignValue: "left",
  isUpper: false,
  isItalic: false,
  isBold: false,
  isUnderLine: false,
  charSpacing: 1,
  setTextValue: (value) => set({ textValue: value }),
  setTextColorValue: (value) => set({ textColorValue: value }),
  setTextFont: (value) => set({ textFont: value }),
  setTextSize: (value) => set({ textSize: value }),
  setTextOpacity: (value) => set({ textOpacity: value }),
  setTextLineSpacing: (value) => set({ textLineSpacing: value }),
  setTextAlignValue: (value) => set({ textAlignValue: value }),
  setUpper: (value) => set({ isUpper: value }),
  setItalic: (value) => set({ isItalic: value }),
  setBold: (value) => set({ isBold: value }),
  setUnderLine: (value) => set({ isUnderLine: value }),
  setCharSpacing: (value) => set({ charSpacing: value }),
}));

export default useAddTextStore;
