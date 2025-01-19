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

import { Canvas, FabricImage, Rect, Circle, Triangle, Ellipse } from "fabric";
import { useEffect, useState } from "react";
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";
import { useLogContext } from "@/hooks/useLogContext";

type Props = {
  canvas: Canvas;
  image: FabricImage;
};

const CropSidebar = ({ canvas, image }: Props) => {
  const { addLog } = useLogContext();
  const { selectedObject, setSelectedObject } = useCanvasObjects();
  const [cropHeight, setCropHeight] = useState("0");
  const [cropWidth, setCropWidth] = useState("0");

  // Helper function to create shapes
  const getShape = (shapeType: string) => {
    const stroke_color = "red";
    const stroke_width = 1;
    const stroke_array = [5, 5];
    const frameName = `Frame ${
      canvas.getObjects(shapeType).length + 1
    } shapeType`;
    console.log(frameName);
    if (shapeType === "circle") {
      return new Circle({
        top: 100,
        left: 50,
        radius: 50,
        fill: null,
        stroke: stroke_color,
        strokeWidth: stroke_width,
        strokeDashArray: stroke_array,
        name: frameName,
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
        name: frameName,
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
        name: frameName,
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
        name: frameName,
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
        name: frameName,
      });
    }
  };

  useEffect(() => {
    const handleObjectCleared = () => {
      addLog("Deselected and removed shape for clipping");
      if (image.clipPath) {
        addLog("Removed clipping");
        image.clipPath = null; // Remove the clipping path
      }
      setSelectedObject(null);
    };

    const handleObjectCreated = () => {
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

    const handleObjectUpdated = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        const objectName = activeObject.type || "Unknown Object";
        addLog(`Updated object: ${objectName}`);
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

    const handleObjectModified = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        const objectName = activeObject.type || "Unknown Object";
        addLog(`Modified object: ${objectName}`);
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

    const handleObjectScaled = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        const objectName = activeObject.type || "Unknown Object";
        const scaleX = activeObject.scaleX?.toFixed(2) || "N/A";
        const scaleY = activeObject.scaleY?.toFixed(2) || "N/A";

        addLog(
          `Scaled selected object: ${objectName}. scaleX changed to ${scaleX}, scaleY changed to ${scaleY}`
        );

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

    canvas.on("selection:created", handleObjectCreated);
    canvas.on("selection:updated", handleObjectUpdated);
    canvas.on("selection:cleared", handleObjectCleared);
    canvas.on("object:modified", handleObjectModified);
    canvas.on("object:scaling", handleObjectScaled);

    const imgWidth = image.width;
    const imgHeight = image.height;

    setCropHeight(Math.floor(imgHeight).toString());
    setCropWidth(Math.floor(imgWidth).toString());

    return () => {
      if (!image.clipPath) {
        canvas.getObjects().forEach((obj) => {
          if (obj.name?.startsWith("Frame")) {
            addLog("Removed unused clipped shape");
            canvas.remove(obj);
          }
        });
        canvas.renderAll();
      }

      canvas.off("selection:created", handleObjectCreated);
      canvas.off("selection:updated", handleObjectUpdated);
      canvas.off("selection:cleared", handleObjectCleared);
      canvas.off("object:modified", handleObjectModified);
      canvas.off("object:scaling", handleObjectScaled);
    };
  }, [canvas]);

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
    addLog("created and selected shape " + shapeType + " for clipping");
    const shape = getShape(shapeType);
    canvas.add(shape);
    canvas.setActiveObject(shape); // Set the newly added shape as the active object
    setSelectedObject(shape);
    canvas.renderAll();
  };

  // Function to apply clipping
  const handleShapeClip = () => {
    if (selectedObject) {
      addLog("Applying clipping according to selected shape");
      selectedObject.absolutePositioned = true; // Required for proper clipping
      image.clipPath = selectedObject;
      canvas.renderAll();
    }
  };

  // Reset clipping
  const resetClip = () => {
    if (image.clipPath && selectedObject) {
      addLog("Reseted clipping");
      image.clipPath = null; // Remove the clipping path
      canvas.remove(selectedObject);
      canvas.renderAll();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full gap-4">
      {/* <div className="w-[90%]">
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
      </div> */}

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
            <button className="w-full custom-button" onClick={handleShapeClip}>
              CUT
            </button>
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
              {/* <Button className="text-sm md:text-sm">Invert Cutout</Button> */}
              <button className="custom-button w-full" onClick={resetClip}>
                Reset Cutout
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CropSidebar;
