import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

import { Canvas, FabricImage, filters } from "fabric";
import { useLogContext } from "@/hooks/useLogContext";
import { useAdjustStore } from "@/hooks/appStore/AdjustStore";
import { SharpenFilter } from "@/utils/SharpenFilter";

import { getRotatedBoundingBox, updateOrInsert } from "@/utils/commonFunctions";
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";

import { Sparkles, Wand2, Moon, Palette, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCommonProps } from "@/hooks/appStore/CommonProps";
import { ColdFilter } from "@/utils/ColdFilter";
import { SobelFilter } from "@/utils/SobelFilter";
import { WarmFilter } from "@/utils/WarmFilter";
import { FocusFilter } from "@/utils/FocusFilter";
import { Slider } from "./ui/slider";
import { RBrightness } from "@/utils/RedBrightnessFilter";
import { GBrightness } from "@/utils/GreenBrightnessValue";
import { BBrightness } from "@/utils/BlueBrightnessFilter";
import { CustomGrayScale } from "@/utils/CustomGrayScale";
type AdjustSidebarProps = {
  canvas: Canvas;
  image: FabricImage;
  imageRef: React.RefObject<FabricImage>;
  databaseFiltersName: string[] | null;
  databaseFiltersObject: object[] | null;
  setLoadState: (value: boolean) => void;
};

