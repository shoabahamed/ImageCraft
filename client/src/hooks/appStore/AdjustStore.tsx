import { create } from "zustand";

export type RGBThreshold = {
  threshold: number;
  below: number;
  above: number;
};

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
  sharpenValue: number;
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
  setSharpenValue: (value: number) => void;
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

  red: RGBThreshold;
  green: RGBThreshold;
  blue: RGBThreshold;
  enableRedThresholding: boolean;
  enableBlueThresholding: boolean;
  enableGreenThresholding: boolean;
  setRed: (value: RGBThreshold) => void;
  setGreen: (value: RGBThreshold) => void;
  setBlue: (value: RGBThreshold) => void;
  setEnableRedThresholding: (value: boolean) => void;
  setEnableGreenThresholding: (value: boolean) => void;
  setEnableBlueThresholding: (value: boolean) => void;

  enableGaussianBlur: boolean;
  gaussianSigma: number;
  gaussianMatrixSize: number;
  setEnableGaussianBlur: (value: boolean) => void;
  setGaussianSigma: (value: number) => void;
  setGaussianMatrixSize: (value: number) => void;

  enableFocusFilter: boolean;
  setEnableFocusFilter: (value: boolean) => void;
  radius: number;
  softness: number;
  darkFocus: boolean;
  setRadius: (value: number) => void;
  setSoftness: (value: number) => void;
  setDarkFocus: (value: boolean) => void;

  enableLeftReflect: boolean;
  setEnableLeftReflect: (value: boolean) => void;

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
  sharpenValue: 0.5,

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
  setSharpenValue: (value) => set({ sharpenValue: value }),

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

  red: { threshold: 128, below: 0, above: 255 },
  green: { threshold: 128, below: 0, above: 255 },
  blue: { threshold: 128, below: 0, above: 255 },
  enableBlueThresholding: false,
  enableGreenThresholding: false,
  enableRedThresholding: false,

  setRed: (value) =>
    set((state) => ({
      red: { ...state.red, ...value },
    })),
  setGreen: (value) =>
    set((state) => ({
      green: { ...state.green, ...value },
    })),
  setBlue: (value) =>
    set((state) => ({
      blue: { ...state.blue, ...value },
    })),
  setEnableBlueThresholding: (value) => set({ enableBlueThresholding: value }),
  setEnableGreenThresholding: (value) =>
    set({ enableGreenThresholding: value }),
  setEnableRedThresholding: (value) => set({ enableRedThresholding: value }),

  enableGaussianBlur: false,
  gaussianSigma: 1.0,
  gaussianMatrixSize: 5,
  setEnableGaussianBlur: (value) => set({ enableGaussianBlur: value }),
  setGaussianSigma: (value) => set({ gaussianSigma: value }),
  setGaussianMatrixSize: (value) => set({ gaussianMatrixSize: value }),

  enableFocusFilter: false,
  setEnableFocusFilter: (value) => set({ enableFocusFilter: value }),

  radius: 0.5,
  softness: 0.5,
  darkFocus: true,
  setRadius: (value) => set({ radius: value }),
  setSoftness: (value) => set({ softness: value }),

  setDarkFocus: (value) => set({ darkFocus: value }),

  enableLeftReflect: false,
  setEnableLeftReflect: (value) => set({ enableLeftReflect: value }),

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
      sharpenValue: 0.5,
      enableGrayScale: false,
      enableSepia: false,
      enableVintage: false,
      enableKodachrome: false,
      enableTechnicolor: false,
      enableInvert: false,
      enableSharpen: false,
      enableEdgeDetection: false,
      enableColdFilter: false,
      enableWarmFilter: false,

      enableBlueThresholding: false,
      enableRedThresholding: false,
      enableGreenThresholding: false,
      enableGaussianBlur: false,

      enableFocusFilter: false,
    }),
}));
