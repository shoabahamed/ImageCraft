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
import {
  base64ToFile,
  getCanvasDataUrl,
  getRotatedBoundingBox,
} from "@/utils/commonFunctions";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/utils/appClient";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useAdjustStore } from "@/hooks/appStore/AdjustStore";

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
    imageRef.current.angle = rotationValue;
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

      {imageRef.current && (
        <div className="w-[90%]">
          <ImageSize canvas={canvas} image={imageRef.current} />
        </div>
      )}

      <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription>Super Resolution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <button
                className="custom-button"
                onClick={() => handleSuperResolution(2)}
              >
                2X Using AI
              </button>

              <button
                className="custom-button"
                onClick={() => handleSuperResolution(2)}
              >
                4X Using AI
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Arrange;
