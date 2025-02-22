import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useToast } from "@/hooks/use-toast";

import { useDropzone } from "react-dropzone";

import { useCallback, useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [showLoadingDialog, setShowLoadingDialog] = useState(false);

  const [dataURL, setDataURL] = useState(null);

  useEffect(() => {
    localStorage.removeItem("project_data");
    localStorage.removeItem("canvasId");
    localStorage.removeItem("project_logs");
  });

  //  code for handling image upload
  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        const binaryStr = reader.result;
        setDataURL(binaryStr);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const { getRootProps, acceptedFiles, getInputProps, isDragActive } =
    useDropzone({
      onDrop,
      accept: {
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
      },
    });

  const hanldeImageUpload = (imageUrl: string) => {
    navigate("/mainpage", { state: { imageUrl } });
  };

  return (
    <div className="flex flex-col h-screen w-screen">
      <Navbar />
      <div className="flex flex-grow flex-col justify-center items-center text-center px-6 md:px-12 lg:px-24">
        <h2 className="text-4xl font-bold mb-4">PixelTune</h2>
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
          <button
            onClick={() => setShowLoadingDialog(true)}
            className="custom-button"
          >
            Start Edit
          </button>

          {user ? (
            <Link to="/projects">
              <button className="custom-button">Saved Projects</button>
            </Link>
          ) : (
            <button
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-300 ring-offset-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 text-white hover:from-indigo-500 hover:via-blue-500 hover:to-teal-400 px-10 py-3 cursor-pointer shadow-lg hover:shadow-blue-600/50"
              onClick={() =>
                toast({
                  description: "You need to log in first",
                  className: "bg-green-500 text-gray-900",
                  duration: 5000,
                })
              }
            >
              Gallery
              Gallery
            </button>
          )}
        </div>
      </div>

      <Dialog open={showLoadingDialog} onOpenChange={setShowLoadingDialog}>
        <DialogTrigger asChild>
          <button className="hidden"></button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] p-6 bg-white rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-gray-900 text-center">
              Upload Image
            </DialogTitle>
          </DialogHeader>

          <div className="flex justify-center items-center">
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-blue-400 w-full max-w-sm p-6 rounded-lg flex flex-col items-center justify-center cursor-pointer transition hover:bg-blue-50"
            >
              <input {...getInputProps()} />
              {dataURL ? (
                <img
                  src={dataURL}
                  alt="Uploaded Preview"
                  className="w-full h-auto rounded-lg shadow-md"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    height="50"
                    width="50"
                    className="text-blue-500"
                  >
                    <path d="M1 14.5C1 12.1716 2.22429 10.1291 4.06426 8.9812C4.56469 5.044 7.92686 2 12 2C16.0731 2 19.4353 5.044 19.9357 8.9812C21.7757 10.1291 23 12.1716 23 14.5C23 17.9216 20.3562 20.7257 17 20.9811L7 21C3.64378 20.7257 1 17.9216 1 14.5ZM16.8483 18.9868C19.1817 18.8093 21 16.8561 21 14.5C21 12.927 20.1884 11.4962 18.8771 10.6781L18.0714 10.1754L17.9517 9.23338C17.5735 6.25803 15.0288 4 12 4C8.97116 4 6.42647 6.25803 6.0483 9.23338L5.92856 10.1754L5.12288 10.6781C3.81156 11.4962 3 12.927 3 14.5C3 16.8561 4.81833 18.8093 7.1517 18.9868L7.325 19H16.675L16.8483 18.9868ZM13 13V17H11V13H8L12 8L16 13H13Z" />
                  </svg>
                  <p className="mt-2 text-sm">
                    {isDragActive
                      ? "Drop the files here..."
                      : "Drag & drop an image here, or click to select one"}
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-center">
            {dataURL && (
              <button
                className="custom-button w-32"
                onClick={() => {
                  hanldeImageUpload(dataURL);
                }}
              >
                Upload
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
