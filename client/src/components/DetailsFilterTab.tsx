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
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";
import { Slider } from "./ui/slider";
import { updateOrInsert } from "@/utils/commonFunctions";
import { useRef } from "react";
import { throttle } from "@/utils/commonFunctions";

const DETAILS_THROTTLE_MS = 50;

type Props = {
  canvas: Canvas;
  imageRef: React.RefObject<FabricImage>;
};

const DetailFiltersTab = ({ canvas, imageRef }: Props) => {
  const { addLog } = useLogContext(); // Use log context

  const { currentFiltersRef } = useCanvasObjects();

  const opacityValue = useAdjustStore((state) => state.opacityValue);
  const blurValue = useAdjustStore((state) => state.blurValue);
  const noiseValue = useAdjustStore((state) => state.noiseValue);
  const pixelateValue = useAdjustStore((state) => state.pixelateValue);

  const sharpenValue = useAdjustStore((state) => state.sharpenValue);

  const setOpacityValue = useAdjustStore((state) => state.setOpacityValue);

  const setBlurValue = useAdjustStore((state) => state.setBlurValue);
  const setNoiseValue = useAdjustStore((state) => state.setNoiseValue);
  const setPixelateValue = useAdjustStore((state) => state.setPixelateValue);
  const setSharpenValue = useAdjustStore((state) => state.setSharpenValue);

  // Throttled handlers for detail sliders
  const throttledOpacity = useRef(
    throttle((value: number) => {
      handleDetailsFilters("opacity", value);
    }, DETAILS_THROTTLE_MS)
  ).current;
  const throttledBlur = useRef(
    throttle((value: number) => {
      handleDetailsFilters("blur", value);
    }, DETAILS_THROTTLE_MS)
  ).current;
  const throttledNoise = useRef(
    throttle((value: number) => {
      handleDetailsFilters("noise", value);
    }, DETAILS_THROTTLE_MS)
  ).current;
  const throttledPixelate = useRef(
    throttle((value: number) => {
      handleDetailsFilters("pixelate", value);
    }, DETAILS_THROTTLE_MS)
  ).current;
  const throttledSharpen = useRef(
    throttle((value: number) => {
      handleDetailsFilters("sharpen", value);
    }, DETAILS_THROTTLE_MS)
  ).current;

  const handleDetailsFilters = (filterName: string, value: number) => {
    const filtersList = [...(currentFiltersRef.current || [])];
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

    currentFiltersRef.current = filtersList;
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

    const filtersList = [...(currentFiltersRef.current || [])];
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

    currentFiltersRef.current = filtersList;

    canvas.fire("object:modified");
  };

  return (
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
                className="cursor-pointer"
                value={[opacityValue]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={(e) => {
                  throttledOpacity(e[0]);
                }}
                onValueCommit={(e) => {
                  const filterName = "opacity";
                  addLog({
                    section: "adjust",
                    tab: "detail",
                    event: "update",
                    message: `${filterName} filter value changed to ${e[0]}`,
                  });
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
                className="cursor-pointer"
                value={[blurValue]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={(e) => {
                  throttledBlur(e[0]);
                }}
                onValueCommit={(e) => {
                  const filterName = "blur";
                  addLog({
                    section: "adjust",
                    tab: "detail",
                    event: "update",
                    message: `${filterName} filter value changed to ${e[0]}`,
                  });
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
                className="cursor-pointer"
                value={[noiseValue]}
                min={0}
                max={100}
                step={2}
                onValueChange={(e) => {
                  throttledNoise(e[0]);
                }}
                onValueCommit={(e) => {
                  const filterName = "noise";
                  addLog({
                    section: "adjust",
                    tab: "detail",
                    event: "update",
                    message: `${filterName} filter value changed to ${e[0]}`,
                  });
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
                className="cursor-pointer"
                value={[pixelateValue]}
                min={0}
                max={50}
                step={1}
                onValueChange={(e) => {
                  throttledPixelate(e[0]);
                }}
                onValueCommit={(e) => {
                  const filterName = "pixelate";
                  addLog({
                    section: "adjust",
                    tab: "detail",
                    event: "update",
                    message: `${filterName} filter value changed to ${e[0]}`,
                  });
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
                className="cursor-pointer"
                value={[sharpenValue]}
                min={0}
                max={2}
                step={0.01}
                onValueChange={(e) => {
                  throttledSharpen(e[0]);
                }}
                onValueCommit={(e) => {
                  const filterName = "sharpen";
                  addLog({
                    section: "adjust",
                    tab: "detail",
                    event: "update",
                    message: `${filterName} filter value changed to ${e[0]}`,
                  });
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
  );
};

export default DetailFiltersTab;
