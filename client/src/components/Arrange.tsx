import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import IconComponent from "./icon-component";
import {
  UndoDot,
  RedoDot,
  UnfoldVertical,
  UnfoldHorizontal,
} from "lucide-react";
import { Canvas, FabricImage } from "fabric";
import { useEffect, useState } from "react";
import { useLogContext } from "@/hooks/useLogContext";
import ImageSize from "./ImageSize";
import { useArrangeStore } from "@/hooks/appStore/ArrangeStore";
import { Slider } from "./ui/slider";
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";
import { getRotatedBoundingBox } from "@/utils/commonFunctions";

type ArrangeProps = {
  canvas: Canvas;
  image: FabricImage;
};

const Arrange = ({ canvas, image }: ArrangeProps) => {
  const { addLog } = useLogContext();
  const flipX = useArrangeStore((state) => state.flipX);
  const flipY = useArrangeStore((state) => state.flipY);
  const imageRotation = useArrangeStore((state) => state.imageRotation);
  const setFlipX = useArrangeStore((state) => state.setFlipX);
  const setFlipY = useArrangeStore((state) => state.setFlipY);
  const setImageRotation = useArrangeStore((state) => state.setImageRotation);
  const { setDownloadImageDimensions, downloadImageDimensionsRef } =
    useCanvasObjects();

  const handleFlipX = (flipX: boolean) => {
    setFlipX(flipX);

    image.set({
      flipX: flipX,
    });

    canvas.renderAll();
    canvas.fire("object:modified");
  };

  const handleFlipY = (flipY: boolean) => {
    setFlipY(flipY);

    image.set({
      flipY: flipY,
    });

    canvas.renderAll();
    canvas.fire("object:modified");
  };

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

    setDownloadImageDimensions({
      imageHeight: bounds.height,
      imageWidth: bounds.width,
    });

    downloadImageDimensionsRef.current = {
      imageHeight: bounds.height,
      imageWidth: bounds.width,
    };

    // Restore zoom & transform
    canvas.setViewportTransform(originalViewportTransform);
    canvas.setZoom(originalZoom);
    canvas
      .getObjects() // @ts-ignore
      .find((obj) => obj.setCoords());
  };

  const handleImageRotation = (e) => {
    const rotationValue = parseInt(e[0]);

    addLog({
      section: "arrange",
      tab: "rotation",
      event: "update",
      message: `rotation value changed from  ${imageRotation} to ${e[0]}`,
      value: `${e[0]}`,
      objType: "canvas",
    });

    setImageRotation(rotationValue);
    image.angle = rotationValue;
    canvas.renderAll();

    handleRenderingFinalDimension();

    canvas.fire("object:modified");
  };

  const handleOrientationReset = () => {
    addLog({
      section: "arrange",
      tab: "flip",
      event: "reset",
      message: `canvas flip and rotation set to default`,
      param: "rotation",
      objType: "image",
    });

    setFlipX(false);
    setFlipY(false);

    image.set({
      flipX: false,
      flipY: false,
    });

    setImageRotation(0);
    image.angle = 0;
    canvas.renderAll();

    handleRenderingFinalDimension();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full gap-4">
      <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription>Flip</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <IconComponent
                  icon={<UndoDot />}
                  iconName="Flip Left"
                  handleClick={() => {
                    if (flipX) {
                      addLog({
                        section: "arrange",
                        tab: "flip",
                        event: "update",
                        message: "image Flipped to right",
                        param: "rotation",
                        objType: "image",
                      });
                    } else {
                      addLog({
                        section: "arrange",
                        tab: "flip",
                        event: "update",
                        message: "image Flipped to degress left",
                        param: "rotation",
                        objType: "image",
                      });
                    }
                    handleFlipX(!flipX);
                  }}
                />

                <IconComponent
                  icon={<RedoDot />}
                  iconName="Roate Right"
                  handleClick={() => {
                    if (flipX) {
                      addLog({
                        section: "arrange",
                        tab: "flip",
                        event: "update",
                        message: "image Flipped to left",
                        param: "rotation",
                        objType: "image",
                      });
                    } else {
                      addLog({
                        section: "arrange",
                        tab: "flip",
                        event: "update",
                        message: "image Flipped to right",
                        param: "rotation",
                        objType: "image",
                      });
                    }
                    handleFlipX(!flipX);
                  }}
                />

                <IconComponent
                  icon={<UnfoldVertical />}
                  iconName="Vertial Flip"
                  handleClick={() => {
                    if (flipY) {
                      addLog({
                        section: "arrange",
                        tab: "flip",
                        event: "update",
                        message: "image Flipped to down",
                        param: "rotation",
                        objType: "image",
                      });
                    } else {
                      addLog({
                        section: "arrange",
                        tab: "rotation",
                        event: "update",
                        message: "image Flipped to up",
                        param: "rotation",
                        objType: "image",
                      });
                    }
                    handleFlipY(!flipY);
                  }}
                />

                <IconComponent
                  icon={<UnfoldHorizontal />}
                  iconName="Vertical  Flip"
                  handleClick={() => {
                    if (flipY) {
                      addLog({
                        section: "arrange",
                        tab: "rotation",
                        event: "update",
                        message: "image Flipped to up",
                        param: "rotation",
                        objType: "image",
                      });
                    } else {
                      addLog({
                        section: "arrange",
                        tab: "flip",
                        event: "update",
                        message: "image Flipped to down",
                        param: "rotation",
                        objType: "image",
                      });

                      handleFlipY(!flipY);
                    }
                  }}
                />
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center text-slate-400 text-sm">
                  <p>Rotation</p>
                  <p>{imageRotation}</p>
                </div>

                <Slider
                  value={[imageRotation]}
                  min={0}
                  max={360}
                  step={1}
                  onValueChange={handleImageRotation}
                />
              </div>

              <button
                className="custom-button"
                onClick={handleOrientationReset}
              >
                Reset
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="w-[90%]">
        <ImageSize canvas={canvas} image={image} />
      </div>
    </div>
  );
};

export default Arrange;
