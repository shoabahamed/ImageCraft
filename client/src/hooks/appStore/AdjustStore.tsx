import { create } from "zustand";

type AdjustStore = {
  brightnessValue: number;
  contrastValue: number;
  saturationValue: number;
  vibranceValue: number;
  opacityValue: number;
  hueValue: number;
  blurValue: number;
  noiseValue: number;
  pixelateValue: number;
  predefinedFilter: string | null;
  setBrightnessValue: (value: number) => void;
  setContrastValue: (value: number) => void;
  setSaturationValue: (value: number) => void;
  setVibranceValue: (value: number) => void;
  setOpacityValue: (value: number) => void;
  setHueValue: (value: number) => void;
  setBlurValue: (value: number) => void;
  setNoiseValue: (value: number) => void;
  setPixelateValue: (value: number) => void;
  setPredefinedFilter: (value: string | null) => void;
};

export const useAdjustStore = create<AdjustStore>((set) => ({
  brightnessValue: 0,
  contrastValue: 0,
  saturationValue: 0,
  vibranceValue: 0,
  opacityValue: 1,
  hueValue: 0,
  blurValue: 0,
  noiseValue: 0,
  pixelateValue: 0,
  predefinedFilter: null,

  setBrightnessValue: (value) => set({ brightnessValue: value }),
  setContrastValue: (value) => set({ contrastValue: value }),
  setSaturationValue: (value) => set({ saturationValue: value }),
  setVibranceValue: (value) => set({ vibranceValue: value }),
  setOpacityValue: (value) => set({ opacityValue: value }),
  setHueValue: (value) => set({ hueValue: value }),
  setBlurValue: (value) => set({ blurValue: value }),
  setNoiseValue: (value) => set({ noiseValue: value }),
  setPixelateValue: (value) => set({ pixelateValue: value }),
  setPredefinedFilter: (value) => set({ predefinedFilter: value }),
}));
