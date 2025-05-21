import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import IconComponent from "./icon-component";
import {
  UndoDot,
  RedoDot,
  UnfoldVertical,
  UnfoldHorizontal,
} from "lucide-react";
import { Canvas, FabricImage } from "fabric";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLogContext } from "@/hooks/useLogContext";
import ImageSize from "./ImageSize";
import { useArrangeStore } from "@/hooks/appStore/ArrangeStore";
import { Slider } from "./ui/slider";
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";
import {
  base64ToFile,
  getCanvasDataUrl,
  getRotatedBoundingBox,
} from "@/utils/commonFunctions";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/utils/appClient";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useAdjustStore } from "@/hooks/appStore/AdjustStore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const presetColors = [
  // Grays
  { color: "#ffffff", name: "White" },
  { color: "#e2e8f0", name: "Light Gray" },
  { color: "#94a3b8", name: "Gray" },
  { color: "#475569", name: "Dark Gray" },
  // Blues
  { color: "#93c5fd", name: "Light Blue" },
  { color: "#3b82f6", name: "Blue" },
  { color: "#1d4ed8", name: "Dark Blue" },
  // Greens
  { color: "#86efac", name: "Light Green" },
  { color: "#22c55e", name: "Green" },
  { color: "#15803d", name: "Dark Green" },
  // Reds
  { color: "#fca5a5", name: "Light Red" },
  { color: "#ef4444", name: "Red" },
  { color: "#b91c1c", name: "Dark Red" },
  // Purples
  { color: "#d8b4fe", name: "Light Purple" },
  { color: "#a855f7", name: "Purple" },
  { color: "#7e22ce", name: "Dark Purple" },
  // Oranges
  { color: "#fdba74", name: "Light Orange" },
  { color: "#f97316", name: "Orange" },
  { color: "#c2410c", name: "Dark Orange" },
  // Teals
  { color: "#5eead4", name: "Light Teal" },
  { color: "#14b8a6", name: "Teal" },
  { color: "#0f766e", name: "Dark Teal" },
];

type ArrangeProps = {
  canvas: Canvas;
};

const ArrangeAdmin = ({ canvas }: ArrangeProps) => {
  const backgroundColor = useArrangeStore((state) => state.backgroundColor);
  const setBackgroundColor = useArrangeStore(
    (state) => state.setBackgroundColor
  );

  const handleBackgroundColorChange = (
    color: string,
    fireModified: boolean
  ) => {
    setBackgroundColor(color);

    canvas.backgroundColor = color;
    canvas.requestRenderAll();

    if (fireModified) canvas.fire("object:modified");
  };

  const handleRemoveBackground = () => {
    if (backgroundColor !== "transparent") {
      setBackgroundColor("transparent");

      canvas.backgroundColor = "transparent";
      canvas.requestRenderAll();

      canvas.fire("object:modified");
    }
  };

  return (
    <div className="flex flex-col md:flex-col items-center justify-center w-full gap-4">
      <div className="w-[90%]">
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-base font-medium">
                Background
              </CardDescription>
              {/* <button
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    onClick={handleResetBackground}
                  >
                    Reset
                  </button> */}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <input
                    type="color"
                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700 bg-transparent transition-all duration-200 hover:scale-105 hover:shadow-sm"
                    value={
                      backgroundColor === "transparent"
                        ? "#00000000"
                        : backgroundColor
                    }
                    onChange={(e) =>
                      handleBackgroundColorChange(e.target.value, false)
                    }
                    onBlur={() => {
                      canvas.fire("object:modified");
                    }}
                  />
                  {backgroundColor === "transparent" && (
                    <div
                      className="absolute inset-0 rounded-lg pointer-events-none"
                      style={{
                        backgroundImage: `
                              linear-gradient(45deg, #ccc 25%, transparent 25%),
                              linear-gradient(-45deg, #ccc 25%, transparent 25%),
                              linear-gradient(45deg, transparent 75%, #ccc 75%),
                              linear-gradient(-45deg, transparent 75%, #ccc 75%)
                            `,
                        backgroundSize: "10px 10px",
                        backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0px",
                      }}
                    />
                  )}
                  <div className="absolute inset-0 rounded-lg pointer-events-none border border-gray-200 dark:border-gray-700"></div>
                </div>
                <button
                  className="flex-1 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  onClick={handleRemoveBackground}
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-8 gap-1.5">
                {presetColors.map(({ color, name }) => (
                  <TooltipProvider key={color}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="group"
                          onClick={() =>
                            handleBackgroundColorChange(color, true)
                          }
                        >
                          <div
                            className="w-5 h-5 rounded-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:scale-110 hover:shadow-sm"
                            style={{ backgroundColor: color }}
                          />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ArrangeAdmin;
