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
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FocusEvent, KeyboardEvent } from "react";

type ImageSizeProps = {
  canvas: Canvas;
  image: FabricImage;
};

type FieldName = "width" | "height";

const fmt = (n: number) => Math.round(n).toString();

// Parse an arbitrary draft string into a positive number, or null when invalid/empty.
const parsePositive = (text: string): number | null => {
  const trimmed = text.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed);
  return Number.isFinite(n) && n > 0 ? n : null;
};

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

  // Free-typing model: while a field is focused, its input is bound to a local
  // string `draft` that accepts anything (empty, partial, garbage). The commit
  // happens only on blur / Enter, so the canvas never fights the keystrokes.
  const [draft, setDraft] = useState<{ width: string; height: string }>({
    width: fmt(finalImageDimensions.imageWidth),
    height: fmt(finalImageDimensions.imageHeight),
  });
  const [activeField, setActiveField] = useState<FieldName | null>(null);
  const suppressNextCommitRef = useRef(false);

  const committedValue = (field: FieldName) =>
    field === "width"
      ? finalImageDimensions.imageWidth
      : finalImageDimensions.imageHeight;

  // Keep drafts in sync whenever the committed size changes elsewhere
  // (load, super-resolution/replace, Reset, +2x/+4x) but never clobber
  // the text the user is currently typing.
  useEffect(() => {
    if (activeField !== null) return;
    setDraft({
      width: fmt(finalImageDimensions.imageWidth),
      height: fmt(finalImageDimensions.imageHeight),
    });
  }, [finalImageDimensions.imageWidth, finalImageDimensions.imageHeight, activeField]);

  // The aspect ratio is derived from the image's natural size (matches the
  // old lock-ON behavior which always used image.width / image.height).
  const deriveHeight = (w: number) =>
    image.width > 0 ? Math.round((w * image.height) / image.width) : w;
  const deriveWidth = (h: number) =>
    image.height > 0 ? Math.round((h * image.width) / image.height) : h;

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

  // Apply one committed resize to the canvas + context. The scale is computed
  // against the image's natural size, and the ref always mirrors exactly what
  // was applied (no more state/ref desync).
  const applyResize = (newW: number, newH: number, changed: FieldName) => {
    const scaleX = image.width > 0 ? newW / image.width : 1;
    const scaleY = image.height > 0 ? newH / image.height : 1;
    image.scaleX = scaleX;
    image.scaleY = scaleY;
    canvas.renderAll();

    const bothDimsChanged = maintainAspectRatio;
    addLog({
      section: "arrange",
      tab: "image size",
      event: "update",
      message: bothDimsChanged
        ? `image height change to ${newH} width changed to ${newW}`
        : changed === "width"
          ? `image width changed to ${newW}`
          : `image height changed to ${newH}`,
      param: "image size",
      objType: "image",
    });

    finalImageDimensionsRef.current = {
      imageWidth: newW,
      imageHeight: newH,
    };
    setFinalImageDimensions({
      imageWidth: newW,
      imageHeight: newH,
    });
    setDraft({ width: fmt(newW), height: fmt(newH) });

    handleRenderingFinalDimension();
  };

  // Single point of apply: parse the active field's draft and resize the
  // image. Invalid / empty input reverts that field; an unchanged value is a
  // no-op (so blurring without editing doesn't re-render or re-log).
  const commitField = (field: FieldName) => {
    const committedW = finalImageDimensions.imageWidth;
    const committedH = finalImageDimensions.imageHeight;

    const parsed = parsePositive(draft[field]);
    if (parsed === null) {
      setActiveField(null);
      setDraft((d) => ({
        ...d,
        [field]: fmt(field === "width" ? committedW : committedH),
      }));
      return;
    }

    const target = Math.round(parsed);
    let newW = committedW;
    let newH = committedH;

    if (maintainAspectRatio) {
      if (field === "width") {
        newW = target;
        newH = deriveHeight(target);
      } else {
        newH = target;
        newW = deriveWidth(target);
      }
    } else if (field === "width") {
      newW = target;
    } else {
      newH = target;
    }

    setActiveField(null);

    if (newW <= 0 || newH <= 0) {
      setDraft({ width: fmt(committedW), height: fmt(committedH) });
      return;
    }

    if (newW === committedW && newH === committedH) {
      setDraft({ width: fmt(committedW), height: fmt(committedH) });
      return;
    }

    applyResize(newW, newH, field);
  };

  const handleFocus = (field: FieldName, e: FocusEvent<HTMLInputElement>) => {
    suppressNextCommitRef.current = false;
    setActiveField(field);
    e.currentTarget.select();
  };

  const handleDraftChange = (
    field: FieldName,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setDraft((d) => ({ ...d, [field]: e.currentTarget.value }));
  };

  const handleBlur = (field: FieldName) => {
    if (suppressNextCommitRef.current) {
      // Escape was pressed: revert without committing.
      suppressNextCommitRef.current = false;
      setActiveField(null);
      setDraft((d) => ({ ...d, [field]: fmt(committedValue(field)) }));
      return;
    }
    commitField(field);
  };

  const handleKeyDown = (field: FieldName, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur(); // commit via onBlur
    } else if (e.key === "Escape") {
      e.preventDefault();
      suppressNextCommitRef.current = true;
      e.currentTarget.blur(); // revert via onBlur
    }
  };

  // What a field shows: its own free draft while focused; a live preview of the
  // derived value when the paired field is being typed with the lock ON; the
  // committed value otherwise.
  const getVisibleValue = (field: FieldName): string => {
    if (activeField === field) return draft[field];

    const other: FieldName = field === "width" ? "height" : "width";
    if (maintainAspectRatio && activeField === other) {
      const n = parsePositive(draft[other]);
      if (n !== null) {
        return fmt(
          field === "width" ? deriveWidth(Math.round(n)) : deriveHeight(Math.round(n))
        );
      }
    }

    return fmt(committedValue(field));
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
                inputMode="numeric"
                autoComplete="off"
                value={getVisibleValue("height")}
                onFocus={(e) => handleFocus("height", e)}
                onChange={(e) => handleDraftChange("height", e)}
                onBlur={() => handleBlur("height")}
                onKeyDown={(e) => handleKeyDown("height", e)}
              />
            </div>
            <div className="grid grid-cols-2  items-center justify-center">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="text"
                name="width"
                inputMode="numeric"
                autoComplete="off"
                value={getVisibleValue("width")}
                onFocus={(e) => handleFocus("width", e)}
                onChange={(e) => handleDraftChange("width", e)}
                onBlur={() => handleBlur("width")}
                onKeyDown={(e) => handleKeyDown("width", e)}
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
