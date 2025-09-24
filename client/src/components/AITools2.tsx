import React, { useState, useEffect } from "react";
import apiClient from "@/utils/appClient";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Canvas, FabricImage } from "fabric";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useLogContext } from "@/hooks/useLogContext";
import CustomSlider from "./custom-slider";
import { ToastAction } from "./ui/toast";
import {
  base64ToFile,
  getCanvasDataUrl,
  urlToFile,
} from "@/utils/commonFunctions";
import { useAdjustStore } from "@/hooks/appStore/AdjustStore";
import { useCommonProps } from "@/hooks/appStore/CommonProps";
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";
import { useArrangeStore } from "@/hooks/appStore/ArrangeStore";
import axios from "axios";
import { Crown } from "lucide-react";

// TODO: ability to restore original image after style transfer
// TODO: everything works right now but for some reason filters are not updated from the get go when switching images if the the canvas was loaded from database

type Props = {
  canvas: Canvas;
  imageRef: React.RefObject<FabricImage>;
  imageUrl: string;
  setLoadSate: (value: boolean) => void;
};

type StyleTemplate = {
  image_id: string;
  image_url: string;
  image_name: string;
};

const AITools2 = ({ canvas, imageUrl, imageRef, setLoadSate }: Props) => {
  const { addLog } = useLogContext();
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [openStylizeImage, setOpenStylizeImage] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<null | string>();
  const [backendImage, setBackendImage] = useState<null | string>(null);
  const [showImageAddButton, setShowImageAddButton] = useState(false);
  const [styleImages, setStyleImages] = useState<StyleTemplate[] | []>([]);
  const [stylizeRatio, setStylizeRatio] = useState(1.0);
  const currentFilters = useCommonProps((state) => state.currentFilters);
  const resetFilters = useAdjustStore((state) => state.resetFilters);
  const {
    setFinalImageDimensions,
    disableSavingIntoStackRef,
    downloadImageDimensionsRef,
  } = useCanvasObjects();
  const setFlipX = useArrangeStore((state) => state.setFlipX);
  const setFlipY = useArrangeStore((state) => state.setFlipY);

  const removeTempStylizeImage = () => {
    // @ts-ignore
    const tempImg: FabricImage = canvas
      .getObjects() //@ts-ignore
      .find((obj) => obj.name && obj.name === "style_temp_img");
    if (tempImg) canvas.remove(tempImg);
  };

  useEffect(() => {
    const get_style_images = async () => {
      try {
        const response = await apiClient.get("/all_style_img", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        });
        const images = response.data.data;
        setStyleImages(images);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
        toast({ description: "Failed to load reports", duration: 3000 });
      }
    };

    if (!user) {
      toast({
        description: "You need to sign in first",
      });
    } else {
      get_style_images();
    }

    return () => {
      removeTempStylizeImage();
    };
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        // addLog({
        //   objType: "style_image",
        //   propType: "image",
        //   message: "uploaded style image",
        // });
        // @ts-ignore
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStyleTransfer = async (predefinedImageUrl: string = "") => {
    setLoadSate(true);
    removeTempStylizeImage();

    if (!user)
      toast({
        description: "You need to sign in first",
      });

    try {
      const formData = new FormData();

      const canvasImageBase64 = getCanvasDataUrl(
        canvas,
        imageRef.current,
        false,
        true
      );

      // if (!isBase64(originalImageBase64)) {
      //   originalImageBase64 = await urlToBase64(originalImageBase64);
      // }

      const originalImageFile = base64ToFile(canvasImageBase64, "image");

      if (predefinedImageUrl.length > 0) {
        const styleImageFile = await urlToFile(predefinedImageUrl);
        formData.append("styleImage", styleImageFile);
      } else {
        const styleImageFile = await urlToFile(uploadedImage);
        formData.append("styleImage", styleImageFile);
      }

      formData.append("originalImage", originalImageFile);
      formData.append("alpha", stylizeRatio.toString());

      console.log([...formData]);

      const response = await apiClient.post(
        "/image_proc/style_transfer",
        formData,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      if (response.status === 200) {
        disableSavingIntoStackRef.current = true;
        // setUploadedImage("");
        const base64Image = `data:image/png;base64,${response.data.image}`;
        // const base64Image =response.data.image
        setBackendImage(base64Image);
        setShowImageAddButton(true);

        if (uploadedImage) {
          toast({
            title: "Style Transfer Successfull",
            duration: 3000,
          });
        } else {
          showStylizeImagePreview(base64Image);
          toast({
            title: "Style Transfer Successfull",
            description:
              "Do you want to replace the original image with the new one?",
            action: (
              <ToastAction altText="Switch">
                <div className="flex gap-2">
                  <button onClick={() => replaceImage(base64Image)}>
                    Switch
                  </button>
                </div>
              </ToastAction>
            ),
            duration: 10000000000000,
            onDismiss: () => {
              removeTempStylizeImage();
            },
          });
        }
      } else if (response.status === 201 || response.status == 202) {
        // that means user is in free version
        toast({
          title: "Upgrade",
          description: response.data.message,
          action: (
            <ToastAction altText="Switch">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    window.open("/pricing", "_blank");
                  }}
                >
                  Upgrade
                </button>
              </div>
            </ToastAction>
          ),
        });
      } else {
        toast({
          variant: "destructive",
          description: "Error Encountered during style transfer",
          className: "bg-green-500 text-gray-900",
          duration: 3000,
        });
      }
    } catch (error) {
      let message = error.message;
      if (axios.isAxiosError(error)) {
        message = error.response.data.message;
      }
      toast({
        variant: "destructive",
        description: message,
        duration: 8000,
      });
    }
    setLoadSate(false);
  };

  const showStylizeImagePreview = (base64Image: string) => {
    if (!canvas || !imageRef.current) return;

    const newImage = new Image();
    newImage.src = base64Image;

    newImage.onload = () => {
      const fabricImage = new FabricImage(newImage);

      fabricImage.set({
        originX: "center",
        originY: "center",
        top: imageRef.current.top,
        left: imageRef.current.left,
        angle: imageRef.current.angle,
      });

      fabricImage.set("name", "style_temp_img");

      canvas.add(fabricImage);

      canvas.renderAll();
    };
  };

  const replaceImage = (base64Image: string) => {
    if (!canvas || !imageRef.current) return;

    removeTempStylizeImage();

    FabricImage.fromURL(base64Image).then((img) => {
      if (!img || !imageRef.current) return;

      addLog({
        section: "arrange",
        tab: "ai",
        event: "update",
        message: `Applied Style Transfer`,
        objType: "image",
      });
      // Replace the image content

      imageRef.current.setElement(img.getElement());

      imageRef.current.scaleX = 1;
      imageRef.current.scaleY = 1;

      imageRef.current.flipX = false;
      imageRef.current.flipY = false;

      setFlipX(false);
      setFlipY(false);
      setFinalImageDimensions({
        imageWidth: img.width,
        imageHeight: img.height,
      });

      resetFilters();

      // Refresh canvas
      imageRef.current.setCoords();

      disableSavingIntoStackRef.current = false;
      canvas.fire("object:modified");

      canvas.requestRenderAll();
    });

    canvas.getObjects().forEach(function (obj) {
      if (
        obj.type.toLowerCase() !== "image" && // @ts-ignore
        obj?.name === "canvasRect" && // @ts-ignore
        obj?.name === "liquifyCircle"
      ) {
        canvas.remove(obj);
      }
    });
    canvas.requestRenderAll();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full gap-4">
      <div className="w-[90%]">
        <Dialog open={openStylizeImage} onOpenChange={setOpenStylizeImage}>
          <DialogTrigger asChild>
            <div className="flex flex-col gap-3">
              <button className="custom-button w-full flex items-center justify-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Stylize Image
              </button>
            </div>
          </DialogTrigger>
          <DialogContent className="w-screen h-screen max-w-[90vw] max-h-[90vh] p-8 bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-800 dark:text-yellow-400 flex items-center gap-2">
                <Crown className="w-6 h-6 text-yellow-500" />
                Image Processing{" "}
                <span className="text-xs font-normal text-yellow-500 ml-2">
                  Premium
                </span>
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 h-[80%]">
              {/* First Image from FabricImage */}
              <div className="flex flex-col items-center text-center h-full">
                <div className="flex items-center justify-center w-full h-[250px] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                  <img
                    src={getCanvasDataUrl(
                      canvas,
                      imageRef.current,
                      false,
                      true
                    )} // Get the image URL from FabricImage
                    alt="Fabric Image"
                    className="object-contain w-full h-full"
                  />
                </div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  Image from Fabric
                </p>
              </div>

              {/* Second Image (Uploaded) */}
              <div className="flex flex-col items-center text-center h-full">
                <div className="flex items-center justify-center w-full h-[250px] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                  {uploadedImage ? (
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="object-contain w-full h-full"
                    />
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      No Image Uploaded
                    </p>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mt-4 px-4 py-2 border rounded-lg cursor-pointer dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                />
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  Upload Your Image
                </p>
              </div>

              {/* Third Image (Backend Image) */}
              <div className="flex flex-col items-center text-center h-full">
                <div className="flex items-center justify-center w-full h-[250px] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                  {backendImage ? (
                    <img
                      src={backendImage}
                      alt="Backend"
                      className="object-contain w-full h-full"
                    />
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      Loading...
                    </p>
                  )}
                </div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  Image from Backend
                </p>
              </div>
            </div>
            <DialogFooter className="mt-8">
              {showImageAddButton && (
                <Button
                  className="custom-button"
                  onClick={() => replaceImage(backendImage)}
                >
                  Replace Image
                </Button>
              )}
              <Button
                className="custom-button"
                onClick={() => handleStyleTransfer()}
              >
                Process Images
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-col justify-center items-center w-[85%]">
        <div className="mb-3 w-full">
          <CustomSlider
            sliderName={"Alpha"}
            min={0}
            max={1}
            sliderValue={stylizeRatio}
            defaultValue={stylizeRatio}
            step={0.01}
            setSliderValue={setStylizeRatio}
            section={"ai"}
            tab={"image"}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 w-full">
          {styleImages.map((style, index) => (
            <div
              key={index}
              className="relative rounded-lg overflow-hidden shadow-md cursor-pointer"
              onClick={() => handleStyleTransfer(style.image_url)}
            >
              <img
                src={style.image_url}
                alt={style.image_name}
                className="w-full h-32 object-cover"
              />
              <div className="absolute bottom-0 bg-black bg-opacity-60 text-white text-center w-full py-1 text-sm">
                {style.image_name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AITools2;
