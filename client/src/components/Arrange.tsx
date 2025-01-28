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
import { Button } from "./ui/button";
import { Canvas, FabricImage } from "fabric";
import { useEffect, useState } from "react";
import { useLogContext } from "@/hooks/useLogContext";
import { Input } from "./ui/input";
import ImageSize from "./ImageSize";
import { Label } from "./ui/label";
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";

type ArrangeProps = {
  canvas: Canvas;
  image: FabricImage;
};

const Arrange = ({ canvas, image }: ArrangeProps) => {
  const { addLog } = useLogContext();
  const [rotateX, setRotateX] = useState(false);
  const [rotateY, setRotateY] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [backgroundImage, setBackgroundImage] = useState<null | FabricImage>();

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

  const handleBackGroundColorChange = (e) => {
    canvas.backgroundColor = e.target.value;
    addLog({
      section: "arrange",
      tab: "background",
      event: "update",
      message: `cavnvas background color changed to ${e.target.value}`,
    });

    setBackgroundColor(e.target.value);
    canvas.renderAll();
  };

  const handleBackGroundImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (!file.type.startsWith("image/")) {
        alert("Please upload a valid image");
        return;
      }

      const backgroundImageUrl = URL.createObjectURL(file);

      const backgroundImage = new Image();
      backgroundImage.src = backgroundImageUrl;

      backgroundImage.onload = () => {
        const fabricBackgroundImage = new FabricImage(backgroundImage);

        const scaleX = image.getScaledWidth() / fabricBackgroundImage.width;

        const scaleY = image.getScaledHeight() / fabricBackgroundImage.height;

        fabricBackgroundImage.scaleX = scaleX;
        fabricBackgroundImage.scaleY = scaleY;

        canvas.backgroundImage = fabricBackgroundImage;
        canvas.renderAll();

        setBackgroundImage(fabricBackgroundImage);

        addLog({
          section: "arrange",
          tab: "background",
          event: "creation",
          message: `added background image to canvas`,
        });
      };
    }
  };

  const removeBackGroundImage = () => {
    addLog({
      section: "arrange",
      tab: "background",
      event: "reset",
      message: `background removed from canvas`,
    });

    if (backgroundImage) {
      canvas.backgroundImage = null;
      canvas.renderAll();
      setBackgroundImage(null);
    }
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

      <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription className="text-center">
              Canvas BackGround
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between gap-2">
                <label
                  htmlFor="color_picker"
                  className="text-sm text-slate-400 mt-2"
                >
                  Color
                </label>
                <Input
                  className="w-[25%] border-none cursor-pointer rounded"
                  id="color_picker"
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => {
                    handleBackGroundColorChange(e);
                  }}
                />
              </div>
              <div>
                <Label
                  htmlFor="background-image"
                  className="custom-button w-full"
                >
                  Add Image
                </Label>
                <Input
                  id="background-image"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleBackGroundImageChange}
                />
              </div>
              <div>
                <button
                  className="custom-button w-full"
                  onClick={removeBackGroundImage}
                >
                  Remove Image
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Arrange;
