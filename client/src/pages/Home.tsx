import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Home = () => {
  const navigate = useNavigate();

  const createProjectFromDatabase = () => {
    console.log("Project Created");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Check if the selected file is an image
      if (!file.type.startsWith("image/")) {
        alert("Please upload a valid image file.");
        return;
      }

      const imageUrl = URL.createObjectURL(file);

      // Navigate to the display page and pass the image URL
      navigate("/mainpage", { state: { imageUrl } });
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen">
      <Navbar />
      <div className="flex flex-grow flex-col justify-center items-center text-center px-6 md:px-12 lg:px-24">
        <h2 className="text-4xl font-bold mb-4">StyleForge</h2>
        <p className="text-sm font-thin mb-2 italic text-slate-400">
          Forge your creativity. One pixel at a time.
        </p>
        <p className="text-xm leading-relaxed font-light mb-6 max-w-2xl">
          StyleForge brings the power of AI to your fingertips. Edit, enhance,
          stylize, and generate stunning visuals with ease. Whether you're
          refining a photo, creating breathtaking artwork, or exploring new
          styles, StyleForge empowers you to bring your vision to life.
          Seamlessly integrate powerful tools to unlock unlimited possibilities.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <form>
            <Label
              htmlFor="picture"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 cursor-pointer"
            >
              Load Image
            </Label>
            <Input
              id="picture"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </form>

          <Drawer>
            <DrawerTrigger>
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 cursor-pointer">
                Load Saved
              </button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle className="text-center">
                  Select a Project
                </DrawerTitle>
              </DrawerHeader>
              <ScrollArea className="w-full h-[400px] px-4 py-2">
                <DrawerDescription>
                  <div className="w-full h-[80px] grid grid-cols-7 gap-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Card className="w-full h-full cursor-pointer">
                        <CardContent className="flex h-full w-full items-center justify-center p-2">
                          <img
                            src={`./bg${index + 1}.jpg`}
                            alt="test_image"
                            className="w-full h-full object-fill"
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </DrawerDescription>
              </ScrollArea>

              <DrawerFooter>
                <Button onClick={createProjectFromDatabase}>Submit</Button>
                <DrawerClose>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </div>
  );
};

export default Home;
