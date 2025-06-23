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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLogContext } from "@/hooks/useLogContext";
import ImageSize from "./ImageSize";
import { useArrangeStore } from "@/hooks/appStore/ArrangeStore";
import { Slider } from "./ui/slider";
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";
import {
  base64ToFile,
  getCanvasDataUrl,
  getRotatedBoundingBox,
} from "@/utils/commonFunctions";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/utils/appClient";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useAdjustStore } from "@/hooks/appStore/AdjustStore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const presetColors = [
  // Grays
  { color: "#ffffff", name: "White" },
  { color: "#e2e8f0", name: "Light Gray" },
  { color: "#94a3b8", name: "Gray" },
  { color: "#475569", name: "Dark Gray" },
  // Blues
  { color: "#93c5fd", name: "Light Blue" },
  { color: "#3b82f6", name: "Blue" },
  { color: "#1d4ed8", name: "Dark Blue" },
  // Greens
  { color: "#86efac", name: "Light Green" },
  { color: "#22c55e", name: "Green" },
  { color: "#15803d", name: "Dark Green" },
  // Reds
  { color: "#fca5a5", name: "Light Red" },
  { color: "#ef4444", name: "Red" },
  { color: "#b91c1c", name: "Dark Red" },
  // Purples
  { color: "#d8b4fe", name: "Light Purple" },
  { color: "#a855f7", name: "Purple" },
  { color: "#7e22ce", name: "Dark Purple" },
  // Oranges
  { color: "#fdba74", name: "Light Orange" },
  { color: "#f97316", name: "Orange" },
  { color: "#c2410c", name: "Dark Orange" },
  // Teals
  { color: "#5eead4", name: "Light Teal" },
  { color: "#14b8a6", name: "Teal" },
  { color: "#0f766e", name: "Dark Teal" },
];

type ArrangeProps = {
  canvas: Canvas;
  imageRef: React.RefObject<FabricImage>;
  setSpinnerLoading: (loading: boolean) => void;
};

