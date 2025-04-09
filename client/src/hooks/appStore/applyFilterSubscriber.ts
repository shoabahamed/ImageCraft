import { Canvas, FabricImage, filters } from "fabric";
import { RBrightness } from "@/utils/RedBrightnessFilter";
import { useAdjustStore } from "./AdjustStore";

export const subscribeToAdjustStore = (canvas: Canvas, image: FabricImage, currentFiltersRef: React.RefObject<object[]>, setCurrentFilters: (value: object[]) => void) => {
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
        enableGrayScale,
        enableSepia,
        enableVintage,
        enableKodachrome,
        enableTechnicolor,
      } = state;

      let filtersList = [...(currentFiltersRef.current || [])];
      console.log("old", filtersList)
      const updateOrInsert = (type: string, instance: any, shouldApply: boolean) => {
        const index = filtersList.findIndex((f) => f.type === type);
        if (shouldApply) {
          if (index !== -1) {
            // Update existing
            filtersList[index] = instance;
          } else {
            // Add new
            filtersList.push(instance);
          }
        } else if (index !== -1) {
          // Remove disabled
          filtersList.splice(index, 1);
        }
      };

      console.log('sdjf')
      updateOrInsert("Grayscale", new filters.Grayscale(), enableGrayScale);
      updateOrInsert("Sepia", new filters.Sepia(), enableSepia);
      updateOrInsert("Vintage", new filters.Vintage(), enableVintage);
      updateOrInsert("Kodachrome", new filters.Kodachrome(), enableKodachrome);
      updateOrInsert("Technicolor", new filters.Technicolor(), enableTechnicolor);
      updateOrInsert("RBrightness", new RBrightness({ RBrightness: redBrightnessValue }), redBrightnessValue !== 0);
      updateOrInsert("Brightness", new filters.Brightness({ brightness: brightnessValue }), brightnessValue !== 0);
      updateOrInsert("Contrast", new filters.Contrast({ contrast: contrastValue }), contrastValue !== 0);
      updateOrInsert("Saturation", new filters.Saturation({ saturation: saturationValue }), saturationValue !== 0);
      updateOrInsert("Vibrance", new filters.Vibrance({ vibrance: vibranceValue }), vibranceValue !== 0);
      updateOrInsert("Blur", new filters.Blur({ blur: blurValue }), blurValue !== 0);
      updateOrInsert("HueRotation", new filters.HueRotation({ rotation: hueValue }), hueValue !== 0);
      updateOrInsert("Noise", new filters.Noise({ noise: noiseValue }), noiseValue !== 0);
      updateOrInsert("Pixelate", new filters.Pixelate({ blocksize: pixelateValue }), pixelateValue !== 0);

     
      image.set("opacity", opacityValue);
    
      console.log("new", filtersList)
      image.filters = filtersList;
      image.applyFilters();
      canvas.renderAll();
      

      setCurrentFilters(filtersList);
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
