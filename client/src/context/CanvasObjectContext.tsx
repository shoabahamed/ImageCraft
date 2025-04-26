import { ImageIcon } from "lucide-react";
import { createContext, useState, ReactNode, useRef } from "react";

// Define the type of the canvas object
type CanvasObject = any;
interface originalImageDimensionsType {
  imageWidth: number;
  imageHeight: number;
}
interface finalImageDimensionsType {
  imageWidth: number;
  imageHeight: number;
}

type AspectRatioType = {
  ratio: string;
  value: string;
  icon: JSX.Element;
};

// Define the context type
interface CanvasObjectsContextType {
  selectedObject: CanvasObject | null;
  setSelectedObject: (obj: CanvasObject | null) => void;
  originalImageDimensions: originalImageDimensionsType;
  setOriginalImageDimensions: (obj: originalImageDimensionsType) => void; // this is the original dimension of the image
  finalImageDimensions: finalImageDimensionsType;
  setFinalImageDimensions: (obj: finalImageDimensionsType) => void; // this is the change dimension of the image
  downloadImageDimensions: finalImageDimensionsType;
  setDownloadImageDimensions: (obj: finalImageDimensionsType) => void; // this is the actual dimension in which the image would be downloaded
  loadedFromSaved: boolean;
  setLoadedFromSaved: (value: boolean) => void;
  zoomValue: number;
  setZoomValue: (value: number) => void;

  originalImageDimensionsRef: React.MutableRefObject<originalImageDimensionsType>;
  finalImageDimensionsRef: React.MutableRefObject<finalImageDimensionsType>;
  downloadImageDimensionsRef: React.MutableRefObject<finalImageDimensionsType>;

  selectedRatio: AspectRatioType;
  setSelectedRatio: (obj: AspectRatioType) => void;
  disableSavingIntoStackRef: React.MutableRefObject<boolean>;
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
  const [originalImageDimensions, setOriginalImageDimensions] =
    useState<originalImageDimensionsType>({
      imageWidth: 0,
      imageHeight: 0,
    });
  const [finalImageDimensions, setFinalImageDimensions] =
    useState<finalImageDimensionsType>({
      imageWidth: 0,
      imageHeight: 0,
    });

  const [downloadImageDimensions, setDownloadImageDimensions] =
    useState<finalImageDimensionsType>({ imageWidth: 0, imageHeight: 0 });

  const originalImageDimensionsRef = useRef<originalImageDimensionsType>({
    imageWidth: 0,
    imageHeight: 0,
  });
  const finalImageDimensionsRef = useRef<finalImageDimensionsType>({
    imageWidth: 0,
    imageHeight: 0,
  });

  const downloadImageDimensionsRef = useRef<finalImageDimensionsType>({
    imageWidth: 0,
    imageHeight: 0,
  });

  const disableSavingIntoStackRef = useRef<boolean>(false);

  const [loadedFromSaved, setLoadedFromSaved] = useState(false);

  const [zoomValue, setZoomValue] = useState(1);

  const [selectedRatio, setSelectedRatio] = useState<AspectRatioType>({
    ratio: "Original",
    value: "original",
    icon: <ImageIcon className="w-5 h-5" />,
  });

  return (
    <CanvasObjectsContext.Provider
      value={{
        selectedObject,
        setSelectedObject,
        originalImageDimensions,
        finalImageDimensions,
        setFinalImageDimensions,
        setOriginalImageDimensions,
        downloadImageDimensions,
        setDownloadImageDimensions,
        loadedFromSaved,
        setLoadedFromSaved,
        zoomValue,
        setZoomValue,
        originalImageDimensionsRef,
        finalImageDimensionsRef,
        downloadImageDimensionsRef,
        selectedRatio,
        setSelectedRatio,
        disableSavingIntoStackRef,
      }}
    >
      {children}
    </CanvasObjectsContext.Provider>
  );
};
