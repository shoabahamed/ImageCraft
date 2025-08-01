// TemplatePreview.jsx
import { useEffect, useRef } from "react";
import { StaticCanvas, util, FabricObject } from "fabric";

export default function TemplatePreview({ objects }) {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    // Get the parent container's dimensions
    const container = canvasEl.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const fabricCanvas = new StaticCanvas(canvasEl, {
      width: containerWidth,
      height: containerHeight,
      enableRetinaScaling: false,
      backgroundColor: "#969696",
    });

    fabricCanvasRef.current = fabricCanvas;

    const updateCanvas = () => {
      const container = canvasEl.parentElement;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      fabricCanvas.setDimensions({
        width: containerWidth,
        height: containerHeight,
      });

      util.enlivenObjects([objects]).then(([fabricObject]) => {
        const obj = fabricObject as FabricObject;

        // Get the object's dimensions
        const objWidth = obj.width;
        const objHeight = obj.height;

        // Calculate the aspect ratios
        const containerAspect = containerWidth / containerHeight;
        const objAspect = objWidth / objHeight;

        // Add more padding for the right side
        const horizontalPadding = containerWidth * 0.1; // 10% padding
        const verticalPadding = containerHeight * 0.1; // 10% padding

        let scale;
        if (objAspect > containerAspect) {
          // Object is wider than container
          scale = (containerWidth - horizontalPadding * 2) / objWidth;
        } else {
          // Object is taller than container
          scale = (containerHeight - verticalPadding * 2) / objHeight;
        }

        // Apply the scale
        obj.scale(scale);

        // Center the object with adjusted position
        obj.set({
          left:
            (containerWidth - objWidth * scale) / 2 + (objWidth * scale) / 2,
          top:
            (containerHeight - objHeight * scale) / 2 + (objHeight * scale) / 2,
          originX: "center",
          originY: "center",
        });

        fabricCanvas.add(obj);
        fabricCanvas.requestRenderAll();
      });
    };

    // Initial update
    updateCanvas();

    // Cleanup
    return () => {
      fabricCanvas.dispose();
    };
  }, [objects]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}
