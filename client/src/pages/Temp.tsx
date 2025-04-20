import { Link } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useToast } from "@/hooks/use-toast";

import Navbar from "@/components/Navbar";
import NewProjectBox from "@/components/NewProjectBox";
import { useEffect } from "react";

const Home = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();

  useEffect(() => {
    localStorage.removeItem("project_data");
    localStorage.removeItem("canvasId");
    localStorage.removeItem("project_logs");
  });

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <div className="flex flex-grow flex-col justify-center items-center text-center px-6 md:px-12 lg:px-24 py-12">
        <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-300">
          ImageCraft
        </h2>
        <p className="text-lg font-light mb-2 text-blue-600 dark:text-blue-300">
          A Web based image styling and sharing platform
        </p>
        <p className="text-base leading-relaxed font-light mb-8 max-w-2xl text-gray-600 dark:text-gray-300">
          ImageCraft brings the power of AI to your fingertips. Edit, enhance,
          stylize, and generate stunning visuals with ease. Whether you're
          refining a photo, creating breathtaking artwork, or exploring new
          styles, StyleForge empowers you to bring your vision to life.
          Seamlessly integrate powerful tools to unlock unlimited possibilities.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <NewProjectBox />

          {user ? (
            <Link to="/projects">
              <button className="px-8 py-3 bg-white hover:bg-gray-50 text-blue-600 font-medium rounded-lg shadow-lg hover:shadow-gray-400/30 transition-all duration-300 border border-blue-200 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-gray-700">
                Saved Projects
              </button>
            </Link>
          ) : (
            <button
              className="px-8 py-3 bg-white hover:bg-gray-50 text-blue-600 font-medium rounded-lg shadow-lg hover:shadow-gray-400/30 transition-all duration-300 border border-blue-200 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-gray-700"
              onClick={() =>
                toast({
                  description: "You need to log in first",
                  className: "bg-blue-500 text-white",
                  duration: 5000,
                })
              }
            >
              Gallery
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
