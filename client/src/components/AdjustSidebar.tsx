import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

import { Canvas, FabricImage, filters } from "fabric";
import { useLogContext } from "@/hooks/useLogContext";
import { useAdjustStore } from "@/hooks/appStore/AdjustStore";

import {
  getRotatedBoundingBox,
  throttle,
  updateOrInsert,
} from "@/utils/commonFunctions";
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "./ui/slider";
import { RBrightness } from "@/utils/RedBrightnessFilter";
import { GBrightness } from "@/utils/GreenBrightnessValue";
import { BBrightness } from "@/utils/BlueBrightnessFilter";
import { useRef } from "react";
import DetailFiltersTab from "./DetailsFilterTab";
import PredefinedFilterTab from "./PredefinedFilter";

const COLORS_THROTTLE_MS = 50;

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
  // const currentFilters = useCommonProps((state) => state.currentFilters);
  // const setCurrentFilters = useCommonProps((state) => state.setCurrentFilters);
  const { currentFiltersRef } = useCanvasObjects();

  // states from adjust store

  const redBrightnessValue = useAdjustStore(
    (state) => state.redBrightnessValue
  );

  const contrastValue = useAdjustStore((state) => state.contrastValue);
  const saturationValue = useAdjustStore((state) => state.saturationValue);
  const vibranceValue = useAdjustStore((state) => state.vibranceValue);
  const hueValue = useAdjustStore((state) => state.hueValue);

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

  // Set functions for each value
  const setContrastValue = useAdjustStore((state) => state.setContrastValue);
  const setSaturationValue = useAdjustStore(
    (state) => state.setSaturationValue
  );
  const setRedBrightnessValue = useAdjustStore(
    (state) => state.setRedBrightnessValue
  );
  const setVibranceValue = useAdjustStore((state) => state.setVibranceValue);
  const setHueValue = useAdjustStore((state) => state.setHueValue);

  const resetFilters = useAdjustStore((state) => state.resetFilters);

  // Throttled handler for redBrightness
  const throttledRedBrightness = useRef(
    throttle((value: number) => {
      handleColorFilters("brightnessRed", value);
    }, COLORS_THROTTLE_MS)
  ).current;

  // Throttled handlers for color sliders
  const throttledGreenBrightness = useRef(
    throttle((value: number) => {
      handleColorFilters("brightnessGreen", value);
    }, COLORS_THROTTLE_MS)
  ).current;
  const throttledBlueBrightness = useRef(
    throttle((value: number) => {
      handleColorFilters("brightnessBlue", value);
    }, COLORS_THROTTLE_MS)
  ).current;
  const throttledGammaRed = useRef(
    throttle((value: number) => {
      handleColorFilters("gammaRed", value);
    }, COLORS_THROTTLE_MS)
  ).current;
  const throttledGammaGreen = useRef(
    throttle((value: number) => {
      handleColorFilters("gammaGreen", value);
    }, COLORS_THROTTLE_MS)
  ).current;
  const throttledGammaBlue = useRef(
    throttle((value: number) => {
      handleColorFilters("gammaBlue", value);
    }, COLORS_THROTTLE_MS)
  ).current;
  const throttledContrast = useRef(
    throttle((value: number) => {
      handleColorFilters("contrast", value);
    }, COLORS_THROTTLE_MS)
  ).current;
  const throttledSaturation = useRef(
    throttle((value: number) => {
      handleColorFilters("saturation", value);
    }, COLORS_THROTTLE_MS)
  ).current;
  const throttledVibrance = useRef(
    throttle((value: number) => {
      handleColorFilters("vibrance", value);
    }, COLORS_THROTTLE_MS)
  ).current;
  const throttledHue = useRef(
    throttle((value: number) => {
      handleColorFilters("hueRotation", value);
    }, COLORS_THROTTLE_MS)
  ).current;

  const handleColorFilters = (filterName: string, value: number) => {
    const filtersList = [...(currentFiltersRef.current || [])];
    console.log("old filters", filtersList);

    switch (filterName) {
      case "brightnessRed":
        console.log("brightnessRed", value);
        console.time("updateOrInsert-brightnessRed");
        updateOrInsert(
          filtersList,
          "rbrightness",
          new RBrightness({ RBrightness: value }),
          value !== 0
        );
        console.timeEnd("updateOrInsert-brightnessRed");
        setRedBrightnessValue(value);
        break;
      case "brightnessGreen":
        console.time("updateOrInsert-brightnessGreen");
        updateOrInsert(
          filtersList,
          "gbrightness",
          new GBrightness({ GBrightness: value }),
          value !== 0
        );
        console.timeEnd("updateOrInsert-brightnessGreen");
        setGreenBrightnessValue(value);
        break;

      case "brightnessBlue": {
        console.time("BBrightness instance creation");
        const bBrightnessInstance = new BBrightness({ BBrightness: value });
        console.timeEnd("BBrightness instance creation");

        console.time("updateOrInsert-brightnessBlue");
        updateOrInsert(
          filtersList,
          "bbrightness",
          bBrightnessInstance,
          value !== 0
        );

        console.timeEnd("updateOrInsert-brightnessBlue");

        setBlueBrightnessValue(value);
        break;
      }

      case "gammaRed":
        console.time("updateOrInsert-gammaRed");
        updateOrInsert(
          filtersList,
          "gamma",
          new filters.Gamma({ gamma: [value, gammaGreen, gammaBlue] }),
          value !== 1
        );
        console.timeEnd("updateOrInsert-gammaRed");
        setGammaRedValue(value);
        break;

      case "gammaGreen":
        console.time("updateOrInsert-gammaGreen");
        updateOrInsert(
          filtersList,
          "gamma",
          new filters.Gamma({ gamma: [gammaRed, value, gammaBlue] }),
          value !== 1
        );
        console.timeEnd("updateOrInsert-gammaGreen");
        setGammaGreenValue(value);
        break;

      case "gammaBlue":
        console.time("updateOrInsert-gammaBlue");
        updateOrInsert(
          filtersList,
          "gamma",
          new filters.Gamma({ gamma: [gammaRed, gammaGreen, value] }),
          value !== 1
        );
        console.timeEnd("updateOrInsert-gammaBlue");
        setGammaBlueValue(value);
        break;

      case "contrast":
        console.time("updateOrInsert-contrast");
        updateOrInsert(
          filtersList,
          "contrast",
          new filters.Contrast({ contrast: value }),
          value !== 0
        );
        console.timeEnd("updateOrInsert-contrast");
        setContrastValue(value);
        break;

      case "saturation":
        console.time("updateOrInsert-saturation");
        updateOrInsert(
          filtersList,
          "saturation",
          new filters.Saturation({ saturation: value }),
          value !== 0
        );
        console.timeEnd("updateOrInsert-saturation");
        setSaturationValue(value);
        break;

      case "vibrance":
        console.time("updateOrInsert-vibrance");
        updateOrInsert(
          filtersList,
          "vibrance",
          new filters.Vibrance({ vibrance: value }),
          value !== 0
        );
        console.timeEnd("updateOrInsert-vibrance");
        setVibranceValue(value);
        break;

      case "hueRotation":
        console.time("updateOrInsert-hueRotation");
        updateOrInsert(
          filtersList,
          "hueRotation",
          new filters.HueRotation({ rotation: value }),
          value !== 0
        );
        console.timeEnd("updateOrInsert-hueRotation");
        setHueValue(value);
        break;
      default:
        break;
    }

    console.time("applyFilters+render");
    const filterInstances = filtersList.map(
      //@ts-ignore
      (tempFilter) => tempFilter.instance
    );
    imageRef.current.filters = filterInstances;
    imageRef.current.applyFilters();
    canvas.requestRenderAll();
    currentFiltersRef.current = filtersList;
    console.timeEnd("applyFilters+render");
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

    const filtersList = [...(currentFiltersRef.current || [])];

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

    const filtersInCanvas: string[] = currentFiltersRef.current.map(
      //@ts-ignore
      (f) => f.filterName
    );
    allFiltersRef.current = allFiltersRef.current.concat(filtersInCanvas);
    setLoadState(true);

    // Temporarily set visible = false for all objects other than image type
    canvas.getObjects().forEach((obj) => {
      if (obj.type !== "image") {
        obj.visible = false;
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

    // get the bounding rect of the image
    const bounds = getRotatedBoundingBox(image);

    // find the frame Object
    const frameObject = canvas
      .getObjects() // @ts-ignore
      .find((obj) => obj.name?.startsWith("Frame"));

    // if clipPath exist make it null so that we get the correct dataUrl
    if (imageRef.current.clipPath && frameObject) {
      imageRef.current.clipPath = null;
    }

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
        if (
          obj.type !== "image" && // @ts-ignore
          obj?.name?.startsWith("Frame") && // @ts-ignore
          obj?.name?.startsWith("liquifyCircle")
        ) {
          obj.set("visible", true);
        }
      });

      // Restore zoom & transform
      canvas.setViewportTransform(originalViewportTransform);
      canvas.setZoom(originalZoom);
      canvas
        .getObjects() // @ts-ignore
        .find((obj) => obj.setCoords());

      if (frameObject) {
        imageRef.current.clipPath = frameObject;
      }

      canvas.requestRenderAll();
      setTimeout(() => {
        imageRef.current.filters = []; // not sure if it is needed
        currentFiltersRef.current = [];
        imageRef.current.applyFilters();

        disableSavingIntoStackRef.current = false;

        canvas.fire("object:modified");

        setLoadState(false);
      }, 1000);
    });
  };

  const CompareImage = () => {
    imageRef.current.filters = [];
    imageRef.current.applyFilters();

    canvas.requestRenderAll();
  };

  const recoverFilter = () => {
    const filtersList = [...(currentFiltersRef.current || [])];
    const filterInstances = filtersList.map(
      //@ts-ignore
      (tempFilter) => tempFilter.instance
    );

    imageRef.current.filters = filterInstances;
    imageRef.current.applyFilters();

    canvas.requestRenderAll();
  };

  const handleCompareMouseDown = () => {
    CompareImage();
  };

  const handleCompareMouseUp = () => {
    recoverFilter();
  };

  const handleCompareMouseLeave = () => {
    // If mouse leaves the button while pressed, recover the filter
    recoverFilter();
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
        <TabsContent value="presets">
          <PredefinedFilterTab imageRef={imageRef} canvas={canvas} />
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
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-slate-400 text-sm">
                      <p>Brightness Red</p>
                      <p>{redBrightnessValue}</p>
                    </div>

                    <Slider
                      className="cursor-pointer"
                      value={[redBrightnessValue]}
                      min={-1}
                      max={1}
                      step={0.01}
                      onValueChange={(e) => {
                        // setRedBrightnessValue(e[0]);
                        throttledRedBrightness(e[0]);
                      }}
                      onValueCommit={(e) => {
                        const filterName = "brightnessRed";
                        addLog({
                          section: "adjust",
                          tab: "color",
                          event: "update",
                          message: `${filterName} filter value changed to ${e[0]}`,
                        });

                        handleColorFilters(filterName, e[0]);
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
                      className="cursor-pointer"
                      value={[greenBrightnessValue]}
                      min={-1}
                      max={1}
                      step={0.01}
                      onValueChange={(e) => {
                        throttledGreenBrightness(e[0]);
                        // handleColorFilters("brightnessGreen", e[0]);
                      }}
                      onValueCommit={(e) => {
                        const filterName = "brigthnessGreen";
                        addLog({
                          section: "adjust",
                          tab: "color",
                          event: "update",
                          message: `${filterName} filter value changed to ${e[0]}`,
                        });

                        handleColorFilters(filterName, e[0]);
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
                      className="cursor-pointer"
                      value={[blueBrightnessValue]}
                      min={-1}
                      max={1}
                      step={0.01}
                      onValueChange={(e) => {
                        throttledBlueBrightness(e[0]);
                      }}
                      onValueCommit={(e) => {
                        const filterName = "brightnessBlue";
                        addLog({
                          section: "adjust",
                          tab: "color",
                          event: "update",
                          message: `${filterName} filter value changed to ${e[0]}`,
                        });

                        handleColorFilters(filterName, e[0]);
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
                      className="cursor-pointer"
                      value={[gammaRed]}
                      min={0.01}
                      max={2.2}
                      step={0.01}
                      onValueChange={(e) => {
                        throttledGammaRed(e[0]);
                      }}
                      onValueCommit={(e) => {
                        const filterName = "gammaRed";
                        addLog({
                          section: "adjust",
                          tab: "color",
                          event: "update",
                          message: `${filterName} filter value changed to ${e[0]}`,
                        });

                        handleColorFilters(filterName, e[0]);
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
                      className="cursor-pointer"
                      value={[gammaGreen]}
                      min={0.01}
                      max={2.2}
                      step={0.01}
                      onValueChange={(e) => {
                        throttledGammaGreen(e[0]);
                      }}
                      onValueCommit={(e) => {
                        const filterName = "gammaGreen";
                        addLog({
                          section: "adjust",
                          tab: "color",
                          event: "update",
                          message: `${filterName} filter value changed to ${e[0]}`,
                        });

                        handleColorFilters(filterName, e[0]);
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
                      className="cursor-pointer"
                      value={[gammaBlue]}
                      min={0.01}
                      max={2.2}
                      step={0.01}
                      onValueChange={(e) => {
                        throttledGammaBlue(e[0]);
                      }}
                      onValueCommit={(e) => {
                        const filterName = "gammaBlue";
                        addLog({
                          section: "adjust",
                          tab: "color",
                          event: "update",
                          message: `${filterName} filter value changed to ${e[0]}`,
                        });

                        handleColorFilters(filterName, e[0]);
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
                      className="cursor-pointer"
                      value={[contrastValue]}
                      min={-1}
                      max={1}
                      step={0.01}
                      onValueChange={(e) => {
                        throttledContrast(e[0]);
                      }}
                      onValueCommit={(e) => {
                        const filterName = "contrast";
                        addLog({
                          section: "adjust",
                          tab: "color",
                          event: "update",
                          message: `${filterName} filter value changed to ${e[0]}`,
                        });

                        handleColorFilters(filterName, e[0]);
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
                      className="cursor-pointer"
                      value={[saturationValue]}
                      min={-1}
                      max={1}
                      step={0.01}
                      onValueChange={(e) => {
                        throttledSaturation(e[0]);
                      }}
                      onValueCommit={(e) => {
                        const filterName = "saturation";
                        addLog({
                          section: "adjust",
                          tab: "color",
                          event: "update",
                          message: `${filterName} filter value changed to ${e[0]}`,
                        });

                        handleColorFilters(filterName, e[0]);
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
                      className="cursor-pointer"
                      value={[vibranceValue]}
                      min={-1}
                      max={1}
                      step={0.01}
                      onValueChange={(e) => {
                        throttledVibrance(e[0]);
                      }}
                      onValueCommit={(e) => {
                        const filterName = "vibrance";
                        addLog({
                          section: "adjust",
                          tab: "color",
                          event: "update",
                          message: `${filterName} filter value changed to ${e[0]}`,
                        });

                        handleColorFilters(filterName, e[0]);
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
                      className="cursor-pointer"
                      value={[hueValue]}
                      min={-1}
                      max={1}
                      step={0.01}
                      onValueChange={(e) => {
                        throttledHue(e[0]);
                      }}
                      onValueCommit={(e) => {
                        const filterName = "hueRotation";
                        addLog({
                          section: "adjust",
                          tab: "color",
                          event: "update",
                          message: `${filterName} filter value changed to ${e[0]}`,
                        });

                        handleColorFilters(filterName, e[0]);
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
          <DetailFiltersTab imageRef={imageRef} canvas={canvas} />
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
                onMouseDown={handleCompareMouseDown}
                onMouseUp={handleCompareMouseUp}
                onMouseLeave={handleCompareMouseLeave}
              >
                Compare
              </button>
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