const Arrange = ({ canvas, imageRef, setSpinnerLoading }: ArrangeProps) => {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const { addLog } = useLogContext();
  const flipX = useArrangeStore((state) => state.flipX);
  const flipY = useArrangeStore((state) => state.flipY);
  const imageRotation = useArrangeStore((state) => state.imageRotation);
  const setFlipX = useArrangeStore((state) => state.setFlipX);
  const setFlipY = useArrangeStore((state) => state.setFlipY);
  const setImageRotation = useArrangeStore((state) => state.setImageRotation);
  const { setDownloadImageDimensions, downloadImageDimensionsRef } =
    useCanvasObjects();
  const { setFinalImageDimensions, disableSavingIntoStackRef } =
    useCanvasObjects();

  const resetFilters = useAdjustStore((state) => state.resetFilters);

  const [backendImage, setBackendImage] = useState<null | string>(null);

  const backgroundColor = useArrangeStore((state) => state.backgroundColor);
  const setBackgroundColor = useArrangeStore(
    (state) => state.setBackgroundColor
  );

  const handleFlipX = (flipX: boolean) => {
    setFlipX(flipX);

    imageRef.current.set({
      flipX: flipX,
    });

    canvas.renderAll();
    canvas.fire("object:modified");
  };

  const handleFlipY = (flipY: boolean) => {
    setFlipY(flipY);

    imageRef.current.set({
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

    const bounds = getRotatedBoundingBox(imageRef.current);

    setDownloadImageDimensions({
      imageHeight: bounds.height,
      imageWidth: bounds.width,
    });

    downloadImageDimensionsRef.current = {
      imageHeight: bounds.height,
      imageWidth: bounds.width,
    };

    const canvasRect = canvas
      .getObjects() // @ts-ignore
      .find((obj) => obj.name?.startsWith("canvasRect"));

    // Restore zoom & transform
    canvas.setViewportTransform(originalViewportTransform);
    canvas.setZoom(originalZoom);
    canvas
      .getObjects() // @ts-ignore
      .find((obj) => obj.setCoords());

    canvasRect.set({
      width: bounds.width,
      height: bounds.height,
    });
    canvas.requestRenderAll();
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
    imageRef.current.angle = rotationValue;
    canvas.renderAll();

    handleRenderingFinalDimension();
  };

  const handlePresetRotation = (value: number) => {
    addLog({
      section: "arrange",
      tab: "rotation",
      event: "update",
      message: `rotation value changed from  ${imageRotation} to ${value}`,
      value: `${value}`,
      objType: "canvas",
    });

    setImageRotation(value);
    imageRef.current.angle = value;
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

    imageRef.current.set({
      flipX: false,
      flipY: false,
    });

    setImageRotation(0);
    imageRef.current.angle = 0;
    canvas.renderAll();

    handleRenderingFinalDimension();
  };

  const replaceImage = (base64Image: string) => {
    if (!canvas || !imageRef.current) return;

    FabricImage.fromURL(base64Image).then((img) => {
      if (!img || !imageRef.current) return;
      // Replace the image content

      imageRef.current.setElement(img.getElement());

      imageRef.current.scaleX = 1;
      imageRef.current.scaleY = 1;

      imageRef.current.flipX = false;
      imageRef.current.flipY = false;
      console.log("dj");
      setFlipX(false);
      setFlipY(false);
      setFinalImageDimensions({
        imageWidth: img.width,
        imageHeight: img.height,
      });

      resetFilters();

      handleRenderingFinalDimension();

      // Refresh canvas
      imageRef.current.setCoords();

      setTimeout(() => {
        disableSavingIntoStackRef.current = false;
        setSpinnerLoading(false);
        canvas.fire("object:modified");
        canvas.requestRenderAll();
      }, 1000);
    });

    canvas.getObjects().forEach(function (obj) {
      if (obj.type.toLowerCase() !== "image") {
        canvas.remove(obj);
      }
    });
    canvas.requestRenderAll();
  };

  const handleSuperResolution = async (scale: number) => {
    addLog({
      section: "arrange",
      tab: "super-resolution",
      event: "update",
      message: `canvas super resolution set to ${scale}x`,
      param: "super-resolution",
      objType: "image",
    });

    try {
      setSpinnerLoading(true);
      const formData = new FormData();

      const canvasImageBase64 = getCanvasDataUrl(
        canvas,
        imageRef.current,
        false,
        true
      );

      const originalImageFile = base64ToFile(canvasImageBase64, "image");
      formData.append("originalImage", originalImageFile);

      formData.append("scale", scale.toString());

      const response = await apiClient.post("/image_proc/super_res", formData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (response.status === 200) {
        disableSavingIntoStackRef.current = true;
        // setUploadedImage("");
        const base64Image = `data:image/png;base64,${response.data.image}`;
        // const base64Image =response.data.image
        setBackendImage(base64Image);
        replaceImage(base64Image);
        toast({
          description: "Successfull",
          className: "bg-green-500 text-gray-900",
          duration: 3000,
        });
      } else {
        setSpinnerLoading(false);
        toast({
          variant: "destructive",
          description: "Error Encountered inference",
          className: "bg-green-500 text-gray-900",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error sending image to backend:", error);
    }
  };

  const handleBackgroundColorChange = (
    color: string,
    fireModified: boolean
  ) => {
    setBackgroundColor(color);
    const canvasRect = canvas
      .getObjects() // @ts-ignore
      .find((obj) => obj.name?.startsWith("canvasRect"));

    if (canvasRect) {
      canvasRect.set({
        fill: color,
      });
      canvas.requestRenderAll();
    }

    addLog({
      section: "arrange",
      tab: "background",
      event: "update",
      message: `background color changed to ${color}`,
      value: color,
      objType: "canvas",
    });

    if (fireModified) canvas.fire("object:modified");
  };

  const handleRemoveBackground = () => {
    if (backgroundColor !== "transparent") {
      setBackgroundColor("transparent");
      const canvasRect = canvas
        .getObjects() // @ts-ignore
        .find((obj) => obj.name?.startsWith("canvasRect"));

      if (canvasRect) {
        canvasRect.set({
          fill: "transparent",
        });
        canvas.requestRenderAll();
      }

      addLog({
        section: "arrange",
        tab: "background",
        event: "update",
        message: "background color removed",
        value: "transparent",
        objType: "canvas",
      });

      canvas.fire("object:modified");
    }
  };

  // const handleResetBackground = () => {
  //   setBackgroundColor("#00000000");
  //   const canvasRect = canvas
  //     .getObjects()
  //     .find((obj) => obj.name?.startsWith("canvasRect"));

  //   if (canvasRect) {
  //     canvasRect.set({
  //       fill: "transparent",
  //     });
  //     canvas.requestRenderAll();
  //   }

  //   addLog({
  //     section: "arrange",
  //     tab: "background",
  //     event: "reset",
  //     message: "background color reset to #111111",
  //     value: "#111111",
  //     objType: "canvas",
  //   });
  // };

  return (
    <div className="flex flex-col md:flex-col items-center justify-center w-full gap-4">
      <Tabs
        defaultValue="transform"
        className="w-full flex-1 flex flex-col rounded-none"
      >
        <div className="border-b border-gray-200 dark:border-gray-800">
          <TabsList className="w-full grid grid-cols-2 rounded-none">
            <TabsTrigger value="transform">Transform</TabsTrigger>
            <TabsTrigger value="enhance">Enhance</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="transform"
          className="w-full flex flex-col justify-center items-center space-y-2"
        >
          <div className="w-[90%]">
            <Card>
              <CardHeader>
                <CardDescription>Flip</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-4 gap-4">
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
                  <div className="grid grid-cols-4 gap-1">
                    {[0, 90, 180, 270].map((angle) => (
                      <button
                        key={angle}
                        onClick={() => handlePresetRotation(angle)}
                        className="
        aspect-square w-full
        bg-gray-100
        rounded-xl
        text-gray-600
        hover:bg-gray-200
        active:bg-gray-300
        transition-colors duration-50
        dark:bg-gray-800
        dark:text-gray-300
        dark:hover:bg-gray-700
        group
      "
                      >
                        <div className="flex items-center justify-center h-full">
                          <span className="text-sm font-medium group-hover:scale-103 transition-transform">
                            {angle}°
                          </span>
                        </div>
                      </button>
                    ))}
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
                      onValueCommit={() => {
                        canvas.fire("object:modified");
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
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-base font-medium">
                    Background
                  </CardDescription>
                  {/* <button
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    onClick={handleResetBackground}
                  >
                    Reset
                  </button> */}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative group">
                      <input
                        type="color"
                        className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700 bg-transparent transition-all duration-200 hover:scale-105 hover:shadow-sm"
                        value={
                          backgroundColor === "transparent"
                            ? "#00000000"
                            : backgroundColor
                        }
                        onChange={(e) =>
                          handleBackgroundColorChange(e.target.value, false)
                        }
                        onBlur={() => {
                          canvas.fire("object:modified");
                        }}
                      />
                      {backgroundColor === "transparent" && (
                        <div
                          className="absolute inset-0 rounded-lg pointer-events-none"
                          style={{
                            backgroundImage: `
                              linear-gradient(45deg, #ccc 25%, transparent 25%),
                              linear-gradient(-45deg, #ccc 25%, transparent 25%),
                              linear-gradient(45deg, transparent 75%, #ccc 75%),
                              linear-gradient(-45deg, transparent 75%, #ccc 75%)
                            `,
                            backgroundSize: "10px 10px",
                            backgroundPosition:
                              "0 0, 0 5px, 5px -5px, -5px 0px",
                          }}
                        />
                      )}
                      <div className="absolute inset-0 rounded-lg pointer-events-none border border-gray-200 dark:border-gray-700"></div>
                    </div>
                    <button
                      className="flex-1 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      onClick={handleRemoveBackground}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-8 gap-1.5">
                    {presetColors.map(({ color, name }) => (
                      <TooltipProvider key={color}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="group"
                              onClick={() =>
                                handleBackgroundColorChange(color, true)
                              }
                            >
                              <div
                                className="w-5 h-5 rounded-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:scale-110 hover:shadow-sm"
                                style={{ backgroundColor: color }}
                              />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {imageRef.current && (
            <div className="w-[90%]">
              <ImageSize canvas={canvas} image={imageRef.current} />
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="enhance"
          className="w-full flex flex-col justify-center items-center space-y-2"
        >
          <div className="w-[90%]">
            <Card>
              <CardHeader>
                <CardDescription className="text-lg font-medium">
                  AI Image Enhancement
                </CardDescription>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Increase your image resolution using advanced AI technology
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      className="group flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 hover:shadow-sm"
                      onClick={() => handleSuperResolution(2)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">
                            2x
                          </span>
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">2x Resolution</span>
                        </div>
                      </div>
                    </button>

                    <button
                      className="group flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 hover:shadow-sm"
                      onClick={() => handleSuperResolution(3)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="text-purple-600 dark:text-purple-400 font-semibold">
                            3x
                          </span>
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">3x Resolution</span>
                        </div>
                      </div>
                    </button>

                    <button
                      className="group flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 hover:shadow-sm"
                      onClick={() => handleSuperResolution(4)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">
                            4x
                          </span>
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">4x Resolution</span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Arrange;
