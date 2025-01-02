import { CanvasObjectsContext } from "@/context/CanvasObjectContext";
import { useContext } from "react";

// Custom hook to use the context
export const useCanvasObjects = () => {
  const context = useContext(CanvasObjectsContext);
  if (!context) {
    throw new Error(
      "useCanvasObjects must be used within a CanvasObjectsProvider"
    );
  }
  return context;
};
