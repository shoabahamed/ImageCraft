import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

import { Canvas, FabricImage, filters, Point, util } from "fabric";
import { useLogContext } from "@/hooks/useLogContext";
import { useAdjustStore } from "@/hooks/appStore/AdjustStore";

import {
  getCanvasDataUrl,
  getRotatedBoundingBox,
  setActiveToolNameRef,
  updateOrInsert,
} from "@/utils/commonFunctions";
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCommonProps } from "@/hooks/appStore/CommonProps";

import { Slider } from "./ui/slider";
import { useRef, useState, useEffect, useCallback } from "react";
import { Swirl } from "@/utils/Swirl";
import { BulgeFilter } from "@/utils/BulgeFilter";
import { CircleDot as BulgeIcon, RotateCw as SwirlIcon } from "lucide-react";
import ReflectFilterTab from "./ReflectFilterTab";
import EdgeFiltersTab from "./EdgeFiltersTab";

interface FilterEntry {
  filterName: string;
  instance: filters.BaseFilter<
    string,
    Record<string, unknown>,
    Record<string, unknown>
  >;
}

type AdjustSidebarProps = {
  canvasRef: React.RefObject<Canvas>;
  imageRef: React.RefObject<FabricImage>;
  databaseFiltersName: string[] | null;
  databaseFiltersObject: object[] | null;
  setLoadState: (value: boolean) => void;
};

