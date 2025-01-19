import React, { createContext, useState, ReactNode } from "react";

// Define the type of the canvas object
type CanvasObject = any;
interface ImageDimensions {
  imageWidth: number;
  imageHeight: number;
}
interface ContainerDimensions {
  contWidth: number;
  contHeight: number;
}

// Define the context type
interface CanvasObjectsContextType {
  selectedObject: CanvasObject | null;
  setSelectedObject: (obj: CanvasObject | null) => void;
  currentImageDim: ImageDimensions;
  setCurrentImageDim: (obj: ImageDimensions) => void;
  currentContDim: ContainerDimensions;
  setCurrentContDim: (obj: ContainerDimensions) => void;
}

// Create the context with a default value
export const CanvasObjectsContext = createContext<
  CanvasObjectsContextType | undefined
>(undefined);

// Create a provider component
export const CanvasObjectsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [selectedObject, setSelectedObject] = useState<CanvasObject | null>(
    null
  );
  const [currentImageDim, setCurrentImageDim] = useState({
    imageWidth: 0,
    imageHeight: 0,
  });
  const [currentContDim, setCurrentContDim] = useState({
    contWidth: 0,
    contHeight: 0,
  });

  return (
    <CanvasObjectsContext.Provider
      value={{
        selectedObject,
        setSelectedObject,
        currentContDim,
        setCurrentContDim,
        currentImageDim,
        setCurrentImageDim,
      }}
    >
      {children}
    </CanvasObjectsContext.Provider>
  );
};
