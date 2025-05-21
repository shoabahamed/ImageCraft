import apiClient from "@/utils/appClient";
import { useAuthContext } from "@/hooks/useAuthContext";
import {
  Pencil,
  RotateCcw,
  Redo,
  Undo,
  Download,
  Save,
  Trash,
} from "lucide-react";
import IconComponent from "./icon-component";

import { Canvas, FabricImage, Group } from "fabric";
import { useToast } from "@/hooks/use-toast";
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";

import { useCommonProps } from "@/hooks/appStore/CommonProps";
import {
  base64ToFile,
  getCanvasDataUrl,
  getRotatedBoundingBox,
  isBase64,
  urlToBase64,
} from "@/utils/commonFunctions";
import NewProjectBox from "./NewProjectBox";

type Props = {
  canvas: Canvas;
  setLoadState: (val: boolean) => void;
  undo: () => void;
  redo: () => void;
};

const FooterAdmin = ({ canvas, setLoadState, undo, redo }: Props) => {
  const {
    selectedObject,
    downloadImageDimensions,
    allFiltersRef,
    loadedFromSaved,
  } = useCanvasObjects();
  const { user } = useAuthContext();
  const { toast } = useToast();

  const projectName = useCommonProps((state) => state.projectName);
  const setProjectName = useCommonProps((state) => state.setProjectName);
  const showUpdateButton = useCommonProps((state) => state.showUpdateButton);
  const setShowUpdateButton = useCommonProps(
    (state) => state.setShowUpdateButton
  );

  // Function to convert Blob to File
  const convertBlobToFile = (url) => {
    return new Promise((resolve, reject) => {
      // Fetch the blob from the URL
      fetch(url)
        .then((res) => res.blob())
        .then((blob) => {
          // Create a new File object using the Blob
          const file = new File([blob], "image.png", { type: "image/png" });
          resolve(file); // Resolve with the File object
        })
        .catch(reject); // Reject if any error occurs
    });
  };

  const onSaveCanvas = async () => {
    if (!canvas) return;
    setLoadState(true);
    try {
      if (!canvas) return;
      canvas.discardActiveObject();

      // group all the objects in the canvas
      const groupObject = new Group(canvas.getObjects());

      // save the original viewport transform and zoom

      const originalViewportTransform = canvas.viewportTransform;
      const originalZoom = canvas.getZoom();

      // Reset to neutral so that nothing is cropped
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      canvas.setZoom(1);
      canvas
        .getObjects() // @ts-ignore
        .find((obj) => obj.setCoords());

      // get the bounds of rotate bounding box and get the data url

      // console.log(dataURL);
      // console.log(groupObject.toObject(["name", "isUpper", "id"]));

      // json data
      const canvasJSON = groupObject.toObject(["name", "isUpper", "id"]);

      // Create FormData object and append the image and other canvas data
      const formData = new FormData();
      formData.append("username", user?.username);
      formData.append("canvasId", crypto.randomUUID());
      formData.append("canvasData", JSON.stringify(canvasJSON));

      formData.append("projectName", projectName);

      // Restore zoom & transform
      canvas.setViewportTransform(originalViewportTransform);
      canvas.setZoom(originalZoom);
      canvas
        .getObjects() // @ts-ignore
        .find((obj) => obj.setCoords());

      // canvas.add(...groupObject.removeAll());
      // canvas.remove(groupObject);
      // canvas.requestRenderAll();

      canvas.getObjects().forEach((obj) => canvas.remove(obj));

      // Post JSON data to the backend with JWT in headers
      const response = await apiClient.post(
        "/save_template",

        formData,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`, // Include 'Bearer'
          },
        }
      );

      setLoadState(false);

      if (response.status === 201) {
        console.log("canvas saved successfully");
        toast({
          description: "Canvas Successfully saved.",
          className: "bg-green-500 text-gray-900",
          duration: 2000,
        });
      } else if (response.status === 200) {
        toast({
          description: "Canvas Updated Successfully.",
          className: "bg-green-500 text-gray-900",
          duration: 2000,
        });
        console.log("updated canvas");
      } else {
        console.log("save failed");
        toast({
          variant: "destructive",
          description: "Save failed",
          className: "bg-red-500 text-gray-900",
          duration: 3000,
        });
      }

      // canvas.renderAll();
    } catch (error) {
      setLoadState(false);
      console.error("Error saving canvas:", error);
      toast({
        variant: "destructive",
        description: "Unexpected Error" + error,
        className: "bg-green-500 text-gray-900",
        duration: 3000,
      });
    }
  };

  const downloadCanvas = async () => {
    if (!canvas) return;

    canvas.discardActiveObject();

    // group all the objects in the canvas
    const groupObject = new Group(canvas.getObjects());

    // save the original viewport transform and zoom

    const originalViewportTransform = canvas.viewportTransform;
    const originalZoom = canvas.getZoom();

    // Reset to neutral so that nothing is cropped
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.setZoom(1);
    canvas
      .getObjects() // @ts-ignore
      .find((obj) => obj.setCoords());

    // get the bounds of rotate bounding box and get the data url

    const bounds = getRotatedBoundingBox(groupObject);

    const dataURL = canvas.toDataURL({
      format: "png",
      left: bounds.left,
      top: bounds.top,
      width: bounds.width,
      height: bounds.height,
    });

    console.log(dataURL);
    console.log(groupObject.toObject(["name", "isUpper", "id"]));

    // Restore zoom & transform
    canvas.setViewportTransform(originalViewportTransform);
    canvas.setZoom(originalZoom);
    canvas
      .getObjects() // @ts-ignore
      .find((obj) => obj.setCoords());

    canvas.getObjects().forEach((obj) => canvas.remove(obj));
    // canvas.add(...groupObject.removeAll());
    // canvas.remove(groupObject);

    // canvas.requestRenderAll();

    // Trigger download (optional, if you still want to download the image)
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "canvas-image.png";
    link.click();
  };

  const deleteObject = () => {
    if (selectedObject) {
      canvas.remove(selectedObject);
      canvas.renderAll();
    }
  };

  const handleRestore = () => {
    // removing all objects from the canvas
    canvas.getObjects().map((obj) => {
      canvas.remove(obj);
    });

    canvas.requestRenderAll();
  };

  return (
    <div className="flex w-full items-center justify-between rounded-none bg-white dark:bg-gray-950 border-b border-slate-800 dark:border-slate-900 border-t-2 gap-0 lg:gap-4">
      <div className="px-2 flex items-center gap-0 lg:gap-2">
        <Pencil className="text-gray-400 w-2 h-2 lg:w-5 lg:h-5" />{" "}
        {/* Pencil icon */}
        <input
          type="text"
          className="bg-gray-800 text-white font-semibold px-0 py-0 md:px-2 md:py-1 rounded-md border border-gray-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <NewProjectBox useButton={false} />
      </div>

      <div className="flex items-center gap-0 lg:gap-2">
        <IconComponent
          icon={<Undo />}
          iconName={"Undo"}
          extraStyles="px-0 py-0 md:px-1 py-1"
          handleClick={() => {
            undo();
          }}
        />
        <IconComponent
          icon={<RotateCcw />}
          iconName={"Restore"}
          extraStyles="px-0 py-0 md:px-1 py-1"
          handleClick={() => {
            handleRestore();
          }}
        />
        <IconComponent
          icon={<Redo />}
          iconName={"Redo"}
          extraStyles="px-0 py-0 md:px-1 py-1"
          handleClick={() => redo()}
        />
      </div>
      <div className="flex  items-center justify-center gap-2 sm:gap-2 md:gap-2 lg:gap-10">
        <button
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold transition-all duration-300 px-4 py-2"
          onClick={() => {
            downloadCanvas();
          }}
        >
          <span className="hidden lg:inline">Download</span>
          <Download className="lg:hidden w-5 h-5" />
        </button>

        <button
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold transition-all duration-300 px-4 py-2 text-blue-700"
          onClick={() => {
            if (user) {
              onSaveCanvas();
            } else {
              toast({
                description: "You need to log in first",
                className: "bg-green-500 text-gray-900",
                duration: 3000,
              });
            }
          }}
        >
          <span className="hidden lg:inline">
            {showUpdateButton ? "Update" : "Save"}
          </span>
          <Save className="lg:hidden w-5 h-5" />
        </button>

        {selectedObject && (
          <button
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold transition-all duration-300 px-4 py-2 text-red-800"
            onClick={deleteObject}
          >
            <span className="hidden lg:inline">Delete</span>
            <Trash className="lg:hidden w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default FooterAdmin;
