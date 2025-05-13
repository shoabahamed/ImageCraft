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
  // Shadow properties
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
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
  // Shadow setters
  setShadowEnabled: (value: boolean) => void;
  setShadowColor: (value: string) => void;
  setShadowBlur: (value: number) => void;
  setShadowOffsetX: (value: number) => void;
  setShadowOffsetY: (value: number) => void;
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
  // Shadow properties
  shadowEnabled: false,
  shadowColor: "rgba(0,0,0,0.3)",
  shadowBlur: 10,
  shadowOffsetX: 5,
  shadowOffsetY: 5,
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
  // Shadow setters
  setShadowEnabled: (value) => set({ shadowEnabled: value }),
  setShadowColor: (value) => set({ shadowColor: value }),
  setShadowBlur: (value) => set({ shadowBlur: value }),
  setShadowOffsetX: (value) => set({ shadowOffsetX: value }),
  setShadowOffsetY: (value) => set({ shadowOffsetY: value }),
}));

export default useAddTextStore;
