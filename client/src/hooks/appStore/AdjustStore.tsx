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
  redBrightnessValue: number;
  setBrightnessValue: (value: number) => void;
  setContrastValue: (value: number) => void;
  setSaturationValue: (value: number) => void;
  setVibranceValue: (value: number) => void;
  setOpacityValue: (value: number) => void;
  setHueValue: (value: number) => void;
  setBlurValue: (value: number) => void;
  setNoiseValue: (value: number) => void;
  setPixelateValue: (value: number) => void;
  setRedBrightnessValue: (value: number) => void;

  // standalone filters
  enableGrayScale: boolean;
  enableSepia: boolean;
  enableVintage: boolean;
  enableKodachrome: boolean;
  enableTechnicolor: boolean;

  setEnableGrayScale: (value: boolean) => void;
  setEnableSepia: (value: boolean) => void;
  setEnableVintage: (value: boolean) => void;
  setEnableKodachrome: (value: boolean) => void;
  setEnableTechnicolor: (value: boolean) => void;

  resetFilters: () => void;
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
  redBrightnessValue: 0,

  setBrightnessValue: (value) => set({ brightnessValue: value }),
  setContrastValue: (value) => set({ contrastValue: value }),
  setSaturationValue: (value) => set({ saturationValue: value }),
  setVibranceValue: (value) => set({ vibranceValue: value }),
  setOpacityValue: (value) => set({ opacityValue: value }),
  setHueValue: (value) => set({ hueValue: value }),
  setBlurValue: (value) => set({ blurValue: value }),
  setNoiseValue: (value) => set({ noiseValue: value }),
  setPixelateValue: (value) => set({ pixelateValue: value }),
  setRedBrightnessValue: (value) => set({ redBrightnessValue: value }),

  enableGrayScale: false,
  enableSepia: false,
  enableVintage: false,
  enableKodachrome: false,
  enableTechnicolor: false,
  setEnableGrayScale: (value) => set({ enableGrayScale: value }),
  setEnableSepia: (value) => set({ enableSepia: value }),
  setEnableVintage: (value) => set({ enableVintage: value }),
  setEnableKodachrome: (value) => set({ enableKodachrome: value }),
  setEnableTechnicolor: (value) => set({ enableTechnicolor: value }),

  resetFilters: () =>
    set({
      brightnessValue: 0,
      redBrightnessValue: 0,
      contrastValue: 0,
      saturationValue: 0,
      vibranceValue: 0,
      opacityValue: 1,
      hueValue: 0,
      blurValue: 0,
      noiseValue: 0,
      pixelateValue: 0,
      enableGrayScale: false,
      enableSepia: false,
      enableVintage: false,
      enableKodachrome: false,
      enableTechnicolor: false,
    }),
}));
