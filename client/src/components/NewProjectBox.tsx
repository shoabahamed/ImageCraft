import { useDropzone } from "react-dropzone";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import pica from "pica";

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
import { useAuthContext } from "@/hooks/useAuthContext";

interface ProjectJson {
  project_data: any;
  project_logs: any;
  project_name: string;
  final_image_shape: { imageWidth: number; imageHeight: number };
  original_image_shape: { imageWidth: number; imageHeight: number };
  download_image_shape: { imageWidth: number; imageHeight: number };
  imageUrl: string;
  filter_names: string[];
  all_filters_applied: any;
}

const MAX_WIDTH = 2048;
const MAX_HEIGHT = 2048;

const NewProjectBox = (props: {
  extraStyles?: string;
  buttonText?: string;
  useButton?: boolean;
}) => {
  const {
    extraStyles = "px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all duration-300 dark:bg-blue-500 dark:hover:bg-blue-600",
    useButton = true,
  } = props;
  const { user } = useAuthContext();
  const { buttonText } = props;
  const navigate = useNavigate();
  const [dataURL, setDataURL] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [showLoadingDialog, setShowLoadingDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("local");
  const [showResizeWarningLocal, setShowResizeWarningLocal] = useState(false);
  const [resizeInfoLocal, setResizeInfoLocal] = useState<{
    current: [number, number];
    resized: [number, number];
  } | null>(null);
  const [showResizeWarningUrl, setShowResizeWarningUrl] = useState(false);
  const [resizeInfoUrl, setResizeInfoUrl] = useState<{
    current: [number, number];
    resized: [number, number];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const [jsonFile, setJsonFile] = useState<ProjectJson | null>(null);

  // Create a new dropzone for JSON files
  const onDropJson = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onabort = () => console.log("file reading was aborted");
    reader.onerror = () => console.log("file reading has failed");
    reader.onload = () => {
      try {
        //@ts-ignore
        const jsonData = JSON.parse(reader.result);
        setJsonFile(jsonData);
      } catch (error) {
        console.error("Error parsing JSON file:", error);
        // You might want to add error handling here
      }
    };
    reader.readAsText(file);
  }, []);

  const { getRootProps: getJsonRootProps, getInputProps: getJsonInputProps } =
    useDropzone({
      onDrop: onDropJson,
      accept: {
        "application/json": [".json"],
      },
      maxFiles: 1,
    });

  const resizeImageIfNeeded = async (
    img: HTMLImageElement,
    type: "local" | "url"
  ): Promise<string> => {
    if (type === "local") {
      setShowResizeWarningLocal(false);
      setResizeInfoLocal(null);
    } else {
      setShowResizeWarningUrl(false);
      setResizeInfoUrl(null);
    }
    // setLoading(true);
    return new Promise((resolve) => {
      if (img.width > MAX_WIDTH || img.height > MAX_HEIGHT) {
        const scale = Math.min(MAX_WIDTH / img.width, MAX_HEIGHT / img.height);
        const newWidth = Math.round(img.width * scale);
        const newHeight = Math.round(img.height * scale);
        if (type === "local") {
          setShowResizeWarningLocal(true);
          setResizeInfoLocal({
            current: [img.width, img.height],
            resized: [newWidth, newHeight],
          });
        } else {
          setShowResizeWarningUrl(true);
          setResizeInfoUrl({
            current: [img.width, img.height],
            resized: [newWidth, newHeight],
          });
        }
        const canvas = document.createElement("canvas");
        canvas.width = newWidth;
        canvas.height = newHeight;
        pica()
          .resize(img, canvas)
          .then(() => {
            setLoading(false);
            resolve(canvas.toDataURL());
          });
      } else {
        if (type === "local") {
          setShowResizeWarningLocal(false);
          setResizeInfoLocal(null);
        } else {
          setShowResizeWarningUrl(false);
          setResizeInfoUrl(null);
        }
        // No resize needed
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const ctx = tempCanvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        // setLoading(false);
        resolve(tempCanvas.toDataURL());
      }
    });
  };

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = async () => {
        const binaryStr = reader.result as string;
        // Check image size
        const img = new window.Image();
        img.onload = async () => {
          const resizedDataUrl = await resizeImageIfNeeded(img, "local");
          setDataURL(resizedDataUrl);
        };
        img.src = binaryStr;
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

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    if (!url) {
      setShowResizeWarningUrl(false);
      setResizeInfoUrl(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    // Check image size for URL
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      setLoading(false);
      if (img.width > 0 && img.height > 0) {
        if (img.width > MAX_WIDTH || img.height > MAX_HEIGHT) {
          const scale = Math.min(
            MAX_WIDTH / img.width,
            MAX_HEIGHT / img.height
          );
          const newWidth = Math.round(img.width * scale);
          const newHeight = Math.round(img.height * scale);
          setShowResizeWarningUrl(true);
          setResizeInfoUrl({
            current: [img.width, img.height],
            resized: [newWidth, newHeight],
          });
        } else {
          setShowResizeWarningUrl(false);
          setResizeInfoUrl(null);
        }
      }
    };
    img.onerror = () => {
      setLoading(false);
      setShowResizeWarningUrl(false);
      setResizeInfoUrl(null);
    };
    img.src = url;
  };

  const handleUrlUpload = async () => {
    if (!imageUrl) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      // setLoading(true);
      const resizedDataUrl = await resizeImageIfNeeded(img, "url");

      const data = { type: "url", imageUrl: resizedDataUrl };
      navigate(`/mainpage`, { state: data });
      window.location.href = `/mainpage`;
    };
    img.onerror = () => setLoading(false);
    img.src = imageUrl;
  };

  const handleImageUpload = () => {
    localStorage.removeItem("CanvasId");
    localStorage.removeItem("project_data");
    localStorage.removeItem("project_logs");
    localStorage.removeItem("project_name");
    localStorage.removeItem("final_image_shape");
    localStorage.removeItem("original_image_shape");
    localStorage.removeItem("download_image_shape");
    localStorage.removeItem("filter_names");
    localStorage.removeItem("all_filters_applied");
    setTimeout(() => {
      let data;
      switch (activeTab) {
        case "local":
          data = { type: "url", imageUrl: dataURL };
          navigate(`/mainpage`, { state: data });

          break;
        case "url":
          handleUrlUpload();
          return;
        case "json":
          if (jsonFile) {
            const {
              project_data,
              project_logs,
              project_name,
              final_image_shape,
              original_image_shape,
              download_image_shape,
              imageUrl,
              filter_names,
              all_filters_applied,
            } = jsonFile;
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
            localStorage.setItem(
              "all_filters_applied",
              JSON.stringify(all_filters_applied)
            );
            navigate("/mainpage", { state: { imageUrl } });
          }
          break;
      }
      window.location.href = `/mainpage`;
    }, 500);
  };

  return (
    <div>
      {useButton && (
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setShowLoadingDialog(true)}
            className={extraStyles}
          >
            {buttonText || "Start Edit"}
          </button>
        </div>
      )}

      {!useButton && (
        <div
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
        </div>
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
                {showResizeWarningLocal && resizeInfoLocal && (
                  <div className="mb-2 text-yellow-600 dark:text-yellow-400 text-center w-full">
                    The image is too large and will be resized from{" "}
                    {resizeInfoLocal.current[0]}x{resizeInfoLocal.current[1]} to{" "}
                    {resizeInfoLocal.resized[0]}x{resizeInfoLocal.resized[1]}{" "}
                    pixels.
                  </div>
                )}
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
                {loading ? (
                  <div className="flex flex-col items-center justify-center min-h-[200px]">
                    <svg
                      className="animate-spin h-8 w-8 text-blue-600 mb-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      ></path>
                    </svg>
                    <span className="text-blue-600 dark:text-blue-400">
                      Loading image...
                    </span>
                  </div>
                ) : (
                  <>
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
                    {showResizeWarningUrl && resizeInfoUrl && (
                      <div className="mb-2 text-yellow-600 dark:text-yellow-400 text-center w-full">
                        The image is too large and will be resized from{" "}
                        {resizeInfoUrl.current[0]}x{resizeInfoUrl.current[1]} to{" "}
                        {resizeInfoUrl.resized[0]}x{resizeInfoUrl.resized[1]}{" "}
                        pixels.
                      </div>
                    )}
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
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="json" className="flex flex-col items-center">
              <div className="w-full max-w-sm">
                <div
                  {...getJsonRootProps()}
                  className="border-2 border-dashed border-blue-400 w-full p-8 rounded-lg flex flex-col items-center justify-center cursor-pointer transition hover:bg-blue-50 dark:border-blue-500 dark:hover:bg-gray-700/50"
                >
                  <input {...getJsonInputProps()} />
                  {jsonFile ? (
                    <div className="text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        height="50"
                        width="50"
                        className="text-green-500 dark:text-green-400 mx-auto"
                      >
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                      <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                        JSON file loaded successfully!
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {Object.keys(jsonFile).join(", ")}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-blue-600 dark:text-blue-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        height="50"
                        width="50"
                        className="text-blue-500 dark:text-blue-400"
                      >
                        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm8-6v-2h2v2h2v2h-2v2h-2v-2h-2v-2h2z" />
                      </svg>
                      <p className="mt-4 text-sm">
                        Drag & drop a JSON file here, or click to select one
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        (.json files only)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6 flex justify-center">
            <button
              className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all duration-300 dark:bg-blue-500 dark:hover:bg-blue-600 ${
                (activeTab === "local" && !dataURL) ||
                (activeTab === "url" && !imageUrl) ||
                (activeTab === "json" && !jsonFile)
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={handleImageUpload}
              disabled={
                (activeTab === "local" && !dataURL) ||
                (activeTab === "url" && !imageUrl) ||
                (activeTab === "json" && !jsonFile)
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
