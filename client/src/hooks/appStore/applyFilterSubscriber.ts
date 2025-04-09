import { Canvas, FabricImage, filters } from "fabric";
import { RBrightness } from "@/utils/RedBrightnessFilter";
import { useAdjustStore } from "./AdjustStore";

export const subscribeToAdjustStore = (canvas: Canvas, image: FabricImage, setCurrentFilters: (value: object[]) => void) => {
  return useAdjustStore.subscribe(
    (state) => {
      const {
        redBrightnessValue,
        brightnessValue,
        contrastValue,
        saturationValue,
        vibranceValue,
        opacityValue,
        hueValue,
        blurValue,
        noiseValue,
        pixelateValue,
        predefinedFilter,
      } = state;


      const tempFilters: filters.BaseFilter[] = [];

      if (predefinedFilter) {
        switch (predefinedFilter) {
          case "grayscale": tempFilters.push(new filters.Grayscale()); break;
          case "sepia": tempFilters.push(new filters.Sepia()); break;
          case "vintage": tempFilters.push(new filters.Vintage()); break;
          case "kodachrome": tempFilters.push(new filters.Kodachrome()); break;
          case "technicolor": tempFilters.push(new filters.Technicolor()); break;
        }
      }

      if (redBrightnessValue !== 0)
        tempFilters.push(new RBrightness({ RBrightness: redBrightnessValue }));
      if (brightnessValue !== 0)
        tempFilters.push(new filters.Brightness({ brightness: brightnessValue }));
      if (contrastValue !== 0)
        tempFilters.push(new filters.Contrast({ contrast: contrastValue }));
      if (saturationValue !== 0)
        tempFilters.push(new filters.Saturation({ saturation: saturationValue }));
      if (vibranceValue !== 0)
        tempFilters.push(new filters.Vibrance({ vibrance: vibranceValue }));
      if (blurValue !== 0)
        tempFilters.push(new filters.Blur({ blur: blurValue }));
      if (hueValue !== 0)
        tempFilters.push(new filters.HueRotation({ rotation: hueValue }));
      if (noiseValue !== 0)
        tempFilters.push(new filters.Noise({ noise: noiseValue }));
      if (pixelateValue !== 0)
        tempFilters.push(new filters.Pixelate({ blocksize: pixelateValue }));

      if (opacityValue !== 1)
        image.set("opacity", opacityValue);
      
      setCurrentFilters(tempFilters)
      image.filters = tempFilters;
      image.applyFilters();
      canvas.renderAll();
    },
    (state) => [
      state.predefinedFilter,
      state.brightnessValue,
      state.contrastValue,
      state.saturationValue,
      state.vibranceValue,
      state.blurValue,
      state.hueValue,
      state.noiseValue,
      state.pixelateValue,
      state.redBrightnessValue,
      state.opacityValue
    ]
  );
};