const AdjustSidebarAdvanced = ({
  canvasRef,
  imageRef,
  setLoadState,
}: AdjustSidebarProps) => {
  const { addLog } = useLogContext();
  const { disableSavingIntoStackRef, allFiltersRef } = useCanvasObjects();
  const setCurrentFilters = useCommonProps((state) => state.setCurrentFilters);
  const { currentFiltersRef } = useCanvasObjects() as {
    currentFiltersRef: React.MutableRefObject<FilterEntry[] | null>;
  };

  const resetFilters = useAdjustStore((state) => state.resetFilters);

  const {
    swirlAngleRef,
    swirlRadiusRef,
    bulgeRadiusRef,
    bulgeStrengthRef,
    activeToolNameRef,
    downloadImageDimensionsRef,
  } = useCanvasObjects();
  const swirlRadius = useAdjustStore((state) => state.swirlRadius);
  const setSwirlRadius = useAdjustStore((state) => state.setSwirlRadius);
  const swirlAngle = useAdjustStore((state) => state.swirlAngle);
  const setSwirlAngle = useAdjustStore((state) => state.setSwirlAngle);

  const bulgeRadius = useAdjustStore((state) => state.bulgeRadius);
  const setBulgeRadius = useAdjustStore((state) => state.setBulgeRadius);
  const bulgeStrength = useAdjustStore((state) => state.bulgeStrength);
  const setBulgeStrength = useAdjustStore((state) => state.setBulgeStrength);

  const [activateTab, setActivateTab] = useState<string>("reflect");
  const prevTabRef = useRef<string>(activateTab);

  const activateLiquidifyTool = useAdjustStore(
    (state) => state.activateLiquidifyTool
  );
  const setActivateLiquidifyTool = useAdjustStore(
    (state) => state.setActivateLiquidifyTool
  );

  // Add mouse state tracking for continuous updates
  const isMouseDownRef = useRef<boolean>(false);
  const lastSwirlFilterIndexRef = useRef<number>(-1);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      console.log("deactivated liquidify tool from use Effect");
      deactivateSwril(false);
      deactivateBulge(false);
      setActivateLiquidifyTool("");
    };
  }, []);

  // Effect to handle activateLiquidifyTool state changes
  useEffect(() => {
    // Only proceed if we have a valid canvas and image reference
    if (!canvasRef.current || !imageRef.current) return;

    // Then activate the appropriate tool if needed
    if (activeToolNameRef.current === "swirl") {
      setActivateLiquidifyTool("swirl");
      activateSwril();
    } else if (activeToolNameRef.current === "bulge") {
      setActivateLiquidifyTool("bulge");
      activateBulge();
    } else {
      setActivateLiquidifyTool("");
    }
  }, [canvasRef.current]);

  useEffect(() => {
    console.log(prevTabRef.current, activateTab);
    if (prevTabRef.current !== activateTab) {
      // Deactivate liquify tools when switching away from morph tab
      if (prevTabRef.current === "morph") {
        console.log("morph deactivated");
        setActivateLiquidifyTool("");
        deactivateBulge(false);
        deactivateSwril(false);
      }

      // Deactivate liquify tools when switching to edge or hist tabs
      if (activateTab === "edge" || activateTab === "hist") {
        console.log("switching to edge/hist, deactivating liquify tools");
        setActivateLiquidifyTool("");
        deactivateBulge(false);
        deactivateSwril(false);
      }
    }

    prevTabRef.current = activateTab;
  }, [activateTab]);

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
    canvasRef.current.getObjects().forEach((obj) => {
      if (obj.type !== "image") {
        obj.visible = false;
      }
    });

    const scaleX = imageRef.current.scaleX;
    const scaleY = imageRef.current.scaleY;
    const flipX = imageRef.current.flipX;
    const filpY = imageRef.current.flipY;
    const angle = imageRef.current.angle;

    imageRef.current.angle = 0;
    imageRef.current.scaleX = 1;
    imageRef.current.scaleY = 1;
    imageRef.current.flipX = false;
    imageRef.current.flipY = false;

    const originalViewportTransform = canvasRef.current.viewportTransform;
    const originalZoom = canvasRef.current.getZoom();

    // Reset to neutral
    canvasRef.current.setViewportTransform([1, 0, 0, 1, 0, 0]);

    canvasRef.current.setZoom(1);
    canvasRef.current
      .getObjects() // @ts-ignore
      .find((obj) => obj.setCoords());

    // get the bounding rect of the image
    const bounds = getRotatedBoundingBox(imageRef.current);

    // find the frame Object
    const frameObject = canvasRef.current
      .getObjects() // @ts-ignore
      .find((obj) => obj.name?.startsWith("Frame"));

    // if clipPath exist make it null so that we get the correct dataUrl
    if (imageRef.current.clipPath && frameObject) {
      imageRef.current.clipPath = null;
    }

    // @ts-ignore
    const dataURL = canvasRef.current.toDataURL({
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

      //  set visible = true for all objects other than image type
      canvasRef.current.getObjects().forEach((obj) => {
        if (
          obj.type !== "image" && // @ts-ignore
          obj?.name?.startsWith("Frame") && // @ts-ignore
          obj?.name?.startsWith("liquifyCircle")
        ) {
          obj.set("visible", true);
        }
      });

      // Restore zoom & transform
      canvasRef.current.setViewportTransform(originalViewportTransform);
      canvasRef.current.setZoom(originalZoom);
      canvasRef.current
        .getObjects() // @ts-ignore
        .find((obj) => obj.setCoords());

      if (frameObject) {
        imageRef.current.clipPath = frameObject;
      }

      canvasRef.current.requestRenderAll();
      setTimeout(() => {
        imageRef.current.filters = []; // not sure if it is needed
        currentFiltersRef.current = [];
        imageRef.current.applyFilters();

        disableSavingIntoStackRef.current = false;

        canvasRef.current.fire("object:modified");

        setLoadState(false);
      }, 1000);
    });
  };

  const updateLastSwirlFilter = useCallback(() => {
    if (
      !isMouseDownRef.current ||
      lastSwirlFilterIndexRef.current === -1 ||
      !imageRef.current
    )
      return;

    const filtersList = [...(currentFiltersRef.current || [])];
    const index = lastSwirlFilterIndexRef.current;

    if (index >= filtersList.length) return;

    const swirlFilterEntry = filtersList[index];
    if (swirlFilterEntry.filterName !== "swirl") return;

    const composedFilter = swirlFilterEntry.instance as filters.Composed;
    const subFilters = [...composedFilter.subFilters];
    const lastSubFilter = subFilters[subFilters.length - 1] as Swirl;

    // Update strength - increase by 0.1 radians per interval
    lastSubFilter.angle += Math.sign(swirlAngleRef.current) * 0.1;

    // Update filter instance
    filtersList[index] = {
      ...swirlFilterEntry,
      instance: new filters.Composed({ subFilters }),
    };

    // Apply to image
    imageRef.current.filters = filtersList.map((f) => f.instance);
    imageRef.current.applyFilters();
    canvasRef.current?.requestRenderAll();

    // Update state
    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;
    console.log("runnning");
  }, []);

  const handleSwirlCircleArea = useCallback((o) => {
    if (!canvasRef.current || !imageRef.current) return;

    // Find or create the circle
    const liquifyCircle = canvasRef.current
      .getObjects() // @ts-ignore
      .find((obj) => obj?.name === "liquifyCircle");

    if (!liquifyCircle) return;

    const pointer = canvasRef.current.getScenePoint(o.e);
    // const pointer = canvasRef.current.getViewportPoint(o.e);
    // console.log("pointer", pointer, canvasRef.current.getViewportPoint(o.e));
    const imageHeight = imageRef.current.getScaledHeight();
    const imageWidth = imageRef.current.getScaledWidth();
    const minSize = Math.min(imageHeight, imageWidth);
    const imageBounds = imageRef.current.getBoundingRect();

    const radiusPx = Number(swirlRadiusRef.current) * Number(minSize);

    // Check if pointer is inside image bounds
    if (
      pointer.x < imageBounds.left ||
      pointer.x > imageBounds.left + imageBounds.width ||
      pointer.y < imageBounds.top ||
      pointer.y > imageBounds.top + imageBounds.height
    ) {
      liquifyCircle.set({ visible: false });
      canvasRef.current.requestRenderAll();
      return;
    }

    liquifyCircle.set({
      left: pointer.x,
      top: pointer.y,
      radius: radiusPx,
      visible: true,
    });

    canvasRef.current.bringObjectToFront(liquifyCircle);

    canvasRef.current.requestRenderAll();
  }, []);

  const startSwril = useCallback((o) => {
    const pointer = canvasRef.current?.getScenePoint(o.e);
    if (!pointer || !imageRef.current) return;

    const pointer_transformed = util.sendPointToPlane(
      pointer,
      undefined,
      imageRef.current.calcOwnMatrix()
    );

    pointer.x = pointer_transformed.x + imageRef.current.width / 2;
    pointer.y = pointer_transformed.y + imageRef.current.height / 2;

    pointer.x = pointer.x / imageRef.current.width;
    pointer.y = pointer.y / imageRef.current.height;

    if (pointer.x > 1 || pointer.x < 0 || pointer.y > 1 || pointer.y < 0)
      return;

    // Set mouse down state and log
    isMouseDownRef.current = true;
    console.log("Mouse DOWN - Swirl mode activated");

    const filtersList = [...(currentFiltersRef.current || [])];
    console.log("currentFiltersRef.current", currentFiltersRef.current);

    const index = filtersList.findIndex((f) => f.filterName === "swirl");

    if (index !== -1) {
      const swirlFilter = filtersList[index].instance as filters.Composed;
      // Create a new array with the existing subfilters plus the new one
      const newSubFilters = [
        ...swirlFilter.subFilters,
        new Swirl({
          radius: swirlRadiusRef.current,
          angle: swirlAngleRef.current,
          center: { x: pointer.x, y: pointer.y },
        }),
      ];
      // Create a new composed filter with all subfilters
      filtersList[index] = {
        instance: new filters.Composed({
          subFilters: newSubFilters,
        }),
        filterName: "swirl",
      };
    } else {
      filtersList.push({
        instance: new filters.Composed({
          subFilters: [
            new Swirl({
              radius: swirlRadiusRef.current,
              angle: swirlAngleRef.current,
              center: { x: pointer.x, y: pointer.y },
            }),
          ],
        }),
        filterName: "swirl",
      });
    }

    const filterInstances = filtersList.map(
      (tempFilter) => tempFilter.instance
    );

    // Add this after creating the filter:
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }

    intervalIdRef.current = setInterval(updateLastSwirlFilter, 100); // Update every 100ms

    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;
    imageRef.current.applyFilters();
    canvasRef.current?.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;

    // Store the index of the swirl filter for continuous updates
    lastSwirlFilterIndexRef.current = filtersList.findIndex(
      (f) => f.filterName === "swirl"
    );
    console.log("Last swirl filter index:", lastSwirlFilterIndexRef.current);

    addLog({
      section: "adjust",
      tab: "swirl",
      event: "create",
      message: `added new swril`,
    });
  }, []);

  const endSwril = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    isMouseDownRef.current = false;
    lastSwirlFilterIndexRef.current = -1;
    canvasRef.current?.fire("object:modified");
  }, []);

  const activateSwril = () => {
    console.log("Activating swirl - adding event listeners");
    addLog({
      section: "adjust",
      tab: "swirl",
      event: "update",
      message: `Selected swirl filter`,
    });

    setActiveToolNameRef(activeToolNameRef, "swirl");

    canvasRef.current?.on("mouse:down", startSwril);
    canvasRef.current?.on("mouse:up", endSwril);
    canvasRef.current?.on("mouse:move", handleSwirlCircleArea);
  };

  const deactivateSwril = (addToLog: boolean = true) => {
    console.log("Deactivating swirl - removing event listeners");
    if (addToLog) {
      addLog({
        section: "adjust",
        tab: "swirl",
        event: "update",
        message: `Deactivated swirl filter`,
      });
    }

    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    if (canvasRef.current) {
      setActiveToolNameRef(activeToolNameRef, "");
      canvasRef.current.off("mouse:down", startSwril);
      canvasRef.current.off("mouse:up", endSwril);
      canvasRef.current?.off("mouse:move", handleSwirlCircleArea);

      // Reset mouse state
      isMouseDownRef.current = false;
      lastSwirlFilterIndexRef.current = -1;
      console.log("Swirl deactivated - mouse state reset");

      console.log("Event listeners removed");
    }
  };

  const handleBulgeCircleArea = useCallback((o) => {
    if (!canvasRef.current || !imageRef.current) return;

    // Find or create the circle
    const liquifyCircle = canvasRef.current
      .getObjects() // @ts-ignore
      .find((obj) => obj?.name === "liquifyCircle");

    if (!liquifyCircle) return;

    const pointer = canvasRef.current.getScenePoint(o.e);
    const imageHeight = imageRef.current.getScaledHeight();
    const imageWidth = imageRef.current.getScaledWidth();
    const minSize = Math.min(imageHeight, imageWidth);
    const imageBounds = imageRef.current.getBoundingRect();

    const radiusPx = Number(bulgeRadiusRef.current) * Number(minSize);

    // Check if pointer is inside image bounds
    if (
      pointer.x < imageBounds.left ||
      pointer.x > imageBounds.left + imageBounds.width ||
      pointer.y < imageBounds.top ||
      pointer.y > imageBounds.top + imageBounds.height
    ) {
      liquifyCircle.set({ visible: false });
      canvasRef.current.requestRenderAll();
      return;
    }

    liquifyCircle.set({
      left: pointer.x,
      top: pointer.y,
      radius: radiusPx,
      visible: true,
    });

    canvasRef.current.bringObjectToFront(liquifyCircle);

    canvasRef.current.requestRenderAll();
  }, []);

  const activateBulge = () => {
    console.log("started bulghe");
    addLog({
      section: "adjust",
      tab: "bulge",
      event: "update",
      message: `Selected bulge filter`,
    });

    setActiveToolNameRef(activeToolNameRef, "bulge");
    canvasRef.current?.on("mouse:down", startBulge);
    canvasRef.current?.on("mouse:up", endBulge);
    canvasRef.current?.on("mouse:move", handleBulgeCircleArea);
  };

  const deactivateBulge = (addToLog: boolean = true) => {
    console.log("deactivated bulge");
    if (addToLog) {
      addLog({
        section: "adjust",
        tab: "bulge",
        event: "update",
        message: `Deactivated bulge filter`,
      });
    }

    setActiveToolNameRef(activeToolNameRef, "");
    canvasRef.current?.off("mouse:down", startBulge);
    canvasRef.current?.off("mouse:up", endBulge);

    canvasRef.current?.off("mouse:move", handleBulgeCircleArea);
  };

  const startBulge = useCallback((o) => {
    const pointer = canvasRef.current?.getScenePoint(o.e);
    if (!pointer || !imageRef.current) return;

    const pointer_transformed = util.sendPointToPlane(
      pointer,
      undefined,
      imageRef.current.calcOwnMatrix()
    );

    pointer.x = pointer_transformed.x + imageRef.current.width / 2;
    pointer.y = pointer_transformed.y + imageRef.current.height / 2;

    pointer.x = pointer.x / imageRef.current.width;
    pointer.y = pointer.y / imageRef.current.height;

    if (pointer.x > 1 || pointer.x < 0 || pointer.y > 1 || pointer.y < 0)
      return;

    const filtersList = [...(currentFiltersRef.current || [])];

    const index = filtersList.findIndex((f) => f.filterName === "bulge");

    if (index !== -1) {
      const bulgeFilter = filtersList[index].instance as filters.Composed;
      bulgeFilter.subFilters.push(
        new BulgeFilter({
          radius: bulgeRadiusRef.current,
          strength: bulgeStrengthRef.current,
          center: { x: pointer.x, y: pointer.y },
        })
      );
      filtersList[index] = {
        instance: bulgeFilter,
        filterName: `bulge`,
      };
    } else {
      filtersList.push({
        instance: new filters.Composed({
          subFilters: [
            new BulgeFilter({
              radius: bulgeRadiusRef.current,
              strength: bulgeStrengthRef.current,
              center: { x: pointer.x, y: pointer.y },
            }),
          ],
        }),
        filterName: `bulge`,
      });
    }

    const filterInstances = filtersList.map(
      (tempFilter) => tempFilter.instance
    );

    imageRef.current.filters = filterInstances;
    imageRef.current.applyFilters();
    canvasRef.current?.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;

    addLog({
      section: "adjust",
      tab: "bulge",
      event: "create",
      message: `added new bulge`,
    });
  }, []);

  const endBulge = useCallback(() => {
    canvasRef.current?.fire("object:modified");
  }, []);

  const handleBulgeFilterReset = () => {
    const filtersList = [...(currentFiltersRef.current || [])];

    const index = filtersList.findIndex((f) => f.filterName === "bulge");
    if (index !== -1) {
      filtersList.splice(index, 1);
      const filterInstances = filtersList.map(
        (tempFilter) => tempFilter.instance
      );

      imageRef.current.filters = filterInstances;
      imageRef.current.applyFilters();
      canvasRef.current?.requestRenderAll();

      setCurrentFilters(filtersList);
      currentFiltersRef.current = filtersList;
    }

    setBulgeRadius(0.3);
    setBulgeStrength(0.5);
  };

  const handleSwirlFilterReset = () => {
    const filtersList = [...(currentFiltersRef.current || [])];
    const index = filtersList.findIndex((f) => f.filterName === "swirl");
    if (index !== -1) {
      filtersList.splice(index, 1);
    }

    const filterInstances = filtersList.map(
      (tempFilter) => tempFilter.instance
    );

    imageRef.current.filters = filterInstances;
    imageRef.current.applyFilters();
    canvasRef.current?.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;

    setSwirlRadius(0.3);
    setSwirlAngle(1.0);
  };

  const handleBulgeRadiusChange = (value: number) => {
    setBulgeRadius(value);
    bulgeRadiusRef.current = value;
  };

  const handleBulgeStrengthChange = (value: number) => {
    setBulgeStrength(value);
    bulgeStrengthRef.current = value;
  };

  const handleSwirlRadiusChange = (value: number) => {
    setSwirlRadius(value);
    swirlRadiusRef.current = value;
  };
  const handleSwirlStrengthChange = (value: number) => {
    setSwirlAngle(value);
    swirlAngleRef.current = value;
  };

  const CompareImage = () => {
    imageRef.current.filters = [];
    imageRef.current.applyFilters();

    canvasRef.current?.requestRenderAll();
  };

  const recoverFilter = () => {
    const filtersList = [...(currentFiltersRef.current || [])];
    const filterInstances = filtersList.map(
      //@ts-ignore
      (tempFilter) => tempFilter.instance
    );

    imageRef.current.filters = filterInstances;
    imageRef.current.applyFilters();

    canvasRef.current?.requestRenderAll();
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

  const applyHistogram = async () => {
    disableSavingIntoStackRef.current = true;

    const filtersInCanvas: string[] = currentFiltersRef.current.map(
      //@ts-ignore
      (f) => f.filterName
    );
    allFiltersRef.current = allFiltersRef.current
      .concat(filtersInCanvas)
      .concat(["global Hist Equilize"]);
    setLoadState(true);

    // Temporarily set visible = false for all objects other than image type
    canvasRef.current.getObjects().forEach((obj) => {
      if (obj.type !== "image") {
        obj.visible = false;
      }
    });

    const scaleX = imageRef.current.scaleX;
    const scaleY = imageRef.current.scaleY;
    const flipX = imageRef.current.flipX;
    const filpY = imageRef.current.flipY;
    const angle = imageRef.current.angle;

    imageRef.current.angle = 0;
    imageRef.current.scaleX = 1;
    imageRef.current.scaleY = 1;
    imageRef.current.flipX = false;
    imageRef.current.flipY = false;

    const originalViewportTransform = canvasRef.current.viewportTransform;
    const originalZoom = canvasRef.current.getZoom();

    // Reset to neutral
    canvasRef.current.setViewportTransform([1, 0, 0, 1, 0, 0]);

    canvasRef.current.setZoom(1);
    canvasRef.current
      .getObjects() // @ts-ignore
      .find((obj) => obj.setCoords());

    // get the bounding rect of the image
    const bounds = getRotatedBoundingBox(imageRef.current);

    // find the frame Object
    const frameObject = canvasRef.current
      .getObjects() // @ts-ignore
      .find((obj) => obj.name?.startsWith("Frame"));

    // if clipPath exist make it null so that we get the correct dataUrl
    if (imageRef.current.clipPath && frameObject) {
      imageRef.current.clipPath = null;
    }

    // @ts-ignore
    const canvasImageBase64 = canvasRef.current.toDataURL({
      format: "png",
      left: bounds.left,
      top: bounds.top,
      width: bounds.width,
      height: bounds.height,
    });

    // 2. Load image and get pixel data
    const img = new window.Image();
    img.src = canvasImageBase64;

    img.onload = () => {
      // Create a temp canvas
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      const ctx = tempCanvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const data = imageData.data;

      // 3. Convert RGB to YCrCb and save alpha
      const yArr: number[] = [];
      const crArr: number[] = [];
      const cbArr: number[] = [];
      const alphaArr: number[] = [];
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        // RGB to YCrCb
        const y = 0.299 * r + 0.587 * g + 0.114 * b;
        const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
        const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
        yArr.push(y);
        cbArr.push(cb);
        crArr.push(cr);
        alphaArr.push(a);
      }

      // 4. Compute histogram and CDF for Y
      const hist = new Array(256).fill(0);
      for (let i = 0; i < yArr.length; i++) {
        const yValue = Math.max(0, Math.min(255, Math.round(yArr[i])));
        hist[yValue]++;
      }
      const cdf = new Array(256).fill(0);
      cdf[0] = hist[0];
      for (let i = 1; i < 256; i++) {
        cdf[i] = cdf[i - 1] + hist[i];
      }
      const cdfMin = cdf.find((v) => v > 0) || 0;
      const total = cdf[255];
      // Histogram equalization mapping
      const equalizedY = yArr.map((y) => {
        const yValue = Math.max(0, Math.min(255, Math.round(y)));
        return ((cdf[yValue] - cdfMin) * 255) / (total - cdfMin);
      });

      // 5. Convert back from YCrCb to RGBA
      for (let i = 0, j = 0; i < data.length; i += 4, j++) {
        const y = equalizedY[j];
        const cb = cbArr[j];
        const cr = crArr[j];
        // YCrCb to RGB
        let r = y + 1.402 * (cr - 128);
        let g = y - 0.344136 * (cb - 128) - 0.714136 * (cr - 128);
        let b = y + 1.772 * (cb - 128);
        // Clamp
        r = Math.max(0, Math.min(255, Math.round(r)));
        g = Math.max(0, Math.min(255, Math.round(g)));
        b = Math.max(0, Math.min(255, Math.round(b)));
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
        data[i + 3] = alphaArr[j];
      }
      // 6. Put data back and get base64
      ctx.putImageData(imageData, 0, 0);
      const base64Result = tempCanvas.toDataURL("image/png");

      FabricImage.fromURL(base64Result).then((img) => {
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

        //  set visible = true for all objects other than image type
        canvasRef.current.getObjects().forEach((obj) => {
          if (
            obj.type !== "image" && // @ts-ignore
            obj?.name.startsWith("Frame") && // @ts-ignore
            obj?.name.startsWith("liquifyCircle")
          ) {
            obj.set("visible", true);
          }
        });

        // Restore zoom & transform
        canvasRef.current.setViewportTransform(originalViewportTransform);
        canvasRef.current.setZoom(originalZoom);
        canvasRef.current
          .getObjects() // fabric.Canvas.getObjects() is okay, find might be an issue if empty.
          .find((obj) => obj.setCoords());

        if (frameObject) {
          imageRef.current.clipPath = frameObject;
        }
        canvasRef.current.requestRenderAll();
        setTimeout(() => {
          imageRef.current.filters = []; // not sure if it is needed
          currentFiltersRef.current = [];
          imageRef.current.applyFilters();

          disableSavingIntoStackRef.current = false;
          setLoadState(false);

          canvasRef.current.fire("object:modified");
        }, 1000);
      });
    };
  };

  const applyContrastStreching = async () => {
    disableSavingIntoStackRef.current = true;

    const filtersInCanvas: string[] = currentFiltersRef.current.map(
      //@ts-ignore
      (f) => f.filterName
    );
    allFiltersRef.current = allFiltersRef.current
      .concat(filtersInCanvas)
      .concat(["contrast streching"]);
    setLoadState(true);

    // Temporarily set visible = false for all objects other than image type
    canvasRef.current.getObjects().forEach((obj) => {
      if (obj.type !== "image") {
        obj.visible = false;
      }
    });

    const scaleX = imageRef.current.scaleX;
    const scaleY = imageRef.current.scaleY;
    const flipX = imageRef.current.flipX;
    const filpY = imageRef.current.flipY;
    const angle = imageRef.current.angle;

    imageRef.current.angle = 0;
    imageRef.current.scaleX = 1;
    imageRef.current.scaleY = 1;
    imageRef.current.flipX = false;
    imageRef.current.flipY = false;

    const originalViewportTransform = canvasRef.current.viewportTransform;
    const originalZoom = canvasRef.current.getZoom();

    // Reset to neutral
    canvasRef.current.setViewportTransform([1, 0, 0, 1, 0, 0]);

    canvasRef.current.setZoom(1);
    canvasRef.current
      .getObjects() // @ts-ignore
      .find((obj) => obj.setCoords());

    // get the bounding rect of the image
    const bounds = getRotatedBoundingBox(imageRef.current);

    // find the frame Object
    const frameObject = canvasRef.current
      .getObjects() // @ts-ignore
      .find((obj) => obj.name?.startsWith("Frame"));

    // if clipPath exist make it null so that we get the correct dataUrl
    if (imageRef.current.clipPath && frameObject) {
      imageRef.current.clipPath = null;
    }

    // @ts-ignore
    const canvasImageBase64 = canvasRef.current.toDataURL({
      format: "png",
      left: bounds.left,
      top: bounds.top,
      width: bounds.width,
      height: bounds.height,
    });

    // 2. Load image and get pixel data
    const img = new window.Image();
    img.src = canvasImageBase64;

    img.onload = () => {
      // Create a temp canvas
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      const ctx = tempCanvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const data = imageData.data;

      // 3. Convert RGB to YCrCb and track min/max values
      const yArr: number[] = [];
      const crArr: number[] = [];
      const cbArr: number[] = [];
      const alphaArr: number[] = [];
      let minValue = Infinity;
      let maxValue = -Infinity;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        // RGB to YCrCb
        const y = 0.299 * r + 0.587 * g + 0.114 * b;
        const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
        const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

        // Track min and max values
        if (y < minValue) minValue = y;
        if (y > maxValue) maxValue = y;

        yArr.push(y);
        cbArr.push(cb);
        crArr.push(cr);
        alphaArr.push(a);
      }

      // 4. Apply contrast stretching
      const scaler = maxValue !== minValue ? 255 / (maxValue - minValue) : 1;
      for (let i = 0; i < yArr.length; i++) {
        yArr[i] = scaler * (yArr[i] - minValue);
      }

      // 5. Convert back from YCrCb to RGBA
      for (let i = 0, j = 0; i < data.length; i += 4, j++) {
        const y = yArr[j];
        const cb = cbArr[j];
        const cr = crArr[j];
        // YCrCb to RGB
        let r = y + 1.402 * (cr - 128);
        let g = y - 0.344136 * (cb - 128) - 0.714136 * (cr - 128);
        let b = y + 1.772 * (cb - 128);
        // Clamp
        r = Math.max(0, Math.min(255, Math.round(r)));
        g = Math.max(0, Math.min(255, Math.round(g)));
        b = Math.max(0, Math.min(255, Math.round(b)));
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
        data[i + 3] = alphaArr[j];
      }
      // 6. Put data back and get base64
      ctx.putImageData(imageData, 0, 0);
      const base64Result = tempCanvas.toDataURL("image/png");

      FabricImage.fromURL(base64Result).then((img) => {
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

        //  set visible = true for all objects other than image type
        canvasRef.current.getObjects().forEach((obj) => {
          if (
            obj.type !== "image" && // @ts-ignore
            obj?.name.startsWith("Frame") && // @ts-ignore
            obj?.name.startsWith("liquifyCircle")
          ) {
            obj.set("visible", true);
          }
        });

        // Restore zoom & transform
        canvasRef.current.setViewportTransform(originalViewportTransform);
        canvasRef.current.setZoom(originalZoom);
        canvasRef.current
          .getObjects() // fabric.Canvas.getObjects() is okay, find might be an issue if empty.
          .find((obj) => obj.setCoords());

        if (frameObject) {
          imageRef.current.clipPath = frameObject;
        }
        canvasRef.current.requestRenderAll();
        setTimeout(() => {
          imageRef.current.filters = []; // not sure if it is needed
          currentFiltersRef.current = [];
          imageRef.current.applyFilters();

          disableSavingIntoStackRef.current = false;
          setLoadState(false);

          canvasRef.current.fire("object:modified");
        }, 1000);
      });
    };
  };

  const applyWhiteBalance = async () => {
    disableSavingIntoStackRef.current = true;

    const filtersInCanvas: string[] = currentFiltersRef.current.map(
      //@ts-ignore
      (f) => f.filterName
    );

    allFiltersRef.current = allFiltersRef.current
      .concat(filtersInCanvas)
      .concat(["white balance"]);
    setLoadState(true);

    // Temporarily set visible = false for all objects other than image type
    canvasRef.current.getObjects().forEach((obj) => {
      if (obj.type !== "image") {
        obj.visible = false;
      }
    });

    const scaleX = imageRef.current.scaleX;
    const scaleY = imageRef.current.scaleY;
    const flipX = imageRef.current.flipX;
    const filpY = imageRef.current.flipY;
    const angle = imageRef.current.angle;

    imageRef.current.angle = 0;
    imageRef.current.scaleX = 1;
    imageRef.current.scaleY = 1;
    imageRef.current.flipX = false;
    imageRef.current.flipY = false;

    const originalViewportTransform = canvasRef.current.viewportTransform;
    const originalZoom = canvasRef.current.getZoom();

    // Reset to neutral
    canvasRef.current.setViewportTransform([1, 0, 0, 1, 0, 0]);

    canvasRef.current.setZoom(1);
    canvasRef.current
      .getObjects() // @ts-ignore
      .find((obj) => obj.setCoords());

    // get the bounding rect of the image
    const bounds = getRotatedBoundingBox(imageRef.current);

    // find the frame Object
    const frameObject = canvasRef.current
      .getObjects() // @ts-ignore
      .find((obj) => obj.name?.startsWith("Frame"));

    // if clipPath exist make it null so that we get the correct dataUrl
    if (imageRef.current.clipPath && frameObject) {
      imageRef.current.clipPath = null;
    }

    // @ts-ignore
    const canvasImageBase64 = canvasRef.current.toDataURL({
      format: "png",
      left: bounds.left,
      top: bounds.top,
      width: bounds.width,
      height: bounds.height,
    });

    // 2. Load image and get pixel data
    const img = new window.Image();
    img.src = canvasImageBase64;

    img.onload = () => {
      // Create a temp canvas
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      const ctx = tempCanvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const data = imageData.data;

      // Helper functions for RGB <-> XYZ <-> Lab conversions
      // (Put these in your module or copy here)
      function rgbToXyz(r, g, b) {
        // normalize RGB
        r /= 255;
        g /= 255;
        b /= 255;
        r = r <= 0.04045 ? r / 12.92 : ((r + 0.055) / 1.055) ** 2.4;
        g = g <= 0.04045 ? g / 12.92 : ((g + 0.055) / 1.055) ** 2.4;
        b = b <= 0.04045 ? b / 12.92 : ((b + 0.055) / 1.055) ** 2.4;
        // Observer= 2°, Illuminant= D65
        return {
          x: r * 0.4124564 + g * 0.3575761 + b * 0.1804375,
          y: r * 0.2126729 + g * 0.7151522 + b * 0.072175,
          z: r * 0.0193339 + g * 0.119192 + b * 0.9503041,
        };
      }

      function xyzToLab(x, y, z) {
        const refX = 0.95047,
          refY = 1.0,
          refZ = 1.08883;
        let fx = f(x / refX);
        let fy = f(y / refY);
        let fz = f(z / refZ);

        function f(t) {
          return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
        }

        return {
          L: 116 * fy - 16,
          a: 500 * (fx - fy),
          b: 200 * (fy - fz),
        };
      }

      function labToXyz(L, a, b) {
        const refX = 0.95047,
          refY = 1.0,
          refZ = 1.08883;
        let fy = (L + 16) / 116;
        let fx = a / 500 + fy;
        let fz = fy - b / 200;

        function fInv(t) {
          return t ** 3 > 0.008856 ? t ** 3 : (t - 16 / 116) / 7.787;
        }

        return {
          x: refX * fInv(fx),
          y: refY * fInv(fy),
          z: refZ * fInv(fz),
        };
      }

      function xyzToRgb(x, y, z) {
        // convert XYZ to linear RGB
        let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
        let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
        let b = x * 0.0557 + y * -0.204 + z * 1.057;

        // gamma correction
        r = r > 0.0031308 ? 1.055 * r ** (1 / 2.4) - 0.055 : 12.92 * r;
        g = g > 0.0031308 ? 1.055 * g ** (1 / 2.4) - 0.055 : 12.92 * g;
        b = b > 0.0031308 ? 1.055 * b ** (1 / 2.4) - 0.055 : 12.92 * b;

        // clamp and convert to 0-255
        return {
          r: Math.min(255, Math.max(0, Math.round(r * 255))),
          g: Math.min(255, Math.max(0, Math.round(g * 255))),
          b: Math.min(255, Math.max(0, Math.round(b * 255))),
        };
      }

      // Step 1: Calculate average a and b
      let sumA = 0,
        sumB = 0;
      let count = 0;

      for (let i = 0; i < data.length; i += 4) {
        const { x, y, z } = rgbToXyz(data[i], data[i + 1], data[i + 2]);
        const lab = xyzToLab(x, y, z);
        sumA += lab.a;
        sumB += lab.b;
        count++;
      }
      const avgA = sumA / count;
      const avgB = sumB / count;

      // Step 2: Apply correction per pixel
      for (let i = 0; i < data.length; i += 4) {
        const { x, y, z } = rgbToXyz(data[i], data[i + 1], data[i + 2]);
        let lab = xyzToLab(x, y, z);

        // Calculate correction strength proportional to lightness
        let correctionStrength = (lab.L / 100) * 1.1;

        // Shift a and b channels towards zero by avgA and avgB scaled by correctionStrength
        lab.a -= avgA * correctionStrength;
        lab.b -= avgB * correctionStrength;

        const xyz = labToXyz(lab.L, lab.a, lab.b);
        const rgb = xyzToRgb(xyz.x, xyz.y, xyz.z);

        data[i] = rgb.r;
        data[i + 1] = rgb.g;
        data[i + 2] = rgb.b;
        // alpha unchanged
      }

      // 6. Put data back and get base64
      ctx.putImageData(imageData, 0, 0);
      const base64Result = tempCanvas.toDataURL("image/png");

      FabricImage.fromURL(base64Result).then((img) => {
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

        //  set visible = true for all objects other than image type
        canvasRef.current.getObjects().forEach((obj) => {
          if (
            obj.type !== "image" && // @ts-ignore
            obj?.name.startsWith("Frame") && // @ts-ignore
            obj?.name.startsWith("liquifyCircle")
          ) {
            obj.set("visible", true);
          }
        });

        // Restore zoom & transform
        canvasRef.current.setViewportTransform(originalViewportTransform);
        canvasRef.current.setZoom(originalZoom);
        canvasRef.current
          .getObjects() // fabric.Canvas.getObjects() is okay, find might be an issue if empty.
          .find((obj) => obj.setCoords());

        if (frameObject) {
          imageRef.current.clipPath = frameObject;
        }
        canvasRef.current.requestRenderAll();
        setTimeout(() => {
          imageRef.current.filters = []; // not sure if it is needed
          currentFiltersRef.current = [];
          imageRef.current.applyFilters();

          disableSavingIntoStackRef.current = false;
          setLoadState(false);

          canvasRef.current.fire("object:modified");
        }, 1000);
      });
    };
  };

  return (
    <div className="max-h-full flex flex-col items-center justify-center w-full gap-4">
      <Tabs
        defaultValue="reflect"
        value={activateTab}
        onValueChange={(value) => setActivateTab(value)}
        className="w-full flex-1 flex flex-col rounded-none"
      >
        <div className="border-b border-gray-200 dark:border-gray-800">
          <TabsList className="w-full grid grid-cols-3 rounded-none">
            <TabsTrigger value="reflect">Reflect</TabsTrigger>
            <TabsTrigger value="morph">Liquify</TabsTrigger>
            {/* <TabsTrigger value="edge">Edge</TabsTrigger> */}
            <TabsTrigger value="hist">Hist</TabsTrigger>
          </TabsList>
        </div>

        {/* Reflect Filters Tab */}
        <TabsContent
          value="reflect"
          className="flex-1 flex flex-col justify-center items-center"
        >
          <ReflectFilterTab imageRef={imageRef} canvasRef={canvasRef} />
          <div className="w-[90%] mt-3">
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
        </TabsContent>

        <TabsContent
          value="morph"
          className="w-full flex flex-col justify-center items-center space-y-2"
        >
          <div className="w-[90%]">
            <Card>
              <CardHeader>
                <CardDescription className="text-center">
                  Liquify Controls
                </CardDescription>
              </CardHeader>
              <CardContent className="w-full flex flex-col gap-4">
                {/* Tool Selection */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Swirl Tool */}
                  <div
                    className={`group relative flex flex-col items-center p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                      activateLiquidifyTool === "swirl"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                    onClick={() => {
                      if (activateLiquidifyTool === "swirl") {
                        deactivateSwril();
                        setActivateLiquidifyTool("");
                      } else {
                        // Deactivate other tools first
                        if (activateLiquidifyTool === "bulge") {
                          deactivateBulge();
                        }
                        activateSwril();
                        setActivateLiquidifyTool("swirl");
                      }
                    }}
                  >
                    <div
                      className={`p-3 rounded-full mb-2 transition-colors duration-200 ${
                        activateLiquidifyTool === "swirl"
                          ? "bg-blue-100 dark:bg-blue-800"
                          : "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                      }`}
                    >
                      <SwirlIcon
                        size={24}
                        className={`transition-colors duration-200 ${
                          activateLiquidifyTool === "swirl"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Swirl
                    </span>
                  </div>

                  {/* Bulge Tool */}
                  <div
                    className={`group relative flex flex-col items-center p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                      activateLiquidifyTool === "bulge"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                    onClick={() => {
                      if (activateLiquidifyTool === "bulge") {
                        deactivateBulge();
                        setActivateLiquidifyTool("");
                      } else {
                        // Deactivate other tools first
                        if (activateLiquidifyTool === "swirl") {
                          deactivateSwril();
                        }
                        activateBulge();
                        setActivateLiquidifyTool("bulge");
                      }
                    }}
                  >
                    <div
                      className={`p-3 rounded-full mb-2 transition-colors duration-200 ${
                        activateLiquidifyTool === "bulge"
                          ? "bg-blue-100 dark:bg-blue-800"
                          : "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                      }`}
                    >
                      <BulgeIcon
                        size={24}
                        className={`transition-colors duration-200 ${
                          activateLiquidifyTool === "bulge"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bulge
                    </span>
                  </div>
                </div>

                {/* Tool Controls */}
                <div className="space-y-4">
                  {/* Swirl Controls */}
                  {activateLiquidifyTool === "swirl" && (
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-4">
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 text-sm">
                          <p>Radius</p>
                          <p className="font-medium">
                            {swirlRadius.toFixed(2)}
                          </p>
                        </div>
                        <Slider
                          value={[swirlRadius]}
                          min={0.01}
                          max={1}
                          step={0.01}
                          onValueChange={(e) => {
                            handleSwirlRadiusChange(e[0]);
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 text-sm">
                          <p>Strength</p>
                          <p className="font-medium">
                            {(swirlAngle / 20).toFixed(2)}
                          </p>
                        </div>
                        <Slider
                          value={[swirlAngle]}
                          min={-20}
                          max={20}
                          step={0.01}
                          onValueChange={(e) => {
                            handleSwirlStrengthChange(e[0]);
                          }}
                        />
                      </div>
                      <button
                        className="w-full mt-2 p-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm"
                        onClick={() => handleSwirlFilterReset()}
                      >
                        Reset All
                      </button>
                    </div>
                  )}

                  {/* Bulge Controls */}
                  {activateLiquidifyTool === "bulge" && (
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-4">
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 text-sm">
                          <p>Radius</p>
                          <p className="font-medium">
                            {bulgeRadius.toFixed(2)}
                          </p>
                        </div>
                        <Slider
                          value={[bulgeRadius]}
                          min={0.01}
                          max={1}
                          step={0.01}
                          onValueChange={(e) => {
                            handleBulgeRadiusChange(e[0]);
                          }}
                        />
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 text-sm">
                          <p>Strength</p>
                          <p className="font-medium">
                            {bulgeStrength.toFixed(2)}
                          </p>
                        </div>
                        <Slider
                          value={[bulgeStrength]}
                          min={-1}
                          max={1}
                          step={0.01}
                          onValueChange={(e) => {
                            handleBulgeStrengthChange(e[0]);
                          }}
                        />
                      </div>

                      <button
                        className="w-full mt-2 p-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm"
                        onClick={() => handleBulgeFilterReset()}
                      >
                        Reset All
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
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
        </TabsContent>

        {/* <TabsContent
          value="edge"
          className="w-full flex flex-col justify-center items-center space-y-2"
        >
          <EdgeFiltersTab imageRef={imageRef} canvasRef={canvasRef} />
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
        </TabsContent> */}

        <TabsContent
          value="hist"
          className="w-full flex flex-col justify-center items-center space-y-2"
        >
          {/* Histogram Tools */}
          <div className="w-[90%] mt-4">
            <Card>
              <CardHeader>
                <CardDescription className="text-center">
                  Enhancement Tools
                </CardDescription>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Improve image quality with advanced processing techniques
                </p>
              </CardHeader>
              <CardContent className="w-full">
                <div className="grid grid-cols-1 gap-3">
                  <button
                    className="group flex items-center p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 hover:shadow-sm"
                    onClick={applyHistogram}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                        <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm">
                          HE
                        </span>
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="font-medium text-left">
                          Histogram Equalization
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 text-left">
                          Improves contrast and brightness distribution
                        </span>
                      </div>
                    </div>
                  </button>

                  <button
                    className="group flex items-center p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 hover:shadow-sm"
                    onClick={applyContrastStreching}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                          CS
                        </span>
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="font-medium text-left">
                          Contrast Stretching
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 text-left">
                          Enhances image visibility and detail clarity
                        </span>
                      </div>
                    </div>
                  </button>

                  <button
                    className="group flex items-center p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 hover:shadow-sm"
                    onClick={applyWhiteBalance}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                        <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                          WB
                        </span>
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="font-medium text-left">
                          Auto White Balance
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 text-left">
                          Corrects color temperature and removes color casts
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdjustSidebarAdvanced;
