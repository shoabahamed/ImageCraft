import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useToast } from "@/hooks/use-toast";
import { CircleUserRound } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect } from "react";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { toast } = useToast();

  useEffect(() => {
    // localStorage.removeItem("project_data");
    // localStorage.removeItem("canvasId");
  });

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
          {user ? (
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
          ) : (
            <button
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 cursor-pointe"
              onClick={() =>
                toast({
                  description: "You need to log in first",
                  className: "bg-green-500 text-gray-900",
                  duration: 5000,
                })
              }
            >
              Load Image
            </button>
          )}

          {user ? (
            <Link to="/projects">
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 cursor-pointer">
                Saved Projects
              </button>
            </Link>
          ) : (
            <button
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 cursor-pointe"
              onClick={() =>
                toast({
                  description: "You need to log in first",
                  className: "bg-green-500 text-gray-900",
                  duration: 5000,
                })
              }
            >
              Saved Project
            </button>
          )}
        </div>
      </div>

      {user && (
        <div className="absolute bottom-4 right-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <button
                  className="p-3 bg-primary rounded-full text-primary-foreground shadow-lg hover:bg-primary/90"
                  onClick={() => navigate("/profile")}
                >
                  <CircleUserRound size={28} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>UserProfile</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
};

export default Home;
