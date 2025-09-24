import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import { Canvas, FabricImage } from "fabric";
import { Switch } from "./ui/switch";
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";
import { useLogContext } from "@/hooks/useLogContext";

import { Label } from "./ui/label";
import { useAuthContext } from "@/hooks/useAuthContext";
import { getRotatedBoundingBox } from "@/utils/commonFunctions";
import { useCallback, useRef, useState } from "react";

type ImageSizeProps = {
  canvas: Canvas;
  image: FabricImage;
};

const DEBOUNCE_DELAY = 500; // ms

const ImageSize = ({ canvas, image }: ImageSizeProps) => {
  const { user } = useAuthContext();
  const {
    finalImageDimensions,
    setFinalImageDimensions,
    setDownloadImageDimensions,
    finalImageDimensionsRef,
    downloadImageDimensionsRef,
  } = useCanvasObjects();
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const { addLog } = useLogContext();

  const useDebounceFn = (fn: (...args: any[]) => void, delay: number) => {
    const timerRef = useRef<number | null>(null);

    const debounced = useCallback(
      (...args: any[]) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
          fn(...args);
        }, delay);
      },
      [fn, delay]
    );

    return debounced;
  };

  const debouncedScaleAndRender = useDebounceFn(
    (scaleX: number, scaleY: number) => {
      image.scaleX = scaleX;
      image.scaleY = scaleY;
      handleRenderingFinalDimension();
    },
    DEBOUNCE_DELAY
  );

  const handleRenderingFinalDimension = () => {
    const originalViewportTransform = canvas.viewportTransform;
    const originalZoom = canvas.getZoom();

    // Reset to neutral
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

    canvas.setZoom(1);
    canvas
      .getObjects() // @ts-ignore
      .find((obj) => obj.setCoords());

    const bounds = getRotatedBoundingBox(image);

    downloadImageDimensionsRef.current = {
      imageHeight: bounds.height,
      imageWidth: bounds.width,
    };

    setDownloadImageDimensions({
      imageHeight: bounds.height,
      imageWidth: bounds.width,
    });

    const canvasRect = canvas
      .getObjects() // @ts-ignore
      .find((obj) => obj.name?.startsWith("canvasRect"));

    // Restore zoom & transform
    canvas.setZoom(originalZoom);
    canvas.setViewportTransform(originalViewportTransform);

    canvas
      .getObjects() // @ts-ignore
      .find((obj) => obj.setCoords());

    canvasRect.set({
      height: bounds.height,
      width: bounds.width,
    });

    canvas.requestRenderAll();

    canvas.fire("object:modified");
  };

  const handleWidthChange = (e) => {
    console.log("width change", e.target.value);
    if (e.target.value === "") return;
    if (isNaN(parseInt(e.target.value))) return;

    const newWidth = parseInt(e.target.value);
    const oldHeight = image.height;
    const oldWidth = image.width;

    const ratio = oldWidth / oldHeight;
    const newHeight = Math.floor(newWidth / ratio);

    let scaleY = newHeight / oldHeight;
    const scaleX = newWidth / oldWidth;

    if (scaleX <= 0 || scaleY <= 0) return;

    if (newWidth > 0) {
      if (maintainAspectRatio) {
        setFinalImageDimensions({
          imageHeight: newHeight,
          imageWidth: newWidth,
        });

        finalImageDimensionsRef.current = {
          imageHeight: newHeight,
          imageWidth: newWidth,
        };
        addLog({
          section: "arrange",
          tab: "image size",
          event: "update",
          message: `image height change to ${newHeight} width changed to ${newWidth}`,
          param: "image size",
          objType: "image",
        });
      } else {
        setFinalImageDimensions({
          ...finalImageDimensions,
          imageWidth: newWidth,
        });
        finalImageDimensionsRef.current = {
          imageHeight: newHeight,
          imageWidth: newWidth,
        };
        addLog({
          section: "arrange",
          tab: "image size",
          event: "update",
          message: `image width changed to ${newWidth}`,
          param: "image size",
          objType: "image",
        });
        scaleY = image.scaleY;
      }
    }

    debouncedScaleAndRender(scaleX, scaleY);
    // image.scaleX = scaleX;
    // image.scaleY = scaleY;

    // handleRenderingFinalDimension();
  };
  const handleHeightChange = (e) => {
    if (e.target.value === "") return;
    if (isNaN(parseInt(e.target.value))) return;

    const newHeight = parseInt(e.target.value);
    const oldHeight = image.height;
    const oldWidth = image.width;

    const ratio = oldWidth / oldHeight;
    const newWidth = Math.floor(newHeight * ratio);

    const scaleY = newHeight / oldHeight;
    let scaleX = newWidth / oldWidth;

    if (scaleX <= 0 || scaleY <= 0) return;

    if (newHeight > 0) {
      if (maintainAspectRatio) {
        setFinalImageDimensions({
          imageHeight: newHeight,
          imageWidth: newWidth,
        });
        finalImageDimensionsRef.current = {
          imageHeight: newHeight,
          imageWidth: newWidth,
        };
        addLog({
          section: "arrange",
          tab: "image size",
          event: "update",
          message: `image height change to ${newHeight} width changed to ${newWidth}`,
          param: "image size",
          objType: "image",
        });
      } else {
        addLog({
          section: "arrange",
          tab: "image size",
          event: "update",
          message: `image height change to ${newHeight}`,
          param: "image size",
          objType: "image",
        });
        setFinalImageDimensions({
          ...finalImageDimensions,
          imageHeight: newHeight,
        });
        finalImageDimensionsRef.current = {
          imageHeight: newHeight,
          imageWidth: newWidth,
        };
        scaleX = image.scaleX;
      }
    }

    // image.scaleX = scaleX;
    // image.scaleY = scaleY;

    // handleRenderingFinalDimension();
    debouncedScaleAndRender(scaleX, scaleY);
  };

  const handleImageResizeReset = () => {
    setFinalImageDimensions({
      imageHeight: image.height,
      imageWidth: image.width,
    });

    finalImageDimensionsRef.current = {
      imageHeight: image.height,
      imageWidth: image.width,
    };

    addLog({
      section: "arrange",
      tab: "image size",
      event: "update",
      message: `image height & width changed to default value`,
      param: "image size",
      objType: "image",
    });

    image.scaleX = 1;
    image.scaleY = 1;
    canvas.renderAll();

    handleRenderingFinalDimension();
  };

  const handleImageResizeX = (inc: number) => {
    const newWidth = finalImageDimensions.imageWidth * inc;
    const newHeight = finalImageDimensions.imageHeight * inc;

    image.scaleX *= inc;
    image.scaleY *= inc;
    canvas.renderAll();

    setFinalImageDimensions({
      imageWidth: newWidth,
      imageHeight: newHeight,
    });

    finalImageDimensionsRef.current = {
      imageWidth: newWidth,
      imageHeight: newHeight,
    };

    addLog({
      section: "arrange",
      tab: "image size",
      event: "scale up",
      message: `Image scaled ${inc}x`,
      param: `${inc}x scale`,
      objType: "image",
    });

    handleRenderingFinalDimension();
  };

  return (
    <Card>
      <CardHeader>
        <CardDescription>Image Size</CardDescription>
      </CardHeader>
      <CardContent className="w-full">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col w-full gap-3  items-center justify-center">
            <div className="grid grid-cols-2  items-center justify-center">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                type="text"
                name="height"
                value={finalImageDimensions.imageHeight.toString()}
                onChange={handleHeightChange}
              />
            </div>
            <div className="grid grid-cols-2  items-center justify-center">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="text"
                name="width"
                value={finalImageDimensions.imageWidth.toString()}
                onChange={handleWidthChange}
              />
            </div>
            <div className="mt-2 w-full flex justify-between items-center">
              <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
              <Switch
                id="aspect-ratio"
                checked={maintainAspectRatio}
                onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
              />
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => {
                handleImageResizeX(2);
              }}
            >
              +2x
            </Button>

            <Button
              className="flex-1"
              variant="outline"
              onClick={() => {
                handleImageResizeX(4);
              }}
            >
              +4x
            </Button>
          </div>

          <button className="custom-button" onClick={handleImageResizeReset}>
            Reset
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageSize;
