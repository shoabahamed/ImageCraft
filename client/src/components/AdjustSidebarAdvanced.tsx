import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

import CustomSlider from "@/components/custom-slider";
import { Canvas, FabricImage } from "fabric";
import { useLogContext } from "@/hooks/useLogContext";
import { useAdjustStore } from "@/hooks/appStore/AdjustStore";

import { getRotatedBoundingBox } from "@/utils/commonFunctions";
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";

import {
  FlipHorizontal,
  FlipVertical,
  CornerLeftUp,
  CornerRightUp,
  CornerLeftDown,
  CornerRightDown,
  RotateCcw,
  CheckCircle,
} from "lucide-react";

import {
  Camera,
  Filter,
  Sparkles,
  Wand2,
  Moon,
  Palette,
  Sun,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCommonProps } from "@/hooks/appStore/CommonProps";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type AdjustSidebarProps = {
  canvas: Canvas;
  image: FabricImage;
  imageRef: React.RefObject<FabricImage>;
  databaseFiltersName: string[] | null;
  databaseFiltersObject: object[] | null;
  setLoadState: (value: boolean) => void;
};

const AdjustSidebarAdvanced = ({
  canvas,
  image,
  imageRef,
  setLoadState,
}: AdjustSidebarProps) => {
  const { addLog } = useLogContext(); // Use log context
  const { disableSavingIntoStackRef, allFiltersRef } = useCanvasObjects();
  const currentFilters = useCommonProps((state) => state.currentFilters);

  const resetFilters = useAdjustStore((state) => state.resetFilters);

  const handleColorReset = () => {
    addLog({
      section: "adjust",
      tab: "color",
      event: "reset",
      message: `reseted all image color related properties `,
    });
  };

  const handleDetailReset = () => {
    addLog({
      section: "adjust",
      tab: "detail",
      event: "reset",
      message: `reseted all image detail properties `,
    });
  };

  const handleFilterReset = () => {
    addLog({
      section: "adjust",
      tab: "filter",
      event: "deletion",
      message: `removed all predefined filters`,
    });
  };

  const handleApplyFilter = () => {
    addLog({
      section: "adjust",
      tab: "mode",
      event: "update",
      message: "filters permanently applied",
      param: "filters",
      objType: "image",
    });

    disableSavingIntoStackRef.current = true;
    const filtersInCanvas: string[] = currentFilters.map((f) => f.filterName);
    allFiltersRef.current = allFiltersRef.current.concat(filtersInCanvas);
    setLoadState(true);

    // Temporarily set visible = false for all objects other than image type
    canvas.getObjects().forEach((obj) => {
      if (obj.type !== "image") {
        obj.set("visible", false);
      }
    });

    const scaleX = image.scaleX;
    const scaleY = image.scaleY;
    const flipX = image.flipX;
    const filpY = image.flipY;
    const angle = image.angle;

    image.angle = 0;
    image.scaleX = 1;
    image.scaleY = 1;
    image.flipX = false;
    image.flipY = false;

    const originalViewportTransform = canvas.viewportTransform;
    const originalZoom = canvas.getZoom();

    // Reset to neutral
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

    canvas.setZoom(1);
    canvas
      .getObjects() // @ts-ignore
      .find((obj) => obj.setCoords());

    // Find the object named "Frame" or starting with "Frame"
    const bounds = getRotatedBoundingBox(image);
    const dataURL = canvas.toDataURL({
      format: "png",
      left: bounds.left,
      top: bounds.top,
      width: bounds.width,
      height: bounds.height,
    });

    FabricImage.fromURL(dataURL).then((img) => {
      if (!img || !imageRef.current) return;
      resetFilters();
      // Replace the image content

      console.log("djf");
      imageRef.current.setElement(img.getElement());

      imageRef.current.scaleX = scaleX;
      imageRef.current.scaleY = scaleY;

      imageRef.current.flipX = flipX;
      imageRef.current.flipY = filpY;

      imageRef.current.angle = angle;

      imageRef.current.opacity = 1.0;

      // imageRef.current.filters = []

      image = imageRef.current;

      //  set visible = true for all objects other than image type
      canvas.getObjects().forEach((obj) => {
        if (obj.type !== "image") {
          obj.set("visible", true);
        }
      });

      // Restore zoom & transform
      canvas.setViewportTransform(originalViewportTransform);
      canvas.setZoom(originalZoom);
      canvas
        .getObjects() // @ts-ignore
        .find((obj) => obj.setCoords());

      setTimeout(() => {
        imageRef.current.filters = []; // not sure if it is needed
        disableSavingIntoStackRef.current = false;
        setLoadState(false);
        canvas.renderAll();
        canvas.fire("object:modified");
      }, 1000);
    });
  };

  const enableLeftReflect = useAdjustStore((state) => state.enableLeftReflect);
  const setEnableLeftReflect = useAdjustStore(
    (state) => state.setEnableLeftReflect
  );

  return (
    <div className="max-h-full flex flex-col items-center justify-center w-full gap-4">
      <Tabs
        defaultValue="fun"
        className="w-full flex-1 flex flex-col rounded-none"
      >
        <div className="border-b border-gray-200 dark:border-gray-800">
          <TabsList className="w-full grid grid-cols-4 rounded-none">
            <TabsTrigger value="fun">Fun</TabsTrigger>
          </TabsList>
        </div>

        {/* Preset Filters Tab */}
        <TabsContent
          value="fun"
          className="flex-1 flex flex-col justify-center items-center"
        >
          <div className="w-[90%]">
            <Card>
              <CardHeader>
                <CardDescription className="text-center">
                  Reflection Controls
                </CardDescription>
              </CardHeader>
              <CardContent className="w-full flex flex-col gap-2">
                <div className="grid grid-cols-3 gap-4">
                  <div
                    onClick={() => {
                      const filterName = "Left reflect";
                      addLog({
                        section: "adjust",
                        tab: "filters",
                        event: "update",
                        message: !enableLeftReflect
                          ? `enabled ${filterName} filter`
                          : `disabled ${filterName} scale filter`,
                      });
                      setEnableLeftReflect(!enableLeftReflect);
                    }}
                    className={`
        flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer
        ${
          enableLeftReflect
            ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
            : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
        }
        transition-all
      `}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${
                        enableLeftReflect
                          ? "bg-blue-200 dark:bg-blue-800"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={
                          enableLeftReflect
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }
                      >
                        <FlipHorizontal size={20} />
                      </span>
                    </div>
                    <span className="text-sm font-medium">Left</span>
                  </div>
                  <div
                    onClick={() => {
                      const filterName = "Right reflect";
                      addLog({
                        section: "adjust",
                        tab: "filters",
                        event: "update",
                        message: !enableLeftReflect
                          ? `enabled ${filterName} filter`
                          : `disabled ${filterName} scale filter`,
                      });
                      setEnableLeftReflect(!enableLeftReflect);
                    }}
                    className={`
        flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer
        ${
          enableLeftReflect
            ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
            : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
        }
        transition-all
      `}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${
                        enableLeftReflect
                          ? "bg-blue-200 dark:bg-blue-800"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={
                          enableLeftReflect
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }
                      >
                        <FlipHorizontal size={20} />
                      </span>
                    </div>
                    <span className="text-sm font-medium">Right</span>
                  </div>
                  <div
                    onClick={() => {
                      const filterName = "Top reflect";
                      addLog({
                        section: "adjust",
                        tab: "filters",
                        event: "update",
                        message: !enableLeftReflect
                          ? `enabled ${filterName} filter`
                          : `disabled ${filterName} scale filter`,
                      });
                      setEnableLeftReflect(!enableLeftReflect);
                    }}
                    className={`
        flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer
        ${
          enableLeftReflect
            ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
            : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
        }
        transition-all
      `}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${
                        enableLeftReflect
                          ? "bg-blue-200 dark:bg-blue-800"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={
                          enableLeftReflect
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }
                      >
                        <FlipVertical size={20} />
                      </span>
                    </div>
                    <span className="text-sm font-medium">Top</span>
                  </div>
                  <div
                    onClick={() => {
                      const filterName = "Bottom reflect";
                      addLog({
                        section: "adjust",
                        tab: "filters",
                        event: "update",
                        message: !enableLeftReflect
                          ? `enabled ${filterName} filter`
                          : `disabled ${filterName} scale filter`,
                      });
                      setEnableLeftReflect(!enableLeftReflect);
                    }}
                    className={`
        flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer
        ${
          enableLeftReflect
            ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
            : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
        }
        transition-all
      `}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${
                        enableLeftReflect
                          ? "bg-blue-200 dark:bg-blue-800"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={
                          enableLeftReflect
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }
                      >
                        <FlipVertical size={20} />
                      </span>
                    </div>
                    <span className="text-sm font-medium">Bottom</span>
                  </div>
                  <div
                    onClick={() => {
                      const filterName = "Top Left";
                      addLog({
                        section: "adjust",
                        tab: "filters",
                        event: "update",
                        message: !enableLeftReflect
                          ? `enabled ${filterName} filter`
                          : `disabled ${filterName} scale filter`,
                      });
                      setEnableLeftReflect(!enableLeftReflect);
                    }}
                    className={`
        flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer
        ${
          enableLeftReflect
            ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
            : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
        }
        transition-all
      `}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${
                        enableLeftReflect
                          ? "bg-blue-200 dark:bg-blue-800"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={
                          enableLeftReflect
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }
                      >
                        <CornerLeftUp size={20} />
                      </span>
                    </div>
                    <span className="text-sm font-medium">Top-Left</span>
                  </div>

                  <div
                    onClick={() => {
                      const filterName = "Top Right";
                      addLog({
                        section: "adjust",
                        tab: "filters",
                        event: "update",
                        message: !enableLeftReflect
                          ? `enabled ${filterName} filter`
                          : `disabled ${filterName} scale filter`,
                      });
                      setEnableLeftReflect(!enableLeftReflect);
                    }}
                    className={`
        flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer
        ${
          enableLeftReflect
            ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
            : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
        }
        transition-all
      `}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${
                        enableLeftReflect
                          ? "bg-blue-200 dark:bg-blue-800"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={
                          enableLeftReflect
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }
                      >
                        <CornerRightUp size={20} />
                      </span>
                    </div>
                    <span className="text-sm font-medium">Top-right</span>
                  </div>

                  <div
                    onClick={() => {
                      const filterName = "Bottom Right";
                      addLog({
                        section: "adjust",
                        tab: "filters",
                        event: "update",
                        message: !enableLeftReflect
                          ? `enabled ${filterName} filter`
                          : `disabled ${filterName} scale filter`,
                      });
                      setEnableLeftReflect(!enableLeftReflect);
                    }}
                    className={`
        flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer
        ${
          enableLeftReflect
            ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
            : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
        }
        transition-all
      `}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${
                        enableLeftReflect
                          ? "bg-blue-200 dark:bg-blue-800"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={
                          enableLeftReflect
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }
                      >
                        <CornerRightDown size={20} />
                      </span>
                    </div>
                    <span className="text-sm font-medium">Bottom Right</span>
                  </div>

                  <div
                    onClick={() => {
                      const filterName = "Bottom Left";
                      addLog({
                        section: "adjust",
                        tab: "filters",
                        event: "update",
                        message: !enableLeftReflect
                          ? `enabled ${filterName} filter`
                          : `disabled ${filterName} scale filter`,
                      });
                      setEnableLeftReflect(!enableLeftReflect);
                    }}
                    className={`
        flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer
        ${
          enableLeftReflect
            ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
            : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
        }
        transition-all
      `}
                  >
                    <div
                      className={`p-2 rounded-full mb-2 ${
                        enableLeftReflect
                          ? "bg-blue-200 dark:bg-blue-800"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={
                          enableLeftReflect
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }
                      >
                        <CornerLeftDown size={20} />
                      </span>
                    </div>
                    <span className="text-sm font-medium">Bottom Left</span>
                  </div>
                </div>

                <button
                  className="w-full mt-2 p-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm"
                  onClick={() => handleFilterReset()}
                >
                  Reset All
                </button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription className="text-center">Mode</CardDescription>
          </CardHeader>

          <CardContent className="w-full">
            <div className="flex flex-col gap-4 w-full">
              <button
                className="custom-button"
                onClick={() => handleApplyFilter()}
              >
                Apply
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdjustSidebarAdvanced;
