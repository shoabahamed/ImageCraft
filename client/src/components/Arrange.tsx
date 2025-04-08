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

  useEffect(() => {
    image.set({
      flipX: flipX,
      flipY: flipY,
    });

    canvas.renderAll();
  }, [flipX, flipY]);

  const handleImageRotation = (e) => {
    const rotationValue = parseInt(e[0]);

    addLog({
      section: "arrange",
      tab: "rotation",
      event: "update",
      message: `rotation value changed from  ${imageRotation} to ${e[0]}`,
      value: `${e[0]}`,
    });

    setImageRotation(rotationValue);
    image.angle = rotationValue;
    canvas.renderAll();

    addLog({
      section: "arrange",
      tab: "flip",
      event: "update",
      message: `rotation value changed from  to ${e[0]}`,
      value: `${e[0]}`,
    });
  };

  const handleOrientationReset = () => {
    addLog({
      section: "arrange",
      tab: "flip",
      event: "reset",
      message: `image flip set to default`,
      param: "rotation",
      objType: "image",
    });

    setFlipX(false);
    setFlipY(false);
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
                    setFlipX(!flipX);
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
                    setFlipX(!flipX);
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
                    setFlipY(!flipY);
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
                    }
                    setFlipY(!flipY);
                  }}
                />
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center text-slate-400 text-sm">
                  <p>Rotation</p>
                  <p>{imageRotation}</p>
                </div>

                <Slider
                  defaultValue={[imageRotation]}
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
