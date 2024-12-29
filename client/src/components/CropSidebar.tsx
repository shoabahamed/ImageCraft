import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import IconComponent from "./icon-component";

import {
  Square,
  Blend,
  Triangle as IconTriangle,
  Circle as IconCircle,
} from "lucide-react";

import {
  Canvas,
  FabricImage,
  Rect,
  Circle,
  Triangle,
  Ellipse,
  Object,
} from "fabric";
import { useEffect, useState } from "react";

type Props = {
  canvas: Canvas;
  image: FabricImage;
};

const CropSidebar = ({ canvas, image }: Props) => {
  const [selectedObject, setSelectedObject] = useState<Object | null>(null);
  const [cropHeight, setCropHeight] = useState("0");
  const [cropWidth, setCropWidth] = useState("0");

  // Helper function to create shapes
  const getShape = (shapeType: string) => {
    const stroke_color = "red";
    const stroke_width = 1;
    const stroke_array = [5, 5];
    if (shapeType === "circle") {
      return new Circle({
        top: 100,
        left: 50,
        radius: 50,
        fill: null,
        stroke: stroke_color,
        strokeWidth: stroke_width,
        strokeDashArray: stroke_array,
      });
    } else if (shapeType === "rect") {
      return new Rect({
        top: 100,
        left: 50,
        width: 100,
        height: 60,
        fill: null,
        stroke: stroke_color,
        strokeWidth: stroke_width,
        strokeDashArray: stroke_array,
      });
    } else if (shapeType === "triangle") {
      return new Triangle({
        left: 10,
        top: 10,
        width: 60,
        height: 60,
        fill: null,
        stroke: stroke_color,
        strokeWidth: stroke_width,
        strokeDashArray: stroke_array,
      });
    } else if (shapeType === "elipse") {
      return new Ellipse({
        left: 50,
        top: 50,
        rx: 50,
        ry: 30,
        fill: null,
        stroke: stroke_color,
        strokeWidth: stroke_width,
        strokeDashArray: stroke_array,
      });
    } else {
      return new Rect({
        top: 100,
        left: 50,
        width: 100,
        height: 60,
        fill: null,
        stroke: stroke_color,
        strokeWidth: stroke_width,
        strokeDashArray: stroke_array,
      });
    }
  };

  useEffect(() => {
    const handleObjectCleared = () => {
      setSelectedObject(null);
    };

    const handleObjectSelected = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        setSelectedObject(activeObject);
        if (activeObject.cropRect != undefined) {
          const newWidth = Math.floor(
            activeObject.width! * activeObject.scaleX!
          );
          const newHeight = Math.floor(
            activeObject.height! * activeObject.scaleY!
          );

          setCropWidth(newWidth.toString());
          setCropHeight(newHeight.toString());
        }
      }
    };

    canvas.on("selection:created", handleObjectSelected);
    canvas.on("selection:updated", handleObjectSelected);
    canvas.on("selection:cleared", handleObjectCleared);
    canvas.on("object:modified", handleObjectSelected);
    canvas.on("object:scaling", handleObjectSelected);

    const imgWidth = image.width;
    const imgHeight = image.height;

    setCropHeight(Math.floor(imgHeight).toString());
    setCropWidth(Math.floor(imgWidth).toString());

    return () => {
      canvas.off("selection:created", handleObjectSelected);
      canvas.off("selection:updated", handleObjectSelected);
      canvas.off("selection:cleared", handleObjectCleared);
      canvas.off("object:modified", handleObjectSelected);
      canvas.off("object:scaling", handleObjectSelected);
    };
  }, [canvas]);

  // add crop handler
  // Add crop handler to precisely surround the canvas
  const addCropHandler = () => {
    if (selectedObject) {
      image.clipPath = null; // Remove the clipping path
      canvas.remove(selectedObject);
    }

    // Get actual canvas dimensions
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();

    // Create a rectangle exactly surrounding the canvas
    const cropRect = new Rect({
      top: 0, // Start at the top-left corner
      left: 0,
      width: canvasWidth, // Match canvas width
      height: canvasHeight, // Match canvas height
      fill: "000",
      opacity: 0.5,
      stroke: "#00ff00",
      strokeWidth: 5, // Border thickness
      selectable: true, // Allow selection
      lockMovementX: true, // Lock horizontal movement
      lockMovementY: true, // Lock vertical movement
      lockRotation: true, // Prevent rotation
      hasControls: true, // Allow resizing/scaling
      lockScalingFlip: true, // Prevent scaling to flip
    });

    cropRect.set({ cropRect: true });

    // Add the crop rectangle to the canvas
    canvas.add(cropRect);
    canvas.setActiveObject(cropRect);
    canvas.renderAll();
  };

  // Function to add shapes to the canvas
  const addShape = (shapeType: string) => {
    if (selectedObject) {
      image.clipPath = null; // Remove the clipping path
      canvas.remove(selectedObject);
    }
    const shape = getShape(shapeType);
    canvas.add(shape);
    canvas.setActiveObject(shape); // Set the newly added shape as the active object
    setSelectedObject(shape);
    canvas.renderAll();
  };

  // Function to apply clipping
  const handleShapeClip = () => {
    if (selectedObject) {
      selectedObject.absolutePositioned = true; // Required for proper clipping
      image.clipPath = selectedObject;
      canvas.renderAll();
    }
  };

  // Reset clipping
  const resetClip = () => {
    if (image.clipPath && selectedObject) {
      image.clipPath = null; // Remove the clipping path
      canvas.remove(selectedObject);
      canvas.renderAll();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full gap-4">
      <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription>Crop</CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            <div className="flex flex-col w-full gap-3 items-center justify-center">
              <div className="grid grid-cols-2 justify-center items-center">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  type="number"
                  name="height"
                  value={cropHeight}
                  onChange={(e) => setCropHeight(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2  justify-center items-center">
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  type="number"
                  name="width"
                  value={cropWidth}
                  onChange={(e) => setCropWidth(e.target.value)}
                />
              </div>
              <Button onClick={addCropHandler} className="w-full">
                Start Cropping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription>Shape</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <IconComponent
                icon={<IconCircle />}
                iconName="Circle"
                handleClick={() => addShape("circle")}
              />
              <IconComponent
                icon={<Square />}
                iconName="Rect"
                handleClick={() => addShape("rect")}
              />
              <IconComponent
                icon={<IconTriangle />}
                iconName="Triangle"
                handleClick={() => addShape("triangle")}
              />
              <IconComponent
                icon={<Blend />}
                iconName="Ellipse"
                handleClick={() => addShape("elipse")}
              />
            </div>
            <Button className="w-full" onClick={handleShapeClip}>
              CUT
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription>Mode</CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            <div className="flex flex-col gap-3 justify-center">
              <Button className="text-sm md:text-sm">Invert Cutout</Button>
              <Button onClick={resetClip}>Reset Cutout</Button>
              <Button>Reset Crop</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CropSidebar;
