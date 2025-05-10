import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import IconComponent from "./icon-component";

import {
  Image as ImageIcon,
  Facebook,
  Instagram,
  MonitorPlay,
  InspectionPanel,
  Twitter,
} from "lucide-react";

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

type AspectRatioType = {
  ratio: string;
  value: string;
  icon: JSX.Element;
};

const CropSidebar = ({ canvas, image }: Props) => {
  const { addLog } = useLogContext();
  const { selectedObject, setSelectedObject, selectedRatio, setSelectedRatio } =
    useCanvasObjects();
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [backgroundImage, setBackgroundImage] = useState<null | FabricImage>();

  useEffect(() => {
    const frameObject = canvas
      .getObjects()
      .find((obj) => obj.name?.toLowerCase().startsWith("frame"));

    if (frameObject) {
      canvas.setActiveObject(frameObject);
      setSelectedObject(frameObject);
    }

    return () => {
      const frameObject = canvas
        .getObjects()
        .find((obj) => obj.name?.toLowerCase().startsWith("frame"));

      if (frameObject && image.clipPath) {
        frameObject.selectable = false;
        canvas.discardActiveObject();
        setSelectedObject(null);

        canvas.requestRenderAll();
      } else if (frameObject) {
        addLog({
          section: "crop&cut",
          tab: "cut",
          event: "deletion",
          message: `deleted unused shape ${frameObject.type}`,
          objType: frameObject.type,
        });

        canvas.remove(frameObject);
        canvas.renderAll();
      }
    };
  }, [canvas, image]);

  // Helper function to create shapes
  const getShape = (shapeType: string) => {
    let width, height, baseSize;
    const stroke_color = "red";
    // const stroke_width = 1;
    const stroke_array = [10, 10];
    const frameName = `Frame ${
      canvas.getObjects(shapeType).length + 1
    } shapeType`;

    // Get image dimensions
    const imgWidth = image.getScaledWidth();
    const imgHeight = image.getScaledHeight();

    const maxWidth = imgWidth * 0.8;
    const maxHeight = imgHeight * 0.8;

    if (selectedRatio.value === "original") {
      // Use image's native aspect ratio
      width = maxWidth;
      height = maxHeight;
      baseSize = Math.min(maxWidth, maxHeight);
    } else {
      // Parse selected ratio
      const [ratioW, ratioH] = selectedRatio.value.split(":").map(Number);
      const targetAspect = ratioW / ratioH;
      const containerAspect = maxWidth / maxHeight;

      // Calculate dimensions to maintain aspect ratio
      if (targetAspect >= containerAspect) {
        width = maxWidth;
        baseSize = maxWidth;
        height = width / targetAspect;
      } else {
        height = maxHeight;
        baseSize = maxHeight;
        width = height * targetAspect;
      }
    }

    if (shapeType === "circle") {
      return new Circle({
        top: image.top,
        left: image.left,
        originX: "center",
        originY: "center",
        radius: baseSize * 0.5,
        fill: null,
        stroke: stroke_color,
        strokeWidth: baseSize * 0.01,
        strokeDashArray: stroke_array,

        name: frameName,
      });
    } else if (shapeType === "rect") {
      return new Rect({
        top: image.top,
        left: image.left,
        originX: "center",
        originY: "center",
        width: width,
        height: height,
        fill: null,
        stroke: stroke_color,
        strokeWidth: baseSize * 0.01,
        strokeDashArray: stroke_array,
        name: frameName,
      });
    } else if (shapeType === "triangle") {
      return new Triangle({
        top: image.top,
        left: image.left,
        originX: "center",
        originY: "center",
        width: width,
        height: height,
        fill: null,
        stroke: stroke_color,
        strokeWidth: baseSize * 0.01,
        strokeDashArray: stroke_array,
        name: frameName,
      });
    } else if (shapeType === "elipse") {
      return new Ellipse({
        top: image.top,
        left: image.left,
        originX: "center",
        originY: "center",
        rx: width * 0.4,
        ry: height * 0.4,
        fill: null,
        stroke: stroke_color,
        strokeWidth: baseSize * 0.01,
        strokeDashArray: stroke_array,
        name: frameName,
      });
    } else {
      return new Rect({
        top: image.top,
        left: image.left,
        originX: "center",
        originY: "center",
        width: width,
        height: height,
        fill: null,
        stroke: stroke_color,
        strokeWidth: baseSize * 0.01,
        strokeDashArray: stroke_array,
        name: frameName,
      });
    }
  };

  // Function to add shapes to the canvas
  const addShape = (shapeType: string) => {
    if (selectedObject) {
      // TODO: add log here

      // TODO: add log here

      image.clipPath = null; // Remove the clipping path
      canvas.remove(selectedObject);
    }

    const shape = getShape(shapeType);

    const frameObject = canvas
      .getObjects()
      .find((obj) => obj.name?.toLowerCase().startsWith("frame"));

    if (frameObject) {
      canvas.remove(frameObject);
    }

    canvas.add(shape);
    canvas.setActiveObject(shape); // Set the newly added shape as the active object
    setSelectedObject(shape);
    setSelectedObject(shape);
    canvas.renderAll();

    addLog({
      section: "crop&cut",
      tab: "cut",
      event: "creation",
      message: "created and selected shape " + shape.type + " for clipping",
      objType: shape.type,
    });
  };

  const handleAspectRatioChange = (ratio: AspectRatioType) => {
    setSelectedRatio(ratio);

    const frameObject = canvas
      .getObjects() // @ts-ignore
      .find((obj) => obj.name?.toLowerCase().startsWith("frame"));

    if (!frameObject) return;

    let width, height, baseSize;

    // Get image dimensions
    const imgWidth = image.getScaledWidth();
    const imgHeight = image.getScaledHeight();

    const maxWidth = imgWidth * 0.8;
    const maxHeight = imgHeight * 0.8;

    if (ratio.value === "original") {
      // Use image's native aspect ratio
      width = maxWidth;
      height = maxHeight;
      baseSize = Math.min(maxWidth, maxHeight);
    } else {
      // Parse selected ratio
      const [ratioW, ratioH] = ratio.value.split(":").map(Number);
      const targetAspect = ratioW / ratioH;
      const containerAspect = maxWidth / maxHeight;

      // Calculate dimensions to maintain aspect ratio
      if (targetAspect >= containerAspect) {
        console.log("target is bigger");
        width = maxWidth;
        baseSize = maxWidth;
        height = width / targetAspect;
      } else {
        height = maxHeight;
        baseSize = maxHeight;
        width = height * targetAspect;
      }
    }

    const shapeType = frameObject.type;

    if (shapeType === "circle") {
      frameObject.set({
        radius: width * 0.5,
        strokeWidth: baseSize * 0.01,
      });
    } else if (shapeType === "rect") {
      frameObject.set({
        width: width,
        height: height,
        strokeWidth: baseSize * 0.01,
      });
    } else if (shapeType === "triangle") {
      frameObject.set({
        width: width,
        height: height,
        strokeWidth: baseSize * 0.01,
      });
    } else if (shapeType === "elipse") {
      frameObject.set({
        rx: width * 0.4,
        ry: height * 0.4,
        strokeWidth: baseSize * 0.01,
      });
    }

    frameObject.setCoords(); // Update the object's coordinates
    canvas.renderAll();
    canvas.fire("object:modified"); // Trigger the object:modified

    const [ratioW, ratioH] = ratio.value.split(":").map(Number);
    addLog({
      section: "crop&cut",
      tab: "aspect",
      event: "update",
      message: `Changed aspect ratio to ${ratioW}:${ratioH}`,
    });
  };

  // Function to apply clipping
  const handleShapeClip = () => {
    const frameObject = canvas
      .getObjects() // @ts-ignore
      .find((obj) => obj.name?.startsWith("Frame"));

    if (frameObject) {
      addLog({
        section: "crop&cut",
        tab: "cut",
        event: "update",
        message: `applied ${frameObject.type} to cut the image`,
        objType: frameObject.type,
      });

      canvas.setActiveObject(frameObject);
      setSelectedObject(frameObject);
      frameObject.absolutePositioned = true; // Required for proper clipping
      image.clipPath = frameObject;

      canvas.renderAll();

      canvas.fire("object:modified");
    }
  };

  // Reset clipping
  const resetClip = () => {
    if (image.clipPath) {
      const frameObject = canvas
        .getObjects() // @ts-ignore
        .find((obj) => obj.name?.startsWith("Frame"));

      addLog({
        section: "crop&cut",
        tab: "cut",
        event: "reset",
        message: `removed clipping and deleted ${frameObject.type} object`,
        objType: frameObject.type,
      });

      image.clipPath = null; // Remove the clipping path
      canvas.remove(frameObject);
      canvas.renderAll();
    }
  };

  // const handleBackGroundColorChange = (e) => {
  //   canvas.backgroundColor = e.target.value;
  //   addLog({
  //     section: "crop&cut",
  //     tab: "background",
  //     event: "update",
  //     message: `cavnvas background color changed to ${e.target.value}`,
  //   });

  //   setBackgroundColor(e.target.value);
  //   canvas.renderAll();
  // };

  // const handleBackGroundImageChange = async (
  //   e: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   if (e.target.files && e.target.files.length > 0) {
  //     const file = e.target.files[0];

  //     if (!file.type.startsWith("image/")) {
  //       alert("Please upload a valid image");
  //       return;
  //     }

  //     // Convert the file to Base64
  //     const base64Image = await convertFileToBase64(file);

  //     // Create an Image object
  //     const backgroundImage = new Image();
  //     backgroundImage.src = base64Image;

  //     backgroundImage.onload = () => {
  //       const fabricBackgroundImage = new FabricImage(backgroundImage);

  //       // Scale the background image to fit the canvas dimensions
  //       const scaleX = image.getScaledWidth() / fabricBackgroundImage.width;
  //       const scaleY = image.getScaledHeight() / fabricBackgroundImage.height;

  //       fabricBackgroundImage.scaleX = scaleX;
  //       fabricBackgroundImage.scaleY = scaleY;

  //       // Set the background image (now using Base64)
  //       canvas.backgroundImage = fabricBackgroundImage;
  //       canvas.renderAll();

  //       setBackgroundImage(fabricBackgroundImage);

  //       addLog({
  //         section: "crop&cut",
  //         tab: "background",
  //         event: "creation",
  //         message: `added background image to canvas`,
  //       });
  //     };
  //   }
  // };

  // Helper function to convert File to Base64
  // const convertFileToBase64 = (file: File): Promise<string> => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(file);
  //     reader.onload = () => resolve(reader.result as string);
  //     reader.onerror = (error) => reject(error);
  //   });
  // };

  // const removeBackGroundImage = () => {
  //   addLog({
  //     section: "crop&cut",
  //     tab: "background",
  //     event: "reset",
  //     message: `background removed from canvas`,
  //   });

  //   if (canvas.backgroundImage) {
  //     canvas.backgroundImage = null;
  //     canvas.renderAll();
  //     setBackgroundImage(null);
  //   }
  // };

  const ASPECT_RATIOS = [
    {
      ratio: "Original",
      value: "original",
      icon: <ImageIcon className="w-5 h-5" />,
    },
    {
      ratio: "1:1",
      value: "1:1",
      icon: <Square className="w-5 h-5" />,
    },
    {
      ratio: "4:5",
      value: "4:5",
      icon: <Instagram className="w-5 h-5" />,
    },
    {
      ratio: "9:16",
      value: "9:16",
      icon: <Facebook className="w-5 h-5" />,
    },
    {
      ratio: "16:9",
      value: "16:9",
      icon: <MonitorPlay className="w-5 h-5" />,
    },
    {
      ratio: "2:1",
      value: "2:1",
      icon: <Twitter className="w-5 h-5" />,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full gap-4">
      <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription>Shape</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-4 gap-4">
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
            <CardDescription className="flex items-center gap-2 text-base font-medium">
              <InspectionPanel className="w-4 h-4" />
              Aspect Ratio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.value}
                  onClick={() => handleAspectRatioChange(ratio)}
                  className={`
        flex flex-col items-center justify-center p-1 rounded-sm border gap-1
        transition-all duration-200
        ${
          selectedRatio.value === ratio.value
            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
        }
      `}
                >
                  <div
                    className={`
          p-2 rounded-md
          ${
            selectedRatio.value === ratio.value
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-600 dark:text-gray-400"
          }
        `}
                  >
                    {ratio.icon}
                  </div>
                  <span
                    className={`
          text-xs font-medium
          ${
            selectedRatio.value === ratio.value
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-600 dark:text-gray-400"
          }
        `}
                  >
                    {ratio.ratio}
                  </span>
                </button>
              ))}
            </div>
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
                Reset Crop
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CropSidebar;
