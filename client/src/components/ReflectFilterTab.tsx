import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

import { Canvas, FabricImage, filters } from "fabric";
import { useLogContext } from "@/hooks/useLogContext";
import { useAdjustStore } from "@/hooks/appStore/AdjustStore";

import { updateOrInsert } from "@/utils/commonFunctions";
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";

import {
  FlipHorizontal,
  FlipVertical,
  CornerLeftUp,
  CornerRightUp,
  CornerLeftDown,
  CornerRightDown,
} from "lucide-react";

import { useCommonProps } from "@/hooks/appStore/CommonProps";

import { ReflectFilter } from "@/utils/ReflectFilter";

interface FilterEntry {
  filterName: string;
  instance: filters.BaseFilter<
    string,
    Record<string, unknown>,
    Record<string, unknown>
  >;
}

type Props = {
  canvasRef: React.RefObject<Canvas>;
  imageRef: React.RefObject<FabricImage>;
};

const ReflectFilterTab = ({ canvasRef, imageRef }: Props) => {
  const { addLog } = useLogContext();
  const setCurrentFilters = useCommonProps((state) => state.setCurrentFilters);
  const { currentFiltersRef } = useCanvasObjects() as {
    currentFiltersRef: React.MutableRefObject<FilterEntry[] | null>;
  };

  const enableLeftToRightReflect = useAdjustStore(
    (state) => state.enableLeftToRightReflect
  );
  const enableRightToLeftReflect = useAdjustStore(
    (state) => state.enableRightToLeftReflect
  );
  const enableTopToBottomReflect = useAdjustStore(
    (state) => state.enableTopToBottomReflect
  );
  const enableBottomToTopReflect = useAdjustStore(
    (state) => state.enableBottomToTopReflect
  );
  const enableTopLeftReflect = useAdjustStore(
    (state) => state.enableTopLeftReflect
  );
  const enableTopRightReflect = useAdjustStore(
    (state) => state.enableTopRightReflect
  );
  const enableBottomLeftReflect = useAdjustStore(
    (state) => state.enableBottomLeftReflect
  );
  const enableBottomRightReflect = useAdjustStore(
    (state) => state.enableBottomRightReflect
  );

  const setEnableLeftToRightReflect = useAdjustStore(
    (state) => state.setEnableLeftToRightReflect
  );
  const setEnableRightToLeftReflect = useAdjustStore(
    (state) => state.setEnableRightToLeftReflect
  );
  const setEnableTopToBottomReflect = useAdjustStore(
    (state) => state.setEnableTopToBottomReflect
  );
  const setEnableBottomToTopReflect = useAdjustStore(
    (state) => state.setEnableBottomToTopReflect
  );
  const setEnableTopLeftReflect = useAdjustStore(
    (state) => state.setEnableTopLeftReflect
  );
  const setEnableTopRightReflect = useAdjustStore(
    (state) => state.setEnableTopRightReflect
  );
  const setEnableBottomLeftReflect = useAdjustStore(
    (state) => state.setEnableBottomLeftReflect
  );
  const setEnableBottomRightReflect = useAdjustStore(
    (state) => state.setEnableBottomRightReflect
  );

  const enableLeftDiagonalReflect = useAdjustStore(
    (state) => state.enableLeftDiagonalReflect
  );
  const enableRightDiagonalReflect = useAdjustStore(
    (state) => state.enableRightDiagonalReflect
  );

  const setEnableLeftDiagonalReflect = useAdjustStore(
    (state) => state.setEnableLeftDiagonalReflect
  );
  const setEnableRightDiagonalReflect = useAdjustStore(
    (state) => state.setEnableRightDiagonalReflect
  );

  const handleReflectFilter = (filterName: string, value: boolean) => {
    addLog({
      section: "adjust",
      tab: "filter",
      event: "update",
      message: `${filterName} filter ${value ? "enabled" : "disabled"}`,
    });

    const filtersList = [...(currentFiltersRef.current || [])];
    console.log("old filters", filtersList);

    switch (filterName) {
      case "leftToRight":
        setEnableLeftToRightReflect(value);
        updateOrInsert(
          filtersList,
          "leftToRight",
          new ReflectFilter({
            reflectType: "leftToRight",
          }),
          value
        );
        break;

      case "rightToLeft":
        setEnableRightToLeftReflect(value);
        updateOrInsert(
          filtersList,
          "rightToLeft",
          new ReflectFilter({
            reflectType: "rightToLeft",
          }),
          value
        );
        break;

      case "bottomToTop":
        setEnableBottomToTopReflect(value);
        updateOrInsert(
          filtersList,
          "bottomToTop",
          new ReflectFilter({
            reflectType: "bottomToTop",
          }),
          value
        );
        break;

      case "topToBottom":
        setEnableTopToBottomReflect(value);
        updateOrInsert(
          filtersList,
          "topToBottom",
          new ReflectFilter({
            reflectType: "topToBottom",
          }),
          value
        );
        break;

      case "topRight":
        setEnableTopRightReflect(value);
        updateOrInsert(
          filtersList,
          "topRight",
          new ReflectFilter({
            reflectType: "topRight",
          }),
          value
        );

        break;

      case "topLeft":
        setEnableTopLeftReflect(value);
        updateOrInsert(
          filtersList,
          "topLeft",
          new ReflectFilter({
            reflectType: "topLeft",
          }),
          value
        );
        break;

      case "bottomRight":
        setEnableBottomRightReflect(value);
        updateOrInsert(
          filtersList,
          "bottomRight",
          new ReflectFilter({
            reflectType: "bottomRight",
          }),
          value
        );

        break;
      case "bottomLeft":
        setEnableBottomLeftReflect(value);
        updateOrInsert(
          filtersList,
          "bottomLeft",
          new ReflectFilter({
            reflectType: "bottomLeft",
          }),
          value
        );
        break;

      case "leftDiagonal":
        setEnableLeftDiagonalReflect(value);
        updateOrInsert(
          filtersList,
          "leftDiagonal",
          new ReflectFilter({
            reflectType: "leftDiagonal",
          }),
          value
        );
        break;

      case "rightDiagonal":
        setEnableRightDiagonalReflect(value);
        updateOrInsert(
          filtersList,
          "rightDiagonal",
          new ReflectFilter({
            reflectType: "rightDiagonal",
          }),
          value
        );
        break;

      default:
        break;
    }

    const filterInstances = filtersList.map(
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;

    imageRef.current.applyFilters();

    canvasRef.current.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;

    canvasRef.current.fire("object:modified");
  };
  const handleReflectFilterReset = () => {
    addLog({
      section: "adjust",
      tab: "filter",
      event: "deletion",
      message: `removed all reflect filters`,
    });

    setEnableLeftToRightReflect(false);
    setEnableRightToLeftReflect(false);
    setEnableTopToBottomReflect(false);
    setEnableBottomToTopReflect(false);
    setEnableTopLeftReflect(false);
    setEnableTopRightReflect(false);
    setEnableBottomLeftReflect(false);
    setEnableBottomRightReflect(false);
    setEnableLeftDiagonalReflect(false);
    setEnableRightDiagonalReflect(false);

    const filtersList = [...(currentFiltersRef.current || [])];

    updateOrInsert(
      filtersList,
      "leftToRight",
      new ReflectFilter({ reflectType: "leftToRight" }),
      false
    );
    updateOrInsert(
      filtersList,
      "rightToLeft",
      new ReflectFilter({ reflectType: "rightToLeft" }),
      false
    );
    updateOrInsert(
      filtersList,
      "topToBottom",
      new ReflectFilter({ reflectType: "topToBottom" }),
      false
    );
    updateOrInsert(
      filtersList,
      "bottomToTop",
      new ReflectFilter({ reflectType: "bottomToTop" }),
      false
    );
    updateOrInsert(
      filtersList,
      "topLeft",
      new ReflectFilter({ reflectType: "topLeft" }),
      false
    );
    updateOrInsert(
      filtersList,
      "topRight",
      new ReflectFilter({ reflectType: "topRight" }),
      false
    );
    updateOrInsert(
      filtersList,
      "bottomLeft",
      new ReflectFilter({ reflectType: "bottomLeft" }),
      false
    );
    updateOrInsert(
      filtersList,
      "bottomRight",
      new ReflectFilter({ reflectType: "bottomRight" }),
      false
    );
    updateOrInsert(
      filtersList,
      "leftDiagonal",
      new ReflectFilter({ reflectType: "leftDiagonal" }),
      false
    );
    updateOrInsert(
      filtersList,
      "rightDiagonal",
      new ReflectFilter({ reflectType: "rightDiagonal" }),
      false
    );

    const filterInstances = filtersList.map(
      (tempFilter) => tempFilter.instance
    );
    console.log("new filters", filterInstances);

    imageRef.current.filters = filterInstances;
    imageRef.current.applyFilters();
    canvasRef.current.requestRenderAll();

    setCurrentFilters(filtersList);
    currentFiltersRef.current = filtersList;

    canvasRef.current.fire("object:modified");
  };

  return (
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
              onClick={() =>
                handleReflectFilter("leftToRight", !enableLeftToRightReflect)
              }
              className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer ${
                enableLeftToRightReflect
                  ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                  : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <div
                className={`p-2 rounded-full mb-2 ${
                  enableLeftToRightReflect
                    ? "bg-blue-200 dark:bg-blue-800"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <FlipHorizontal
                  size={20}
                  className={
                    enableLeftToRightReflect ? "text-blue-600" : "text-gray-600"
                  }
                />
              </div>
              <span className="text-sm font-medium">Left</span>
            </div>

            <div
              onClick={() =>
                handleReflectFilter("rightToLeft", !enableRightToLeftReflect)
              }
              className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer ${
                enableRightToLeftReflect
                  ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                  : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <div
                className={`p-2 rounded-full mb-2 ${
                  enableRightToLeftReflect
                    ? "bg-blue-200 dark:bg-blue-800"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <FlipHorizontal
                  size={20}
                  className={
                    enableRightToLeftReflect ? "text-blue-600" : "text-gray-600"
                  }
                />
              </div>
              <span className="text-sm font-medium">Right</span>
            </div>

            <div
              onClick={() =>
                handleReflectFilter("topToBottom", !enableTopToBottomReflect)
              }
              className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer ${
                enableTopToBottomReflect
                  ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                  : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <div
                className={`p-2 rounded-full mb-2 ${
                  enableTopToBottomReflect
                    ? "bg-blue-200 dark:bg-blue-800"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <FlipVertical
                  size={20}
                  className={
                    enableTopToBottomReflect ? "text-blue-600" : "text-gray-600"
                  }
                />
              </div>
              <span className="text-sm font-medium">Top</span>
            </div>

            <div
              onClick={() =>
                handleReflectFilter("bottomToTop", !enableBottomToTopReflect)
              }
              className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer ${
                enableBottomToTopReflect
                  ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                  : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <div
                className={`p-2 rounded-full mb-2 ${
                  enableBottomToTopReflect
                    ? "bg-blue-200 dark:bg-blue-800"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <FlipVertical
                  size={20}
                  className={
                    enableBottomToTopReflect ? "text-blue-600" : "text-gray-600"
                  }
                />
              </div>
              <span className="text-sm font-medium">Bottom</span>
            </div>

            <div
              onClick={() =>
                handleReflectFilter("topLeft", !enableTopLeftReflect)
              }
              className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer ${
                enableTopLeftReflect
                  ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                  : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <div
                className={`p-2 rounded-full mb-2 ${
                  enableTopLeftReflect
                    ? "bg-blue-200 dark:bg-blue-800"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <CornerLeftUp
                  size={20}
                  className={
                    enableTopLeftReflect ? "text-blue-600" : "text-gray-600"
                  }
                />
              </div>
              <span className="text-sm font-medium pointer-events-none">
                Top-Left
              </span>
            </div>

            <div
              onClick={() =>
                handleReflectFilter("topRight", !enableTopRightReflect)
              }
              className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer ${
                enableTopRightReflect
                  ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                  : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <div
                className={`p-2 rounded-full mb-2 ${
                  enableTopRightReflect
                    ? "bg-blue-200 dark:bg-blue-800"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <CornerRightUp
                  size={20}
                  className={
                    enableTopRightReflect ? "text-blue-600" : "text-gray-600"
                  }
                />
              </div>
              <span className="text-sm font-medium pointer-events-none">
                Top-Right
              </span>
            </div>

            <div
              onClick={() =>
                handleReflectFilter("bottomLeft", !enableBottomLeftReflect)
              }
              className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer ${
                enableBottomLeftReflect
                  ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                  : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <div
                className={`p-2 rounded-full mb-2 ${
                  enableBottomLeftReflect
                    ? "bg-blue-200 dark:bg-blue-800"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <CornerLeftDown
                  size={20}
                  className={
                    enableBottomLeftReflect ? "text-blue-600" : "text-gray-600"
                  }
                />
              </div>
              <span className="text-sm font-medium pointer-events-none">
                Bottom-Left
              </span>
            </div>

            <div
              onClick={() =>
                handleReflectFilter("bottomRight", !enableBottomRightReflect)
              }
              className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer ${
                enableBottomRightReflect
                  ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                  : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <div
                className={`p-2 rounded-full mb-2 ${
                  enableBottomRightReflect
                    ? "bg-blue-200 dark:bg-blue-800"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <CornerRightDown
                  size={20}
                  className={
                    enableBottomRightReflect ? "text-blue-600" : "text-gray-600"
                  }
                />
              </div>
              <span className="text-sm font-medium pointer-events-none">
                Bottom-Right
              </span>
            </div>

            <div
              onClick={() =>
                handleReflectFilter("leftDiagonal", !enableLeftDiagonalReflect)
              }
              className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer ${
                enableLeftDiagonalReflect
                  ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                  : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <div
                className={`p-2 rounded-full mb-2 ${
                  enableLeftDiagonalReflect
                    ? "bg-blue-200 dark:bg-blue-800"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={enableLeftDiagonalReflect ? "#2563eb" : "#4b5563"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="4" y1="20" x2="20" y2="4" />
                  <polyline points="4,4 4,20 20,20" />
                </svg>
              </div>
              <span className="text-sm font-medium pointer-events-none">
                Left Diagonal
              </span>
            </div>

            <div
              onClick={() =>
                handleReflectFilter(
                  "rightDiagonal",
                  !enableRightDiagonalReflect
                )
              }
              className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer ${
                enableRightDiagonalReflect
                  ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                  : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <div
                className={`p-2 rounded-full mb-2 ${
                  enableRightDiagonalReflect
                    ? "bg-blue-200 dark:bg-blue-800"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={enableRightDiagonalReflect ? "#2563eb" : "#4b5563"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="4" y1="4" x2="20" y2="20" />
                  <polyline points="20,4 20,20 4,20" />
                </svg>
              </div>
              <span className="text-sm font-medium pointer-events-none">
                Right Diagonal
              </span>
            </div>
          </div>

          <button
            className="w-full mt-2 p-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm"
            onClick={() => handleReflectFilterReset()}
          >
            Reset All
          </button>
        </CardContent>
      </Card>
    </div>
  );
};
export default ReflectFilterTab;
