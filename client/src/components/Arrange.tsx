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

type ArrangeProps = {
  canvas: Canvas;
  image: FabricImage;
};

const Arrange = ({ canvas, image }: ArrangeProps) => {
  const { addLog } = useLogContext();
  const rotateX = useArrangeStore((state) => state.rotateX);
  const rotateY = useArrangeStore((state) => state.rotateY);
  const setRotateX = useArrangeStore((state) => state.setRotateX);
  const setRotateY = useArrangeStore((state) => state.setRotateY);

  useEffect(() => {
    image.set({
      flipX: rotateX,
      flipY: rotateY,
    });

    canvas.renderAll();
  }, [rotateX, rotateY]);

  const handleOrientationReset = () => {
    addLog({
      section: "arrange",
      tab: "rotation",
      event: "reset",
      message: `image rotation set default`,
      param: "rotation",
      objType: "image",
    });

    setRotateX(false);
    setRotateY(false);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full gap-4">
      <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription>Roate&Flip</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <IconComponent
                  icon={<UndoDot />}
                  iconName="Rotate Left"
                  handleClick={() => {
                    if (rotateX) {
                      addLog({
                        section: "arrange",
                        tab: "rotation",
                        event: "update",
                        message: "image Rotated 180 degress right",
                        param: "rotation",
                        objType: "image",
                      });
                    } else {
                      addLog({
                        section: "arrange",
                        tab: "rotation",
                        event: "update",
                        message: "image Rotated 180 degress left",
                        param: "rotation",
                        objType: "image",
                      });
                    }
                    setRotateX(!rotateX);
                  }}
                />

                <IconComponent
                  icon={<RedoDot />}
                  iconName="Roate Right"
                  handleClick={() => {
                    if (rotateX) {
                      addLog({
                        section: "arrange",
                        tab: "rotation",
                        event: "update",
                        message: "image Rotated 180 degress left",
                        param: "rotation",
                        objType: "image",
                      });
                    } else {
                      addLog({
                        section: "arrange",
                        tab: "rotation",
                        event: "update",
                        message: "image Rotated 180 degress right",
                        param: "rotation",
                        objType: "image",
                      });
                    }
                    setRotateX(!rotateX);
                  }}
                />

                <IconComponent
                  icon={<UnfoldVertical />}
                  iconName="Vertial Flip"
                  handleClick={() => {
                    if (rotateY) {
                      addLog({
                        section: "arrange",
                        tab: "rotation",
                        event: "update",
                        message: "image Rotated 180 degress down",
                        param: "rotation",
                        objType: "image",
                      });
                    } else {
                      addLog({
                        section: "arrange",
                        tab: "rotation",
                        event: "update",
                        message: "image Rotated 180 degress up",
                        param: "rotation",
                        objType: "image",
                      });
                    }
                    setRotateY(!rotateY);
                  }}
                />

                <IconComponent
                  icon={<UnfoldHorizontal />}
                  iconName="Vertical  Flip"
                  handleClick={() => {
                    if (rotateY) {
                      addLog({
                        section: "arrange",
                        tab: "rotation",
                        event: "update",
                        message: "image Rotated 180 degress up",
                        param: "rotation",
                        objType: "image",
                      });
                    } else {
                      addLog({
                        section: "arrange",
                        tab: "rotation",
                        event: "update",
                        message: "image Rotated 180 degress down",
                        param: "rotation",
                        objType: "image",
                      });
                    }
                    setRotateY(!rotateY);
                  }}
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
