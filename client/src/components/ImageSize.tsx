import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Canvas, FabricImage } from "fabric";
import { Switch } from "./ui/switch";
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";
import { useLogContext } from "@/hooks/useLogContext";

type ImageSizeProps = {
  canvas: Canvas;
  image: FabricImage;
};

const ImageSize = ({ canvas, image }: ImageSizeProps) => {
  const { currentImageDim, setCurrentImageDim } = useCanvasObjects();
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const { addLog } = useLogContext();

  const handleWidthChange = (e) => {
    const newWidth = parseInt(e.target.value);
    const oldHeight = image.height;
    const oldWidth = image.width;
    if (newWidth > 0) {
      if (maintainAspectRatio) {
        const ratio = oldWidth / oldHeight;
        const newHeight = Math.floor(newWidth / ratio);
        setCurrentImageDim({ imageHeight: newHeight, imageWidth: newWidth });
        addLog({
          section: "arrange",
          tab: "image size",
          event: "update",
          message: `image height change to ${newHeight} width changed to ${newWidth}`,
          param: "image size",
          objType: "image",
        });
      } else {
        setCurrentImageDim({ ...currentImageDim, imageWidth: newWidth });
        addLog({
          section: "arrange",
          tab: "image size",
          event: "update",
          message: `image width changed to ${newWidth}`,
          param: "image size",
          objType: "image",
        });
      }
    }
  };
  const handleHeightChange = (e) => {
    const newHeight = parseInt(e.target.value);
    const oldHeight = image.height;
    const oldWidth = image.width;
    if (newHeight > 0) {
      if (maintainAspectRatio) {
        const ratio = oldWidth / oldHeight;
        const newWidth = Math.floor(newHeight * ratio);
        setCurrentImageDim({ imageHeight: newHeight, imageWidth: newWidth });
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
        setCurrentImageDim({ ...currentImageDim, imageHeight: newHeight });
      }
    }
  };

  const handleImageResizeReset = () => {
    setCurrentImageDim({ imageHeight: image.width, imageWidth: image.width });
    addLog({
      section: "arrange",
      tab: "image size",
      event: "update",
      message: `image height & width changed to default value`,
      param: "image size",
      objType: "image",
    });
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
                type="number"
                name="height"
                value={currentImageDim.imageHeight}
                onChange={handleHeightChange}
              />
            </div>
            <div className="grid grid-cols-2  items-center justify-center">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="number"
                name="width"
                value={currentImageDim.imageWidth}
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
          <button className="custom-button" onClick={handleImageResizeReset}>
            Reset
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageSize;
