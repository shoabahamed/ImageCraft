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
import { Canvas } from "fabric";

type ImageSizeProps = {
  canvas: Canvas;
  initialWidth: number;
  initialHeight: number;
};

const ImageSize = ({ canvas, initialWidth, initialHeight }: ImageSizeProps) => {
  const [imageHeight, setImageHeight] = useState(initialHeight);
  const [imageWidth, setImageWidth] = useState(initialWidth);

  useEffect(() => {
    if (canvas) {
      canvas.setWidth(imageWidth);
      canvas.setHeight(imageHeight);
      canvas.renderAll();
    }
  }, [imageWidth, imageHeight, canvas]);

  const handleWidthChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setImageWidth(value);
    }
  };
  const handleHeightChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setImageHeight(value);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardDescription>Image Size</CardDescription>
      </CardHeader>
      <CardContent className="w-full">
        <div className="flex flex-col w-full gap-3  items-center justify-center">
          <div className="grid grid-cols-2  items-center justify-center">
            <Label htmlFor="height">Height</Label>
            <Input
              id="height"
              type="number"
              name="height"
              value={imageHeight}
              onChange={handleHeightChange}
            />
          </div>
          <div className="grid grid-cols-2  items-center justify-center">
            <Label htmlFor="width">Width</Label>
            <Input
              id="width"
              type="number"
              name="width"
              value={imageWidth}
              onChange={handleWidthChange}
            />
          </div>

          <Button>Interactive</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageSize;
