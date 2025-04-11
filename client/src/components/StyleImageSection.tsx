import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import { Trash2, Upload } from "lucide-react";
import { useAuthContext } from "@/hooks/useAuthContext";
import apiClient from "@/utils/appClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type StyleTemplate = {
  image_id: string;
  image_url: string;
  image_name: string;
  created_at?: Date;
};

const StyleImageSection = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [styleImages, setStyleImages] = useState<StyleTemplate[] | []>([]);
  const [imageName, setImageName] = useState("");
  const [imageFile, setImageFile] = useState<null | File>(null);
  const [openStyleImageUpload, setOpenStyleImageUpload] = useState(false);

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

  const handleStyleImageUpload = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      toast({ description: "Please select an image first.", duration: 3000 });
      return;
    }

    const formData = new FormData();
    formData.append("imageId", crypto.randomUUID());
    formData.append("styleImage", imageFile);
    formData.append("imageName", imageName);

    try {
      await apiClient.post("/add_style_img", formData, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      setStyleImages((prevStyles) => [...prevStyles]);

      toast({
        description: "Style Image uploaded successfully successfull",
        duration: 3000,
      });
    } catch (error) {
      toast({ description: "Image upload failed." + error, duration: 3000 });
    }
  };

  const deleteStyleImage = async (imageId: string) => {
    try {
      await apiClient.delete(`/delete_style_img/${imageId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      // @ts-ignore
      setStyleImages(styleImages.filter((image) => image.image_id !== imageId));

      toast({
        description: "Style image deleted successfully",
        duration: 3000,
      });
    } catch (error) {
      toast({
        description: "Failed to delete style image" + error,
        duration: 3000,
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setImageFile(event.target.files[0]);
    }
  };

  return (
    <div>
      <div className="flex w-full justify-end mb-3">
        <button
          className=" border border-gray-600 px-6 py-3 rounded-md flex items-center gap-2 shadow-md w-64 justify-center"
          onClick={() => {
            setOpenStyleImageUpload(true);
          }}
        >
          <Upload size={20} /> Add New Image
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {styleImages.map((styleImage: StyleTemplate) => (
          <Card
            key={styleImage.image_id}
            className="overflow-hidden transition-shadow hover:shadow-md"
          >
            <div className="aspect-video bg-gray-100 relative">
              <img
                src={styleImage?.image_url}
                alt={styleImage?.image_name}
                className="object-cover w-full h-full"
              />
            </div>
            <CardContent className="pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{styleImage?.image_name}</h3>
                  {/* <p className="text-sm text-gray-500">
                    Added on {styleImage?.created_at.toLocaleDateString()}
                  </p> */}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => deleteStyleImage(styleImage?.image_id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog
        open={openStyleImageUpload}
        onOpenChange={setOpenStyleImageUpload}
      >
        <DialogTrigger asChild>
          <Button className="hidden"></Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]  p-6 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Add New Style Image
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleStyleImageUpload}
            className="flex flex-col gap-4"
          >
            {/* Name Input */}
            <label className="text-sm font-medium">Image Name</label>
            <Input
              type="text"
              placeholder="Enter image name"
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
              required
            />

            {/* Image Upload */}
            <label className="text-sm font-medium">Upload Image</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e)}
            />

            {/* Submit Button */}
            <DialogFooter>
              <Button type="submit">Submit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StyleImageSection;
