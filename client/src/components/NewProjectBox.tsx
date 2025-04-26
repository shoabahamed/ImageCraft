import { useDropzone } from "react-dropzone";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NewProjectBox = (props: {
  extraStyles?: string;
  useButton?: boolean;
}) => {
  const {
    extraStyles = "px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all duration-300 dark:bg-blue-500 dark:hover:bg-blue-600",
    useButton = true,
  } = props;
  const navigate = useNavigate();
  const [dataURL, setDataURL] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [jsonData, setJsonData] = useState("");
  const [showLoadingDialog, setShowLoadingDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("local");

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
  });

  const handleImageUpload = () => {
    let data;
    switch (activeTab) {
      case "local":
        data = { type: "local", imageUrl: dataURL };

        navigate(`/mainpage`, { state: data });
        break;
      case "url":
        data = { type: "url", imageUrl };
        navigate("/mainpage", { state: data });
        break;
      case "json":
        if (jsonData) {
          const canvasData = JSON.parse(jsonData);
          const {
            project_data,
            project_logs,
            project_name,
            final_image_shape,
            original_image_shape,
            download_image_shape,
            imageUrl,
            filter_names,
          } = canvasData;
          localStorage.setItem("project_data", JSON.stringify(project_data));
          localStorage.setItem("project_logs", JSON.stringify(project_logs));
          localStorage.setItem("project_name", project_name);

          localStorage.setItem(
            "final_image_shape",
            JSON.stringify(final_image_shape)
          );
          localStorage.setItem(
            "original_image_shape",
            JSON.stringify(original_image_shape)
          );
          localStorage.setItem(
            "download_image_shape",
            JSON.stringify(download_image_shape)
          );
          localStorage.setItem("filter_names", JSON.stringify(filter_names));
          navigate("/mainpage", { state: { imageUrl } });
        }
        break;
    }

    window.location.href = `/mainpage`;
  };

  const handleUrlChange = (e) => {
    setImageUrl(e.target.value);
  };

  const handleJsonChange = (e) => {
    setJsonData(e.target.value);
  };

  return (
    <div>
      {useButton && (
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setShowLoadingDialog(true)}
            className={extraStyles}
          >
            Start Edit
          </button>
        </div>
      )}

      {!useButton && (
        <button
          className={`flex cursor-default select-none items-center justify-center rounded-[0.2rem] px-3 py-1.5 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground transition-all duration-300`}
          onClick={() => setShowLoadingDialog(true)}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Upload />
              </TooltipTrigger>
              <TooltipContent>
                <p>Upload</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </button>
      )}

      <Dialog open={showLoadingDialog} onOpenChange={setShowLoadingDialog}>
        <DialogTrigger asChild>
          <button className="hidden"></button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-center text-blue-600 dark:text-blue-400">
              Upload Image
            </DialogTitle>
          </DialogHeader>

          <Tabs
            defaultValue="local"
            className="w-full"
            onValueChange={setActiveTab}
          >
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="local">Local File</TabsTrigger>
              <TabsTrigger value="url">URL</TabsTrigger>
              <TabsTrigger value="json">Canvas JSON</TabsTrigger>
            </TabsList>

            <TabsContent
              value="local"
              className="flex justify-center items-center"
            >
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-blue-400 w-full max-w-sm p-8 rounded-lg flex flex-col items-center justify-center cursor-pointer transition hover:bg-blue-50 dark:border-blue-500 dark:hover:bg-gray-700/50"
              >
                <input {...getInputProps()} />
                {dataURL ? (
                  <img
                    src={dataURL}
                    alt="Uploaded Preview"
                    className="w-full max-h-[300px] object-contain rounded-lg shadow-md"
                  />
                ) : (
                  <div className="flex flex-col items-center text-blue-600 dark:text-blue-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      height="50"
                      width="50"
                      className="text-blue-500 dark:text-blue-400"
                    >
                      <path d="M1 14.5C1 12.1716 2.22429 10.1291 4.06426 8.9812C4.56469 5.044 7.92686 2 12 2C16.0731 2 19.4353 5.044 19.9357 8.9812C21.7757 10.1291 23 12.1716 23 14.5C23 17.9216 20.3562 20.7257 17 20.9811L7 21C3.64378 20.7257 1 17.9216 1 14.5ZM16.8483 18.9868C19.1817 18.8093 21 16.8561 21 14.5C21 12.927 20.1884 11.4962 18.8771 10.6781L18.0714 10.1754L17.9517 9.23338C17.5735 6.25803 15.0288 4 12 4C8.97116 4 6.42647 6.25803 6.0483 9.23338L5.92856 10.1754L5.12288 10.6781C3.81156 11.4962 3 12.927 3 14.5C3 16.8561 4.81833 18.8093 7.1517 18.9868L7.325 19H16.675L16.8483 18.9868ZM13 13V17H11V13H8L12 8L16 13H13Z" />
                    </svg>
                    <p className="mt-4 text-sm">
                      {isDragActive
                        ? "Drop the files here..."
                        : "Drag & drop an image here, or click to select one"}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="url" className="flex flex-col items-center">
              <div className="w-full max-w-sm">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={handleUrlChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                {imageUrl && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Preview:
                    </p>
                    <img
                      src={imageUrl}
                      alt="URL Preview"
                      className="w-full max-h-[300px] object-contain rounded-lg shadow-md"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        e.currentTarget.src = "";
                        e.currentTarget.alt = "Invalid image URL";
                      }}
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="json" className="flex flex-col items-center">
              <div className="w-full max-w-sm">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Canvas JSON Data
                  </label>
                  <textarea
                    value={jsonData}
                    onChange={handleJsonChange}
                    placeholder="Paste your canvas JSON data here..."
                    className="w-full p-2 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6 flex justify-center">
            <button
              className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all duration-300 dark:bg-blue-500 dark:hover:bg-blue-600 ${
                (activeTab === "local" && !dataURL) ||
                (activeTab === "url" && !imageUrl) ||
                (activeTab === "json" && !jsonData)
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={handleImageUpload}
              disabled={
                (activeTab === "local" && !dataURL) ||
                (activeTab === "url" && !imageUrl) ||
                (activeTab === "json" && !jsonData)
              }
            >
              Upload
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewProjectBox;