const AdjustSidebar = ({
  canvas,
  image,
  imageRef,
  setLoadState,
}: AdjustSidebarProps) => {
  const { addLog } = useLogContext(); // Use log context
  const { disableSavingIntoStackRef, allFiltersRef } = useCanvasObjects();
  const currentFilters = useCommonProps((state) => state.currentFilters);
  const setCurrentFilters = useCommonProps((state) => state.setCurrentFilters);
  const { currentFiltersRef } = useCanvasObjects();

  // states from adjust store

  const redBrightnessValue = useAdjustStore(
    (state) => state.redBrightnessValue
  );

  const contrastValue = useAdjustStore((state) => state.contrastValue);
  const saturationValue = useAdjustStore((state) => state.saturationValue);
  const vibranceValue = useAdjustStore((state) => state.vibranceValue);
  const opacityValue = useAdjustStore((state) => state.opacityValue);
  const hueValue = useAdjustStore((state) => state.hueValue);
  const blurValue = useAdjustStore((state) => state.blurValue);
  const noiseValue = useAdjustStore((state) => state.noiseValue);
  const pixelateValue = useAdjustStore((state) => state.pixelateValue);
  const enableGrayScale = useAdjustStore((state) => state.enableGrayScale);
  // const enableVintage = useAdjustStore((state) => state.enableVintage);
  const enableSepia = useAdjustStore((state) => state.enableSepia);
  const enableTechnicolor = useAdjustStore((state) => state.enableTechnicolor);
  const enableKodachrome = useAdjustStore((state) => state.enableKodachrome);
  const enableWarmFilter = useAdjustStore((state) => state.enableWarmFilter);
  const enableColdFilter = useAdjustStore((state) => state.enableColdFilter);

  const sharpenValue = useAdjustStore((state) => state.sharpenValue);

  const enableInvert = useAdjustStore((state) => state.enableInvert);

  const blueBrightnessValue = useAdjustStore(
    (state) => state.blueBrightnessValue
  );
  const greenBrightnessValue = useAdjustStore(
    (state) => state.greenBrightnessValue
  );

  const setBlueBrightnessValue = useAdjustStore(
    (state) => state.setBlueBrightnessValue
  );
  const setGreenBrightnessValue = useAdjustStore(
    (state) => state.setGreenBrightnessValue
  );

  const gammaBlue = useAdjustStore((state) => state.gammaBlue);
  const gammaGreen = useAdjustStore((state) => state.gammaGreen);
  const gammaRed = useAdjustStore((state) => state.gammaRed);

  const setGammaBlueValue = useAdjustStore((state) => state.setGammaBlueValue);
  const setGammaGreenValue = useAdjustStore(
    (state) => state.setGammaGreenValue
  );
  const setGammaRedValue = useAdjustStore((state) => state.setGammaRedValue);

  const setEnableGrayScale = useAdjustStore(
    (state) => state.setEnableGrayScale
  );
  const setEnableVintage = useAdjustStore((state) => state.setEnableVintage);
  const setEnableSepia = useAdjustStore((state) => state.setEnableSepia);
  const setEnableTechnicolor = useAdjustStore(
    (state) => state.setEnableTechnicolor
  );
  const setEnableKodachrome = useAdjustStore(
    (state) => state.setEnableKodachrome
  );
  const setEnableSharpen = useAdjustStore((state) => state.setEnableSharpen);
  const setEnableInvert = useAdjustStore((state) => state.setEnableInvert);

  const setEnableEdgeDetection = useAdjustStore(
    (state) => state.setEnableEdgeDetection
  );
  const enableEdgeDetection = useAdjustStore(
    (state) => state.enableEdgeDetection
  );

  const setEnableWarmFilter = useAdjustStore(
    (state) => state.setEnableWarmFilter
  );

  const setEnableColdFilter = useAdjustStore(
    (state) => state.setEnableColdFilter
  );

  // Set functions for each value
  const setContrastValue = useAdjustStore((state) => state.setContrastValue);
  const setSaturationValue = useAdjustStore(
    (state) => state.setSaturationValue
  );
  const setRedBrightnessValue = useAdjustStore(
    (state) => state.setRedBrightnessValue
  );
  const setVibranceValue = useAdjustStore((state) => state.setVibranceValue);
  const setOpacityValue = useAdjustStore((state) => state.setOpacityValue);
  const setHueValue = useAdjustStore((state) => state.setHueValue);
  const setBlurValue = useAdjustStore((state) => state.setBlurValue);
  const setNoiseValue = useAdjustStore((state) => state.setNoiseValue);
  const setPixelateValue = useAdjustStore((state) => state.setPixelateValue);
  const setSharpenValue = useAdjustStore((state) => state.setSharpenValue);

  const resetFilters = useAdjustStore((state) => state.resetFilters);

  // const red = useAdjustStore((state) => state.red);
  // const setRed = useAdjustStore((state) => state.setRed);

  // const green = useAdjustStore((state) => state.green);
  // const setGreen = useAdjustStore((state) => state.setGreen);

  // const blue = useAdjustStore((state) => state.blue);
  // const setBlue = useAdjustStore((state) => state.setBlue);

  // const enableBlueThresholding = useAdjustStore(
  //   (state) => state.enableBlueThresholding
  // );

  // const enableGreenThresholding = useAdjustStore(
  //   (state) => state.enableGreenThresholding
  // );

  // const enableRedThresholding = useAdjustStore(
  //   (state) => state.enableRedThresholding
  // );
  // const setEnableRedThresholding = useAdjustStore(
  //   (state) => state.setEnableRedThresholding
  // );

  // const setEnableGreenThresholding = useAdjustStore(
  //   (state) => state.setEnableGreenThresholding
  // );

  // const setEnableBlueThresholding = useAdjustStore(
  //   (state) => state.setEnableBlueThresholding
  // );

  const enableFocusFilter = useAdjustStore((state) => state.enableFocusFilter);
  const radius = useAdjustStore((state) => state.radius);
  const softness = useAdjustStore((state) => state.softness);

  const darkFocus = useAdjustStore((state) => state.darkFocus);

  const setEnableFocusFilter = useAdjustStore(
    (state) => state.setEnableFocusFilter
  );

  const setRadius = useAdjustStore((state) => state.setRadius);
  const setSoftness = useAdjustStore((state) => state.setSoftness);

  const setDarkFocus = useAdjustStore((state) => state.setDarkFocus);

  const handlePredefinedFilter = (filterName: string, value: boolean) => {
    addLog({
      section: "adjust",
      tab: "filters",
      event: "update",
      message: value
        ? `enabled ${filterName} filter`
        : `disabled ${filterName} scale filter`,
    });

    const filtersList = [...(currentFilters || [])];
    console.log("old filters", filtersList);
    switch (filterName) {
      case "grayscale":
        updateOrInsert(filtersList, "grayscale", new CustomGrayScale(), value);
        setEnableGrayScale(value);
        break;
      case "sepia":
        updateOrInsert(filtersList, "sepia", new filters.Sepia(), value);
        setEnableSepia(value);
        break;

      case "kodachrome":
        updateOrInsert(
          filtersList,
          "kodachrome",
          new filters.Kodachrome(),
          value
        );
        setEnableKodachrome(value);
        break;

      case "technicolor":
        updateOrInsert(
          filtersList,
          "technicolor",
          new filters.Technicolor(),
          value
        );
        setEnableTechnicolor(value);
        break;

      case "invert":
        updateOrInsert(filtersList, "invert", new filters.Invert(), value);
        setEnableInvert(value);
        break;

      case "sobeledge":
        updateOrInsert(filtersList, "sobeledge", new SobelFilter(), value);
        setEnableEdgeDetection(value);
        break;

      case "cold":
        updateOrInsert(filtersList, "cold", new ColdFilter(), value);
        setEnableColdFilter(value);
        break;

      case "warm":
        updateOrInsert(filtersList, "warm", new WarmFilter(), value);
        setEnableWarmFilter(value);
        break;
      default:
        break;
    }

    const filterInstances = filtersList.map(
      //@ts-ignore
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvas.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;

    canvas.fire("object:modified");
  };

  const handleFocusFilterToggle = (value: boolean) => {
    const filterName = "focus";
    addLog({
      section: "adjust",
      tab: "filters",
      event: "update",
      message: value
        ? `enabled ${filterName} filter`
        : `disabled ${filterName} scale filter`,
    });

    const filtersList = [...(currentFilters || [])];
    console.log("old filters", filtersList);

    updateOrInsert(
      filtersList,
      "focusFilter",
      new FocusFilter({
        radius: radius,
        softness: softness,
        dark: darkFocus,
      }),
      value
    );

    setEnableFocusFilter(value);

    const filterInstances = filtersList.map(
      //@ts-ignore
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvas.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;

    canvas.fire("object:modified");
  };

  const handleFocusRadiusChange = (newRadius: number) => {
    const filterName = "focus";
    addLog({
      section: "adjust",
      tab: "filters",
      event: "update",
      message: `${filterName} filter radius changed from ${radius} to ${newRadius}`,
    });

    const filtersList = [...(currentFilters || [])];
    console.log("old filters", filtersList);

    updateOrInsert(
      filtersList,
      "focusFilter",
      new FocusFilter({
        radius: newRadius,
        softness: softness,
        dark: darkFocus,
      }),
      enableFocusFilter
    );

    setRadius(newRadius);

    const filterInstances = filtersList.map(
      //@ts-ignore
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvas.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;
  };

  const handleFocusSoftnessChange = (newSoftness: number) => {
    const filterName = "focus";
    addLog({
      section: "adjust",
      tab: "filters",
      event: "update",
      message: `${filterName} filter softness changed from ${softness} to ${newSoftness}`,
    });

    const filtersList = [...(currentFilters || [])];
    console.log("old filters", filtersList);

    updateOrInsert(
      filtersList,
      "focusFilter",
      new FocusFilter({
        radius: radius,
        softness: newSoftness,
        dark: darkFocus,
      }),
      enableFocusFilter
    );

    setSoftness(newSoftness);

    const filterInstances = filtersList.map(
      //@ts-ignore
      (tempFilter) => tempFilter.instance
    );

    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvas.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;
  };

  const handleFocusReverseToggle = (newDarkFocus: boolean) => {
    const filterName = "focus";
    addLog({
      section: "adjust",
      tab: "filters",
      event: "update",
      message: `${filterName} filter dark focus changed from ${darkFocus} to ${newDarkFocus}`,
    });

    setDarkFocus(newDarkFocus);

    const filtersList = [...(currentFilters || [])];
    console.log("old filters", filtersList);

    updateOrInsert(
      filtersList,
      "focusFilter",
      new FocusFilter({
        radius: radius,
        softness: softness,
        dark: newDarkFocus,
      }),
      enableFocusFilter
    );

    const filterInstances = filtersList.map(
      //@ts-ignore
      (tempFilter) => tempFilter.instance
    );

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvas.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;

    canvas.fire("object:modified");
  };

  const handleColorFilters = (filterName: string, value: number) => {
    addLog({
      section: "adjust",
      tab: "color",
      event: "update",
      message: `${filterName} filter value changed from ${value} to ${value}`,
    });

    const filtersList = [...(currentFilters || [])];
    console.log("old filters", filtersList);

    switch (filterName) {
      case "brightnessRed":
        console.log("brightnessRed", value);
        updateOrInsert(
          filtersList,
          "rbrightness",
          new RBrightness({ RBrightness: value }),
          value !== 0
        );
        setRedBrightnessValue(value);
        break;
      case "brightnessGreen":
        updateOrInsert(
          filtersList,
          "gbrightness",
          new GBrightness({ GBrightness: value }),
          value !== 0
        );
        setGreenBrightnessValue(value);
        break;

      case "brightnessBlue":
        updateOrInsert(
          filtersList,
          "bbrightness",
          new BBrightness({ BBrightness: value }),
          value !== 0
        );
        setBlueBrightnessValue(value);
        break;

      case "gammaRed":
        updateOrInsert(
          filtersList,
          "gamma",
          new filters.Gamma({ gamma: [value, gammaGreen, gammaBlue] }),
          value !== 1
        );
        setGammaRedValue(value);
        break;

      case "gammaGreen":
        updateOrInsert(
          filtersList,
          "gamma",
          new filters.Gamma({ gamma: [gammaRed, value, gammaBlue] }),
          value !== 1
        );
        setGammaGreenValue(value);
        break;

      case "gammaBlue":
        updateOrInsert(
          filtersList,
          "gamma",
          new filters.Gamma({ gamma: [gammaRed, gammaGreen, value] }),
          value !== 1
        );
        setGammaBlueValue(value);
        break;

      case "contrast":
        updateOrInsert(
          filtersList,
          "contrast",
          new filters.Contrast({ contrast: value }),
          value !== 0
        );
        setContrastValue(value);
        break;

      case "saturation":
        updateOrInsert(
          filtersList,
          "saturation",
          new filters.Saturation({ saturation: value }),
          value !== 0
        );
        setSaturationValue(value);
        break;

      case "vibrance":
        updateOrInsert(
          filtersList,
          "vibrance",
          new filters.Vibrance({ vibrance: value }),
          value !== 0
        );
        setVibranceValue(value);
        break;

      case "hueRotation":
        updateOrInsert(
          filtersList,
          "hueRotation",
          new filters.HueRotation({ rotation: value }),
          value !== 0
        );
        setHueValue(value);
        break;
      default:
        break;
    }

    const filterInstances = filtersList.map(
      //@ts-ignore
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();
    canvas.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;
  };

  const handleDetailsFilters = (filterName: string, value: number) => {
    addLog({
      section: "adjust",
      tab: "detail",
      event: "update",
      message: `${filterName} filter value changed from ${value} to ${value}`,
    });

    const filtersList = [...(currentFilters || [])];
    console.log("old filters", filtersList);

    switch (filterName) {
      case "opacity":
        imageRef.current.set("opacity", value);
        setOpacityValue(value);
        break;

      case "blur":
        updateOrInsert(
          filtersList,
          "blur",
          new filters.Blur({ blur: value }),
          value !== 0
        );
        setBlurValue(value);
        break;

      case "noise":
        updateOrInsert(
          filtersList,
          "noise",
          new filters.Noise({ noise: value }),
          value !== 0
        );
        setNoiseValue(value);
        break;

      case "pixelate":
        updateOrInsert(
          filtersList,
          "pixelate",
          new filters.Pixelate({ blocksize: value }),
          value !== 0
        );
        setPixelateValue(value);
        break;

      case "sharpen":
        updateOrInsert(
          filtersList,
          "sharpen",
          new SharpenFilter({ SharpenValue: value }),
          value !== 0.5
        );
        setSharpenValue(value);
        break;

      default:
        break;
    }

    const filterInstances = filtersList.map(
      //@ts-ignore
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;
    imageRef.current.applyFilters();

    canvas.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;
  };

  const handleColorReset = () => {
    addLog({
      section: "adjust",
      tab: "color",
      event: "reset",
      message: `reseted all image color related properties `,
    });

    setRedBrightnessValue(0);
    setBlueBrightnessValue(0);
    setGreenBrightnessValue(0);
    setGammaBlueValue(1);
    setGammaGreenValue(1);
    setGammaRedValue(1);
    setVibranceValue(0);
    setContrastValue(0);
    setSaturationValue(0);
    setHueValue(0);

    const filtersList = [...(currentFilters || [])];

    updateOrInsert(
      filtersList,
      "rbrightness",
      new RBrightness({ RBrightness: 0 }),
      false
    );
    updateOrInsert(
      filtersList,
      "gbrightness",
      new GBrightness({ GBrightness: 0 }),
      false
    );
    updateOrInsert(
      filtersList,
      "bbrightness",
      new BBrightness({ BBrightness: 0 }),
      false
    );
    updateOrInsert(
      filtersList,
      "gamma",
      new filters.Gamma({ gamma: [1, 1, 1] }),
      false
    );
    updateOrInsert(
      filtersList,
      "contrast",
      new filters.Contrast({ contrast: 0 }),
      false
    );
    updateOrInsert(
      filtersList,
      "saturation",
      new filters.Saturation({ saturation: 0 }),
      false
    );
    updateOrInsert(
      filtersList,
      "hueRotation",
      new filters.HueRotation({ rotation: 0 }),
      false
    );
    updateOrInsert(
      filtersList,
      "vibrance",
      new filters.Vibrance({ vibrance: 0 }),
      false
    );

    const filterInstances = filtersList.map(
      //@ts-ignore
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvas.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;

    canvas.fire("object:modified");
  };

  const handleDetailReset = () => {
    addLog({
      section: "adjust",
      tab: "detail",
      event: "reset",
      message: `reseted all image detail properties `,
    });

    setOpacityValue(1);
    setPixelateValue(0);
    setNoiseValue(0);
    setBlurValue(0);
    setSharpenValue(0.5);

    const filtersList = [...(currentFilters || [])];
    updateOrInsert(filtersList, "blur", new filters.Blur({ blur: 0 }), false);
    updateOrInsert(
      filtersList,
      "noise",
      new filters.Noise({ noise: 0 }),
      false
    );
    updateOrInsert(
      filtersList,
      "pixelate",
      new filters.Pixelate({ blocksize: 0 }),
      false
    );
    updateOrInsert(
      filtersList,
      "sharpen",
      new SharpenFilter({ SharpenValue: 0.5 }),
      false
    );

    imageRef.current.set("opacity", 1);

    const filterInstances = filtersList.map(
      //@ts-ignore
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvas.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;

    canvas.fire("object:modified");
  };

  const handlePredefinedFilterReset = () => {
    addLog({
      section: "adjust",
      tab: "filter",
      event: "deletion",
      message: `removed all predefined filters`,
    });

    setEnableGrayScale(false);
    setEnableSepia(false);
    setEnableVintage(false);
    setEnableKodachrome(false);
    setEnableTechnicolor(false);
    setEnableSharpen(false);
    setEnableInvert(false);
    setEnableEdgeDetection(false);
    setEnableColdFilter(false);
    setEnableWarmFilter(false);

    const filtersList = [...(currentFilters || [])];

    updateOrInsert(filtersList, "grayscale", new filters.Grayscale(), false);
    updateOrInsert(filtersList, "sepia", new filters.Sepia(), false);
    updateOrInsert(filtersList, "kodachrome", new filters.Kodachrome(), false);

    updateOrInsert(
      filtersList,
      "technicolor",
      new filters.Technicolor(),
      false
    );

    updateOrInsert(filtersList, "invert", new filters.Invert(), false);

    updateOrInsert(filtersList, "sobeledge", new SobelFilter(), false);

    updateOrInsert(filtersList, "cold", new ColdFilter(), false);

    updateOrInsert(filtersList, "warm", new WarmFilter(), false);

    const filterInstances = filtersList.map(
      //@ts-ignore
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvas.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;

    canvas.fire("object:modified");
  };

  const handleApplyFilter = () => {
    addLog({
      section: "adjust",
      tab: "mode",
      event: "update",
      message: "filters permanently applied",
      param: "filters",
      objType: "image",
    });

    disableSavingIntoStackRef.current = true;
    //@ts-ignore
    const filtersInCanvas: string[] = currentFilters.map((f) => f.filterName);
    allFiltersRef.current = allFiltersRef.current.concat(filtersInCanvas);
    setLoadState(true);

    // Temporarily set visible = false for all objects other than image type
    canvas.getObjects().forEach((obj) => {
      if (obj.type !== "image") {
        obj.set("visible", false);
      }
    });

    const scaleX = image.scaleX;
    const scaleY = image.scaleY;
    const flipX = image.flipX;
    const filpY = image.flipY;
    const angle = image.angle;

    image.angle = 0;
    image.scaleX = 1;
    image.scaleY = 1;
    image.flipX = false;
    image.flipY = false;

    const originalViewportTransform = canvas.viewportTransform;
    const originalZoom = canvas.getZoom();

    // Reset to neutral
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

    canvas.setZoom(1);
    canvas
      .getObjects() // @ts-ignore
      .find((obj) => obj.setCoords());

    // Find the object named "Frame" or starting with "Frame"
    const bounds = getRotatedBoundingBox(image);
    // @ts-ignore
    const dataURL = canvas.toDataURL({
      format: "png",
      left: bounds.left,
      top: bounds.top,
      width: bounds.width,
      height: bounds.height,
    });

    FabricImage.fromURL(dataURL).then((img) => {
      if (!img || !imageRef.current) return;
      resetFilters();
      // Replace the image content

      console.log("djf");
      imageRef.current.setElement(img.getElement());

      imageRef.current.scaleX = scaleX;
      imageRef.current.scaleY = scaleY;

      imageRef.current.flipX = flipX;
      imageRef.current.flipY = filpY;

      imageRef.current.angle = angle;

      imageRef.current.opacity = 1.0;

      // imageRef.current.filters = []

      image = imageRef.current;

      //  set visible = true for all objects other than image type
      canvas.getObjects().forEach((obj) => {
        if (obj.type !== "image") {
          obj.set("visible", true);
        }
      });

      // Restore zoom & transform
      canvas.setViewportTransform(originalViewportTransform);
      canvas.setZoom(originalZoom);
      canvas
        .getObjects() // @ts-ignore
        .find((obj) => obj.setCoords());

      setTimeout(() => {
        imageRef.current.filters = []; // not sure if it is needed
        disableSavingIntoStackRef.current = false;
        setLoadState(false);
        canvas.renderAll();
        canvas.fire("object:modified");
      }, 1000);
    });
  };

  return (
    <div className="max-h-full flex flex-col items-center justify-center w-full gap-4">
      <Tabs
        defaultValue="presets"
        className="w-full flex-1 flex flex-col rounded-none"
      >
        <div className="border-b border-gray-200 dark:border-gray-800">
          <TabsList className="w-full grid grid-cols-3 rounded-none">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
        </div>

        {/* Preset Filters Tab */}
        <TabsContent
          value="presets"
          className="flex-1 flex flex-col justify-center items-center"
        >
          <div className="w-[90%]">
            <Card>
              <CardHeader>
                <CardDescription className="text-center">
                  Predefined Filters
                </CardDescription>
              </CardHeader>
              <CardContent className="w-full flex flex-col gap-2">
                <div className="grid grid-cols-3 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => {
                      handlePredefinedFilter("grayscale", !enableGrayScale);
                    }}
                    className={`
                    flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer
                    ${
                      enableGrayScale
                        ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                        : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                    transition-all
                  `}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${
                        enableGrayScale
                          ? "bg-blue-200 dark:bg-blue-800"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={
                          enableGrayScale
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }
                      >
                        <Moon />
                      </span>
                    </div>
                    <span className="text-sm font-medium">GrayScale</span>
                  </div>

                  <div
                    onClick={() => {
                      handlePredefinedFilter("sepia", !enableSepia);
                    }}
                    className={`
                    flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer
                    ${
                      enableSepia
                        ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                        : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                    transition-all
                  `}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${
                        enableSepia
                          ? "bg-blue-200 dark:bg-blue-800"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={
                          enableSepia
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }
                      >
                        <Palette />
                      </span>
                    </div>
                    <span className="text-sm font-medium">Sepia</span>
                  </div>

                  <div
                    onClick={() => {
                      handlePredefinedFilter("kodachrome", !enableKodachrome);
                    }}
                    className={`
                    flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer
                    ${
                      enableKodachrome
                        ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                        : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                    transition-all
                  `}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${
                        enableKodachrome
                          ? "bg-blue-200 dark:bg-blue-800"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={
                          enableKodachrome
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }
                      >
                        <Wand2 />
                      </span>
                    </div>
                    <span className="text-sm font-medium">Kodachrome</span>
                  </div>

                  <div
                    onClick={() => {
                      handlePredefinedFilter("technicolor", !enableTechnicolor);
                    }}
                    className={`
                    flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer
                    ${
                      enableTechnicolor
                        ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                        : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                    transition-all
                  `}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${
                        enableTechnicolor
                          ? "bg-blue-200 dark:bg-blue-800"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={
                          enableTechnicolor
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }
                      >
                        <Sparkles />
                      </span>
                    </div>
                    <span className="text-sm font-medium">Technicolor</span>
                  </div>

                  <div
                    onClick={() => {
                      handlePredefinedFilter("invert", !enableInvert);
                    }}
                    className={`
                    flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer
                    ${
                      enableInvert
                        ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                        : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                    transition-all
                  `}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${
                        enableInvert
                          ? "bg-blue-200 dark:bg-blue-800"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={
                          enableInvert
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }
                      >
                        <Sparkles />
                      </span>
                    </div>
                    <span className="text-sm font-medium">Invert</span>
                  </div>

                  <div
                    onClick={() => {
                      handlePredefinedFilter("sobeledge", !enableEdgeDetection);
                    }}
                    className={`
                    flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer
                    ${
                      enableEdgeDetection
                        ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                        : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                    transition-all
                  `}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${
                        enableEdgeDetection
                          ? "bg-blue-200 dark:bg-blue-800"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={
                          enableEdgeDetection
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }
                      >
                        <Wand2 />
                      </span>
                    </div>
                    <span className="text-sm font-medium">Sobel</span>
                  </div>

                  <div
                    onClick={() => {
                      handlePredefinedFilter("cold", !enableColdFilter);
                    }}
                    className={`
                    flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer
                    ${
                      enableColdFilter
                        ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                        : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                    transition-all
                  `}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${
                        enableColdFilter
                          ? "bg-blue-200 dark:bg-blue-800"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={
                          enableColdFilter
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }
                      >
                        <Moon />
                      </span>
                    </div>
                    <span className="text-sm font-medium">Cold</span>
                  </div>

                  <div
                    onClick={() => {
                      handlePredefinedFilter("warm", !enableWarmFilter);
                    }}
                    className={`
                    flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer
                    ${
                      enableWarmFilter
                        ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                        : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                    transition-all
                  `}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${
                        enableWarmFilter
                          ? "bg-blue-200 dark:bg-blue-800"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={
                          enableWarmFilter
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }
                      >
                        <Sun />
                      </span>
                    </div>
                    <span className="text-sm font-medium">Warm</span>
                  </div>
                </div>

                <button
                  className="custom-button w-full"
                  onClick={handlePredefinedFilterReset}
                >
                  Reset
                </button>
              </CardContent>
            </Card>
          </div>

          <div className="w-[90%] pt-4">
            <Card className="w-full">
              <CardHeader>
                <CardDescription className="">
                  <div className="flex flex-row justify-between items-center">
                    <span className="text-base font-semibold text-gray-800 dark:text-gray-200">
                      Focus
                    </span>
                    <div className="flex flex-row justify-end items-center">
                      <Switch
                        checked={enableFocusFilter}
                        onCheckedChange={() => {
                          handleFocusFilterToggle(!enableFocusFilter);
                        }}
                      />
                    </div>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-8  border-t pt-4">
                <div className="flex flex-col justify-between items-center mb-3">
                  <div className="w-full flex  justify-between items-center space-x-2">
                    <div className="w-full flex flex-col gap-4 pt-2">
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center text-slate-400 text-sm">
                          <p>Radius</p>
                          <p>{radius}</p>
                        </div>

                        <Slider
                          value={[radius]}
                          min={0}
                          max={1}
                          step={0.01}
                          onValueChange={(e) => {
                            handleFocusRadiusChange(e[0]);
                          }}
                          disabled={!enableFocusFilter}
                        />
                      </div>
                    </div>

                    <div className="w-full flex flex-col gap-4 pt-2">
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center text-slate-400 text-sm">
                          <p>Softness</p>
                          <p>{softness}</p>
                        </div>

                        <Slider
                          value={[softness]}
                          min={0}
                          max={1}
                          step={0.01}
                          onValueChange={(e) => {
                            handleFocusSoftnessChange(e[0]);
                          }}
                          disabled={!enableFocusFilter}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-row justify-between items-center">
                  <span className="text-base font-semibold text-gray-800 dark:text-gray-200">
                    Reverse
                  </span>
                  <div className="flex flex-row justify-end items-center">
                    <Switch
                      checked={darkFocus}
                      onCheckedChange={() => {
                        handleFocusReverseToggle(!darkFocus);
                      }}
                      disabled={!enableFocusFilter}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent
          value="colors"
          className="w-full flex flex-col justify-center items-center"
        >
          <div className="w-[90%]">
            <Card className="w-full">
              <CardHeader>
                <CardDescription className="text-center">
                  Color Adjustments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 w-full">
                  {/* test filters start */}

                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-slate-400 text-sm">
                      <p>Brightness Red</p>
                      <p>{redBrightnessValue}</p>
                    </div>

                    <Slider
                      value={[redBrightnessValue]}
                      min={-1}
                      max={1}
                      step={0.01}
                      onValueChange={(e) => {
                        handleColorFilters("brightnessRed", e[0]);
                      }}
                      onValueCommit={() => {
                        canvas.fire("object:modified");
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-slate-400 text-sm">
                      <p>Brightness Green</p>
                      <p>{greenBrightnessValue}</p>
                    </div>

                    <Slider
                      value={[greenBrightnessValue]}
                      min={-1}
                      max={1}
                      step={0.01}
                      onValueChange={(e) => {
                        handleColorFilters("brightnessGreen", e[0]);
                      }}
                      onValueCommit={() => {
                        canvas.fire("object:modified");
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-slate-400 text-sm">
                      <p>Brightness Blue </p>
                      <p>{blueBrightnessValue}</p>
                    </div>

                    <Slider
                      value={[blueBrightnessValue]}
                      min={-1}
                      max={1}
                      step={0.01}
                      onValueChange={(e) => {
                        handleColorFilters("brightnessBlue", e[0]);
                      }}
                      onValueCommit={() => {
                        canvas.fire("object:modified");
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-slate-400 text-sm">
                      <p>Gamma Red</p>
                      <p>{gammaRed}</p>
                    </div>

                    <Slider
                      value={[gammaRed]}
                      min={0.01}
                      max={2.2}
                      step={0.01}
                      onValueChange={(e) => {
                        handleColorFilters("gammaRed", e[0]);
                      }}
                      onValueCommit={() => {
                        canvas.fire("object:modified");
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-slate-400 text-sm">
                      <p>Gamma Green</p>
                      <p>{gammaGreen}</p>
                    </div>

                    <Slider
                      value={[gammaGreen]}
                      min={0.01}
                      max={2.2}
                      step={0.01}
                      onValueChange={(e) => {
                        handleColorFilters("gammaGreen", e[0]);
                      }}
                      onValueCommit={() => {
                        canvas.fire("object:modified");
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-slate-400 text-sm">
                      <p>Gamma Blue</p>
                      <p>{gammaBlue}</p>
                    </div>

                    <Slider
                      value={[gammaBlue]}
                      min={0.01}
                      max={2.2}
                      step={0.01}
                      onValueChange={(e) => {
                        handleColorFilters("gammaBlue", e[0]);
                      }}
                      onValueCommit={() => {
                        canvas.fire("object:modified");
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-slate-400 text-sm">
                      <p>Contrast</p>
                      <p>{contrastValue}</p>
                    </div>

                    <Slider
                      value={[contrastValue]}
                      min={-1}
                      max={1}
                      step={0.01}
                      onValueChange={(e) => {
                        handleColorFilters("contrast", e[0]);
                      }}
                      onValueCommit={() => {
                        canvas.fire("object:modified");
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-slate-400 text-sm">
                      <p>Saturation</p>
                      <p>{saturationValue}</p>
                    </div>

                    <Slider
                      value={[saturationValue]}
                      min={-1}
                      max={1}
                      step={0.01}
                      onValueChange={(e) => {
                        handleColorFilters("saturation", e[0]);
                      }}
                      onValueCommit={() => {
                        canvas.fire("object:modified");
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-slate-400 text-sm">
                      <p>Vibrance</p>
                      <p>{vibranceValue}</p>
                    </div>

                    <Slider
                      value={[vibranceValue]}
                      min={-1}
                      max={1}
                      step={0.01}
                      onValueChange={(e) => {
                        handleColorFilters("vibrance", e[0]);
                      }}
                      onValueCommit={() => {
                        canvas.fire("object:modified");
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-slate-400 text-sm">
                      <p>Hue</p>
                      <p>{hueValue}</p>
                    </div>

                    <Slider
                      value={[hueValue]}
                      min={-1}
                      max={1}
                      step={0.01}
                      onValueChange={(e) => {
                        handleColorFilters("hueRotation", e[0]);
                      }}
                      onValueCommit={() => {
                        canvas.fire("object:modified");
                      }}
                    />
                  </div>

                  <button className="custom-button" onClick={handleColorReset}>
                    Reset
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Details Tab */}

        <TabsContent
          value="details"
          className="w-full flex flex-col justify-center items-center"
        >
          <div className="w-[90%]">
            <Card className="w-full">
              <CardHeader>
                <CardDescription className="text-center">
                  Detail Adjustments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 w-full">
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-slate-400 text-sm">
                      <p>Opacity</p>
                      <p>{opacityValue}</p>
                    </div>
                    <Slider
                      value={[opacityValue]}
                      min={0}
                      max={1}
                      step={0.01}
                      onValueChange={(e) => {
                        handleDetailsFilters("opacity", e[0]);
                      }}
                      onValueCommit={() => {
                        canvas.fire("object:modified");
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-slate-400 text-sm">
                      <p>Blur</p>
                      <p>{blurValue}</p>
                    </div>
                    <Slider
                      value={[blurValue]}
                      min={0}
                      max={1}
                      step={0.01}
                      onValueChange={(e) => {
                        handleDetailsFilters("blur", e[0]);
                      }}
                      onValueCommit={() => {
                        canvas.fire("object:modified");
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-slate-400 text-sm">
                      <p>Noise</p>
                      <p>{noiseValue}</p>
                    </div>
                    <Slider
                      value={[noiseValue]}
                      min={0}
                      max={100}
                      step={2}
                      onValueChange={(e) => {
                        handleDetailsFilters("noise", e[0]);
                      }}
                      onValueCommit={() => {
                        canvas.fire("object:modified");
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-slate-400 text-sm">
                      <p>Pixelate</p>
                      <p>{pixelateValue}</p>
                    </div>
                    <Slider
                      value={[pixelateValue]}
                      min={0}
                      max={50}
                      step={1}
                      onValueChange={(e) => {
                        handleDetailsFilters("pixelate", e[0]);
                      }}
                      onValueCommit={() => {
                        canvas.fire("object:modified");
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-slate-400 text-sm">
                      <p>Sharpen</p>
                      <p>{sharpenValue}</p>
                    </div>
                    <Slider
                      value={[sharpenValue]}
                      min={0}
                      max={2}
                      step={0.01}
                      onValueChange={(e) => {
                        handleDetailsFilters("sharpen", e[0]);
                      }}
                      onValueCommit={() => {
                        canvas.fire("object:modified");
                      }}
                    />
                  </div>

                  <button className="custom-button" onClick={handleDetailReset}>
                    Reset
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription className="text-center">Mode</CardDescription>
          </CardHeader>

          <CardContent className="w-full">
            <div className="flex flex-col gap-4 w-full">
              <button
                className="custom-button"
                onClick={() => handleApplyFilter()}
              >
                Apply
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdjustSidebar;
