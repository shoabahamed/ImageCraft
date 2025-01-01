import React, { createContext, useState, ReactNode } from "react";

// Define the type of the canvas object
type CanvasObject = any;

// Define the context type
interface CanvasObjectsContextType {
  selectedObject: CanvasObject | null;
  setSelectedObject: (obj: CanvasObject | null) => void;
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

  return (
    <CanvasObjectsContext.Provider
      value={{ selectedObject, setSelectedObject }}
    >
      {children}
    </CanvasObjectsContext.Provider>
  );
};
