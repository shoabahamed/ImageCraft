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
  blueBrightnessValue: number;
  greenBrightnessValue: number;
  gammaRed: number;
  gammaBlue: number;
  gammaGreen: number;
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
  setBlueBrightnessValue: (value: number) => void;
  setGreenBrightnessValue: (value: number) => void;
  setGammaRedValue: (value: number) => void;
  setGammaBlueValue: (value: number) => void;
  setGammaGreenValue: (value: number) => void;
  // standalone filters
  enableGrayScale: boolean;
  enableSepia: boolean;
  enableVintage: boolean;
  enableKodachrome: boolean;
  enableTechnicolor: boolean;
  enableSharpen: boolean;
  enableInvert: boolean;
  enableEdgeDetection: boolean;
  enableColdFilter: boolean;
  enableWarmFilter: boolean;

  setEnableGrayScale: (value: boolean) => void;
  setEnableSepia: (value: boolean) => void;
  setEnableVintage: (value: boolean) => void;
  setEnableKodachrome: (value: boolean) => void;
  setEnableTechnicolor: (value: boolean) => void;
  setEnableSharpen: (value: boolean) => void;
  setEnableInvert: (value: boolean) => void;
  setEnableEdgeDetection: (value: boolean) => void;
  setEnableWarmFilter: (value: boolean) => void;
  setEnableColdFilter: (value: boolean) => void;

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
  blueBrightnessValue: 0,
  greenBrightnessValue: 0,
  gammaRed: 1,
  gammaBlue: 1,
  gammaGreen: 1,

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
  setBlueBrightnessValue: (value) => set({ blueBrightnessValue: value }),
  setGreenBrightnessValue: (value) => set({ greenBrightnessValue: value }),
  setGammaBlueValue: (value) => set({ gammaBlue: value }),
  setGammaRedValue: (value) => set({ gammaRed: value }),
  setGammaGreenValue: (value) => set({ gammaGreen: value }),

  enableGrayScale: false,
  enableSepia: false,
  enableVintage: false,
  enableKodachrome: false,
  enableTechnicolor: false,
  enableSharpen: false,
  enableInvert: false,
  enableEdgeDetection: false,
  enableColdFilter: false,
  enableWarmFilter: false,
  setEnableGrayScale: (value) => set({ enableGrayScale: value }),
  setEnableSepia: (value) => set({ enableSepia: value }),
  setEnableVintage: (value) => set({ enableVintage: value }),
  setEnableKodachrome: (value) => set({ enableKodachrome: value }),
  setEnableTechnicolor: (value) => set({ enableTechnicolor: value }),
  setEnableSharpen: (value) => set({ enableSharpen: value }),
  setEnableInvert: (value) => set({ enableInvert: value }),
  setEnableEdgeDetection: (value) => set({ enableEdgeDetection: value }),
  setEnableColdFilter: (value) => set({ enableColdFilter: value }),
  setEnableWarmFilter: (value) => set({ enableWarmFilter: value }),
  resetFilters: () =>
    set({
      brightnessValue: 0,
      redBrightnessValue: 0,
      blueBrightnessValue: 0,
      greenBrightnessValue: 0,
      gammaBlue: 1,
      gammaGreen: 1,
      gammaRed: 1,
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
      enableInvert: false,
      enableSharpen: false,
    }),
}));
