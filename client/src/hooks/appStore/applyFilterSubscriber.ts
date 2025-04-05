import { Canvas, FabricImage, filters } from "fabric";
import { RBrightness } from "@/utils/RedBrightnessFilter";
import { useAdjustStore } from "./AdjustStore";

export const subscribeToAdjustStore = (canvas: Canvas, image: FabricImage) => {
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
        predefinedFilter
      } = state;

      const currentFilters: filters.BaseFilter[] = [];

      if (predefinedFilter) {
        switch (predefinedFilter) {
          case "grayscale": currentFilters.push(new filters.Grayscale()); break;
          case "sepia": currentFilters.push(new filters.Sepia()); break;
          case "vintage": currentFilters.push(new filters.Vintage()); break;
          case "kodachrome": currentFilters.push(new filters.Kodachrome()); break;
          case "technicolor": currentFilters.push(new filters.Technicolor()); break;
        }
      }

      if (redBrightnessValue !== 0)
        currentFilters.push(new RBrightness({ RBrightness: redBrightnessValue }));
      if (brightnessValue !== 0)
        currentFilters.push(new filters.Brightness({ brightness: brightnessValue }));
      if (contrastValue !== 0)
        currentFilters.push(new filters.Contrast({ contrast: contrastValue }));
      if (saturationValue !== 0)
        currentFilters.push(new filters.Saturation({ saturation: saturationValue }));
      if (vibranceValue !== 0)
        currentFilters.push(new filters.Vibrance({ vibrance: vibranceValue }));
      if (blurValue !== 0)
        currentFilters.push(new filters.Blur({ blur: blurValue }));
      if (hueValue !== 0)
        currentFilters.push(new filters.HueRotation({ rotation: hueValue }));
      if (noiseValue !== 0)
        currentFilters.push(new filters.Noise({ noise: noiseValue }));
      if (pixelateValue !== 0)
        currentFilters.push(new filters.Pixelate({ blocksize: pixelateValue }));

      if (opacityValue !== 1)
        image.set("opacity", opacityValue);

      image.filters = currentFilters;
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
