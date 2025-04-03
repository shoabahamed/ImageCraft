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

// TODO: saving image when style transfer have been done
// TODO: ability to restore original image after style transfer

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

    get_style_images();
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

  // Function to get the FabricImage URL
  // const getFabricImageURL = (fabricImage: FabricImage) => {
  //   const imgElement = fabricImage.getElement();
  //   return imgElement ? imgElement.src : "";
  // };

  const convertToFile = async (url: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], "image.png", { type: "image/png" });

    return file;
  };

  const handleStyleTransfer = async (predefinedImageUrl: string = "") => {
    setLoadSate(true);
    try {
      const formData = new FormData();

      const originalImageFile = await convertToFile(imageUrl);
      if (predefinedImageUrl.length > 0) {
        const styleImageFile = await convertToFile(predefinedImageUrl);
        formData.append("styleImage", styleImageFile);
      } else {
        const styleImageFile = await convertToFile(uploadedImage);
        formData.append("styleImage", styleImageFile);
      }

      formData.append("originalImage", originalImageFile);

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
        setUploadedImage("");
        const base64Image = `data:image/png;base64,${response.data.image}`;
        // const base64Image =response.data.image
        setBackendImage(base64Image);
        setShowImageAddButton(true);
        toast({
          description: "Style Transfer Successfull",
          className: "bg-green-500 text-gray-900",
          duration: 3000,
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
      console.error("Error saving canvas:", error);
      toast({
        variant: "destructive",
        description: "Unexpected Error",
        className: "bg-green-500 text-gray-900",
        duration: 3000,
      });
    }
    setLoadSate(false);
  };

  useEffect(() => {
    if (backendImage) {
      replaceImage();
    }
  }, [backendImage]);

  const replaceImage = () => {
    if (!canvas || !imageRef.current || !backendImage) return;

    const scaleX = imageRef.current.scaleX;
    const scaleY = imageRef.current.scaleY;

    const newImage = new Image();
    newImage.src = backendImage;

    newImage.onload = () => {
      const fabricImage = new FabricImage(newImage);

      fabricImage.scaleX = scaleX;
      fabricImage.scaleY = scaleY;

      fabricImage.left = 0;
      fabricImage.top = 0;
      fabricImage.selectable = false;
      fabricImage.hoverCursor = "default";

      canvas.getObjects().forEach((obj) => {
        canvas.remove(obj);
      });

      if (canvas.backgroundImage) {
        canvas.backgroundImage = null;
      }

      canvas.add(fabricImage);
      // @ts-ignore
      imageRef.current = fabricImage;

      canvas.renderAll();

      // addLog({
      //   objType: "canvas",
      //   propType: "all",
      //   message: "reseted canvas and changed image to stylized image",
      // });
      toast({
        description: "Image change Successfull",
        className: "bg-green-500 text-gray-900",
        duration: 3000,
      });
    };
  };

  return (
    <div className="flex flex-col items-center justify-center w-full gap-4">
      <div className="w-[90%]">
        <Dialog open={openStylizeImage} onOpenChange={setOpenStylizeImage}>
          <DialogTrigger asChild>
            <div className="flex flex-col gap-3">
              <button className="custom-button w-full">Stylize Image</button>
            </div>
          </DialogTrigger>
          <DialogContent className="w-screen h-screen max-w-[90vw] max-h-[90vh] p-8 bg-white rounded-lg shadow-lg overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-800">
                Image Processing
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 h-[80%]">
              {/* First Image from FabricImage */}
              <div className="flex flex-col items-center text-center h-full">
                <div className="flex items-center justify-center w-full h-[250px] bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={imageUrl} // Get the image URL from FabricImage
                    alt="Fabric Image"
                    className="object-contain w-full h-full"
                  />
                </div>
                <p className="mt-4 text-gray-600">Image from Fabric</p>
              </div>

              {/* Second Image (Uploaded) */}
              <div className="flex flex-col items-center text-center h-full">
                <div className="flex items-center justify-center w-full h-[250px] bg-gray-100 rounded-lg overflow-hidden">
                  {uploadedImage ? (
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="object-contain w-full h-full"
                    />
                  ) : (
                    <p className="text-gray-500">No Image Uploaded</p>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mt-4 px-4 py-2 border rounded-lg cursor-pointer"
                />
                <p className="mt-4 text-gray-600">Upload Your Image</p>
              </div>

              {/* Third Image (Backend Image) */}
              <div className="flex flex-col items-center text-center h-full">
                <div className="flex items-center justify-center w-full h-[250px] bg-gray-100 rounded-lg overflow-hidden">
                  {backendImage ? (
                    <img
                      src={backendImage}
                      alt="Backend"
                      className="object-contain w-full h-full"
                    />
                  ) : (
                    <p className="text-gray-500">Loading...</p>
                  )}
                </div>
                <p className="mt-4 text-gray-600">Image from Backend</p>
              </div>
            </div>
            <DialogFooter className="mt-8">
              {showImageAddButton && (
                <Button className="custom-button" onClick={replaceImage}>
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
      <div className="w-[85%] mt-2">
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
