import { Canvas, FabricImage, filters } from "fabric";
import { RBrightness } from "@/utils/RedBrightnessFilter";
import { useAdjustStore } from "./AdjustStore";
import { BBrightness } from "@/utils/BlueBrightnessFilter";
import { GBrightness } from "@/utils/GreenBrightnessValue";


export const subscribeToAdjustStore = (canvas: Canvas, image: FabricImage, currentFiltersRef: React.RefObject<object[]>, setCurrentFilters: (value: object[]) => void) => {
  return useAdjustStore.subscribe(
    (state) => {
      
  const brightnessValue =  state.brightnessValue
  const contrastValue =  state.contrastValue
  const saturationValue =  state.saturationValue
  const vibranceValue =  state.vibranceValue
  const opacityValue =  state.opacityValue
  const hueValue =  state.hueValue
  const blurValue =  state.blurValue
  const noiseValue =  state.noiseValue
  const pixelateValue =  state.pixelateValue
  const enableGrayScale =  state.enableGrayScale
  const enableVintage =  state.enableVintage
  const enableSepia =  state.enableSepia
  const enableTechnicolor =  state.enableTechnicolor
  const enableKodachrome =  state.enableKodachrome
  const enableSharpen =  state.enableSharpen

  const enableInvert =  state.enableInvert

  const gammaBlue = state.gammaBlue
  const gammaGreen = state.gammaGreen
  const gammaRed = state.gammaRed

  const blueBrightnessValue = state.blueBrightnessValue
  
  const greenBrightnessValue = state.greenBrightnessValue
  

  const redBrightnessValue = state.redBrightnessValue
  

      

      let filtersList = [...(currentFiltersRef.current || [])];
      console.log("old", filtersList)
      const updateOrInsert = (filterName: string, instance: any, shouldApply: boolean) => {
        const index = filtersList.findIndex((f) => f.filterName === filterName);
        if (shouldApply) {
          if (index !== -1) {
            console.log('updating filter', filterName)
            // Update existing
            filtersList[index] = {"instance": instance, "filterName": filterName};
          } else {
            console.log('creating new filter', filterName)
            // Add new
            filtersList.push({"instance": instance, "filterName": filterName});
          }
        } else if (index !== -1) {
          console.log('removing filter', filterName)
          // Remove disabled
          filtersList.splice(index, 1);
        }
      };

      updateOrInsert("grayscale", new filters.Grayscale(), enableGrayScale);
      updateOrInsert("sepia", new filters.Sepia(), enableSepia);
      updateOrInsert("vintage", new filters.Vintage(), enableVintage);
      updateOrInsert("kodachrome", new filters.Kodachrome(), enableKodachrome);
      updateOrInsert("technicolor", new filters.Technicolor(), enableTechnicolor);
      updateOrInsert("sharpen", new filters.Convolute({matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0], opaque: false}), enableSharpen)

      updateOrInsert("invert", new filters.Invert({alpha: false}), enableInvert)


      updateOrInsert("rbrightness", new RBrightness({ RBrightness: redBrightnessValue }), redBrightnessValue !== 0);
      updateOrInsert("bbrightness", new BBrightness({ BBrightness: blueBrightnessValue }), blueBrightnessValue !== 0);
      updateOrInsert("gbrightness", new GBrightness({ GBrightness: greenBrightnessValue }), greenBrightnessValue !== 0);
      updateOrInsert("gamma", new filters.Gamma({gamma: [gammaRed, gammaGreen, gammaBlue]}), gammaBlue!==1 || gammaGreen!==1 || gammaRed !== 1)
      updateOrInsert("contrast", new filters.Contrast({ contrast: contrastValue }), contrastValue !== 0);
      updateOrInsert("saturation", new filters.Saturation({ saturation: saturationValue }), saturationValue !== 0);
      updateOrInsert("vibrance", new filters.Vibrance({ vibrance: vibranceValue }), vibranceValue !== 0);
      updateOrInsert("blur", new filters.Blur({ blur: blurValue }), blurValue !== 0);
      updateOrInsert("hueRotation", new filters.HueRotation({ rotation: hueValue }), hueValue !== 0);
      updateOrInsert("noise", new filters.Noise({ noise: noiseValue }), noiseValue !== 0);
      updateOrInsert("pixelate", new filters.Pixelate({ blocksize: pixelateValue }), pixelateValue !== 0);

   
      image.set("opacity", opacityValue);
    
      console.log("new", filtersList)
      const filterInstances = filtersList.map(tempFilter => tempFilter.instance)
      image.filters = filterInstances;
      image.applyFilters();
      canvas.renderAll();
      

      setCurrentFilters(filtersList);
    },
  );
};
