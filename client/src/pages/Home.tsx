import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

const Home = () => {
  const createProjectFromDatabase = () => {
    console.log("Project Created");
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
          <Button className="px-6 py-3">Start Editing</Button>
          <Drawer>
            <DrawerTrigger>
              <Button className="px-6 py-3">Load Saved</Button>
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
                      <Card className="w-full h-full">
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
