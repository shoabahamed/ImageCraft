import IconComponent from "@/components/icon-component";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import {
  Circle,
  Heart,
  Home,
  Lasso,
  Redo,
  Square,
  Star,
  Triangle,
  Undo,
  ZoomIn,
  ZoomOut,
  UndoDot,
  RedoDot,
  UnfoldVertical,
  UnfoldHorizontal,
  Brush,
  Eraser,
  PaintBucket,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Underline,
  Bold,
  CaseUpper,
  Italic,
} from "lucide-react";
import {
  Crop,
  RotateCwSquare,
  ListPlus,
  Type,
  PenTool,
  Cpu,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import CustomSlider from "@/components/custom-slider";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import * as fabric from "fabric";
import { useLocation, useNavigate } from "react-router-dom";
import ImageSize from "@/components/ImageSize";
import AdjustSidebar from "@/components/AdjustSidebar";

const MainPage = () => {
  const [sidebarName, setSidebarName] = useState("");
  const [iconName, setIconName] = useState("");

  const [cropHeight, setCropHeight] = useState("0");
  const [cropWidth, setCropWidth] = useState("0");

  const [brushSize, setBrushSize] = useState(0);
  const [brushColor, setBrushColor] = useState("#00ff00");
  const [eraserSize, setEraserSize] = useState(0);
  const [fillOpacity, setFillOpacity] = useState(1);
  const [fillColor, setFillColor] = useState("#00ff00");

  const [textValue, setTextValue] = useState("lorem emsem");
  const [textColorValue, setTextColorValue] = useState("#00ff00");
  const [textSize, setTextSize] = useState(0);
  const [textOpacity, setTextOpacity] = useState(1);
  const [textFont, setTextFont] = useState("arial");
  const [textLineSpacing, setTextLineSpacing] = useState(0);
  const [textLetterSpacing, setTextLetterSpacing] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mainCanvasRef = useRef<fabric.Canvas | null>(null);
  const currentImageRef = useRef<fabric.FabricImage | null>(null); // Use ref for currentImage
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const [imageUrl, setImageUrl] = useState("./test3.png");

  const handleContainerResize = () => {
    const container = document.getElementById("CanvasContainer");
    if (!container || !mainCanvasRef.current || !currentImageRef.current)
      return;

    const { width: containerWidth, height: containerHeight } =
      container.getBoundingClientRect();

    const imageWidth = currentImageRef.current.width ?? 1;
    const imageHeight = currentImageRef.current.height ?? 1;

    // Determine if the image needs scaling
    const needsScaling =
      imageWidth > containerWidth || imageHeight > containerHeight;

    if (needsScaling) {
      const scaleX = containerWidth / imageWidth;
      const scaleY = containerHeight / imageHeight;
      const scale = Math.min(scaleX, scaleY); // Maintain aspect ratio

      currentImageRef.current.scale(scale); // Scale the image
    }

    const finalWidth = needsScaling
      ? currentImageRef.current.getScaledWidth()
      : imageWidth;
    const finalHeight = needsScaling
      ? currentImageRef.current.getScaledHeight()
      : imageHeight;

    mainCanvasRef.current.setDimensions({
      width: finalWidth,
      height: finalHeight,
    });
    mainCanvasRef.current.renderAll();
  };

  useEffect(() => {
    if (canvasRef.current) {
      const container = document.getElementById("CanvasContainer");
      if (!container) return;

      const resizeObserver = new ResizeObserver(() => {
        handleContainerResize(); // Trigger resize handler
      });
      resizeObserver.observe(container);
      resizeObserverRef.current = resizeObserver;

      const { width: containerWidth, height: containerHeight } =
        container.getBoundingClientRect();

      const initCanvas = new fabric.Canvas(canvasRef.current, {
        width: 300,
        height: 300,
      });
      initCanvas.backgroundColor = "#fff";

      fabric.FabricImage.fromURL(imageUrl).then((img) => {
        const imageWidth = img.width ?? 1;
        const imageHeight = img.height ?? 1;

        const needsScaling =
          imageWidth > containerWidth || imageHeight > containerHeight;

        if (needsScaling) {
          const scaleX = containerWidth / imageWidth;
          const scaleY = containerHeight / imageHeight;
          const scale = Math.min(scaleX, scaleY);

          img.scale(scale); // Scale the image
        }

        const finalWidth = needsScaling ? img.getScaledWidth() : imageWidth;
        const finalHeight = needsScaling ? img.getScaledHeight() : imageHeight;

        initCanvas.setDimensions({ width: finalWidth, height: finalHeight });
        img.set({
          left: 0,
          top: 0,
          selectable: false,
          hoverCursor: "default",
        });

        initCanvas.add(img);
        initCanvas.renderAll();
        currentImageRef.current = img; // Set the ref directly
        mainCanvasRef.current = initCanvas;
      });

      return () => {
        initCanvas.dispose(); // Dispose of canvas
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
        }
      };
    }
  }, [imageUrl]);

  //   if (canvasRef.current) {
  //     const container = document.getElementById("CanvasContainer");
  //     if (!container) return;

  //     let { width: containerWidth, height: containerHeight } =
  //       container.getBoundingClientRect();

  //     containerWidth = Math.floor(containerWidth);
  //     containerHeight = Math.floor(containerHeight);

  //     if (mainCanvas) {
  //       console.log("old");

  //       console.log(imageWidth);
  //       console.log(imageHeight);
  //       // mainCanvas.setDimensions({
  //       //   width: 500,
  //       //   height: 500,
  //       // });

  //       mainCanvas.setWidth(imageWidth);

  //       // mainCanvas.renderAll();
  //       // setMainCanvas(mainCanvas);
  //       // console.log(currentImage);
  //       // const imageWidth = currentImage.width ?? 1; // Fallback to 1
  //       // const imageHeight = currentImage.height ?? 1;

  //       // Determine if the image needs scaling
  //       // const needsScaling =
  //       //   imageWidth > containerWidth || imageHeight > containerHeight;

  //       // if (needsScaling) {
  //       //   // Calculate the scale to fit the image within the container
  //       //   const scaleX = containerWidth / imageWidth;
  //       //   const scaleY = containerHeight / imageHeight;
  //       //   const scale = Math.min(scaleX, scaleY); // Maintain aspect ratio

  //       //   // Scale the image
  //       //   currentImage.scale(scale);
  //       // }
  //       // Get the dimensions to resize the canvas
  //       // const finalWidth = needsScaling
  //       //   ? currentImage.getScaledWidth()
  //       //   : imageWidth;
  //       // const finalHeight = needsScaling
  //       //   ? currentImage.getScaledHeight()
  //       //   : imageHeight;
  //       // mainCanvas.setDimensions({ width: finalWidth, height: finalHeight });
  //       // Resize the canvas to match the final image size
  //       // mainCanvas.setWidth(finalWidth);
  //       // mainCanvas.setHeight(finalHeight);
  //       // console.log(mainCanvas);

  //       // mainCanvas.remove(currentImage);
  //       // Fix the image at position (0, 0) and disable interactions
  //       // currentImage.set({
  //       //   left: 0,
  //       //   top: 0,
  //       //   selectable: false, // Prevent selection
  //       //   evented: false, // Disable event handling
  //       //   hoverCursor: "default", // Remove hover effect
  //       // });

  //       // Add the image to the canvas

  //       // Save the canvas and image references
  //       // setCurrentImage(currentImage);
  //       // setMainCanvas(mainCanvas);
  //       return () => {
  //         console.log("Cleaning up canvas...");
  //         mainCanvas.dispose(); // Dispose of the local canvas instance
  //       };
  //     } else {
  //       console.log("new");
  //       const initCanvas = new fabric.Canvas(canvasRef.current, {
  //         backgroundColor: "#fff",
  //       });

  //       // fabric.FabricImage.fromURL(imageUrl).then((img) => {
  //       //   const imageWidth = img.width ?? 1; // Fallback to 1
  //       //   const imageHeight = img.height ?? 1;

  //       //   // Determine if the image needs scaling
  //       //   const needsScaling =
  //       //     imageWidth > containerWidth || imageHeight > containerHeight;

  //       //   if (needsScaling) {
  //       //     // Calculate the scale to fit the image within the container
  //       //     const scaleX = containerWidth / imageWidth;
  //       //     const scaleY = containerHeight / imageHeight;
  //       //     const scale = Math.min(scaleX, scaleY); // Maintain aspect ratio

  //       //     // Scale the image
  //       //     img.scale(scale);
  //       //   }

  //       //   // Get the dimensions to resize the canvas
  //       //   const finalWidth = needsScaling ? img.getScaledWidth() : imageWidth;
  //       //   const finalHeight = needsScaling
  //       //     ? img.getScaledHeight()
  //       //     : imageHeight;

  //       //   // Resize the canvas to match the final image size
  //       //   initCanvas.setDimensions({ width: finalWidth, height: finalHeight });
  //       //   // Fix the image at position (0, 0) and disable interactions
  //       //   img.set({
  //       //     left: 0,
  //       //     top: 0,
  //       //     selectable: false, // Prevent selection
  //       //     evented: false, // Disable event handling
  //       //     hoverCursor: "default", // Remove hover effect
  //       //   });

  //       //   // Add the image to the canvas
  //       //   initCanvas.add(img);
  //       //   initCanvas.renderAll();
  //       //   // Save the canvas and image references
  //       //   setCurrentImage(img);
  //       //   setMainCanvas(initCanvas);
  //       // });

  //       initCanvas.setDimensions({
  //         width: 300,
  //         height: 300,
  //       });

  //       initCanvas.renderAll();
  //       setMainCanvas(initCanvas);

  //       // window.addEventListener("resize", () => {
  //       //   setWindowWidth(window.innerWidth);
  //       // });
  //       return () => {
  //         console.log("Cleaning up canvas...");
  //         initCanvas.dispose(); // Dispose of the local canvas instance
  //       };
  //     }
  //   }
  // }, [imageWidth]);

  const downloadCanvas = () => {
    const dataURL = mainCanvasRef.current!.toDataURL();

    // Create a temporary link element to trigger the download
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "canvas-image.png"; // Name of the file to be saved
    link.click();
  };
  return (
    <div className="h-screen max-w-screen flex items-center relative">
      {/* Sidebar */}
      <div
        className={`flex items-center h-full ${sidebarName ? "w-[25%]" : ""}`}
      >
        <nav className="flex flex-col gap-5  h-full justify-center items-center border-slate-800 border-r-2 rounded-none">
          <IconComponent
            icon={<Home />}
            iconName="Home"
            sidebarName={sidebarName}
            setSidebarName={setSidebarName}
          />
          <IconComponent
            icon={<RotateCwSquare />}
            iconName="Arrange"
            sidebarName={sidebarName}
            setSidebarName={setSidebarName}
          />
          <IconComponent
            icon={<Crop />}
            iconName="Crop"
            sidebarName={sidebarName}
            setSidebarName={setSidebarName}
          />
          <IconComponent
            icon={<ListPlus />}
            iconName="Adjust"
            sidebarName={sidebarName}
            setSidebarName={setSidebarName}
          />
          <IconComponent
            icon={<PenTool />}
            iconName="PenTool"
            sidebarName={sidebarName}
            setSidebarName={setSidebarName}
          />
          <IconComponent
            icon={<Type />}
            iconName="Text"
            sidebarName={sidebarName}
            setSidebarName={setSidebarName}
          />
          <IconComponent
            icon={<Cpu />}
            iconName="AI"
            sidebarName={sidebarName}
            setSidebarName={setSidebarName}
          />
        </nav>
        <div
          className={`${
            sidebarName ? "w-full" : "w-0"
          } transition-all duration-700 ease-in-out relative h-full  bg-slate-800`}
        >
          <div
            className={`${
              sidebarName ? "absolute w-[20px]" : "w-0"
            } flex justify-center items-center bg-slate-800  -right-2 text-slate-300 top-[40%] cursor-pointer h-[100px] rounded-full `}
            onClick={() => setSidebarName("")}
          ></div>
          {sidebarName === "Crop" && (
            <div className="w-full h-full">
              <div className="w-full abosulte py-3 text-center italic text-xl font-bold text-slate-300 top-0 left-0">
                Crop&Cut
              </div>
              <ScrollArea className="h-[90%]">
                <div className="flex flex-col items-center justify-center w-full gap-4">
                  <div className="w-[90%]">
                    <Card>
                      <CardHeader>
                        <CardDescription>Crop</CardDescription>
                      </CardHeader>
                      <CardContent className="w-full">
                        <div className="flex flex-col w-full gap-3 items-center justify-center">
                          <div className="grid grid-cols-2 justify-center items-center">
                            <Label htmlFor="height">Height</Label>
                            <Input
                              id="height"
                              type="number"
                              name="height"
                              value={cropHeight}
                              onChange={(e) => setCropHeight(e.target.value)}
                            />
                          </div>
                          <div className="grid grid-cols-2  justify-center items-center">
                            <Label htmlFor="width">Width</Label>
                            <Input
                              id="width"
                              type="number"
                              name="width"
                              value={cropWidth}
                              onChange={(e) => setCropWidth(e.target.value)}
                            />
                          </div>
                          <Button>Interactive</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="w-[90%]">
                    <Card>
                      <CardHeader>
                        <CardDescription>Shape</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <IconComponent icon={<Circle />} iconName="Circle" />
                          <IconComponent icon={<Square />} iconName="Square" />
                          <IconComponent
                            icon={<Triangle />}
                            iconName="Triangle"
                          />
                          <IconComponent icon={<Heart />} iconName="Heart" />
                          <IconComponent icon={<Star />} iconName="Star" />
                          <IconComponent icon={<Lasso />} iconName="Lasso" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="w-[90%]">
                    <Card>
                      <CardHeader>
                        <CardDescription>Mode</CardDescription>
                      </CardHeader>
                      <CardContent className="w-full">
                        <div className="flex flex-col gap-3 justify-center items-center">
                          <Button className="text-sm md:text-sm">
                            Invert Cutout
                          </Button>
                          <Button>Reset Cutout</Button>
                          <Button>Reset Crop</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}

          {sidebarName === "Arrange" && (
            <div className="w-full h-full">
              <div className="w-full abosulte py-3 text-center italic text-xl font-bold text-slate-300 top-0 left-0">
                Arrange Image
              </div>
              <ScrollArea className="h-[90%]">
                <div className="flex flex-col items-center justify-center w-full gap-4">
                  {/* <div className="w-[90%]">
                    <ImageSize
                      canvas={mainCanvas!}
                      initialHeight={containerDimensions.height}
                      initialWidth={containerDimensions.width}
                    />
                  </div> */}

                  <div className="w-[90%]">
                    <Card>
                      <CardHeader>
                        <CardDescription>Roate&Flip</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <IconComponent
                            icon={<UndoDot />}
                            iconName="Rotate Left"
                          />
                          <IconComponent
                            icon={<RedoDot />}
                            iconName="Roate Right"
                          />
                          <IconComponent
                            icon={<UnfoldVertical />}
                            iconName="Vertial Flip"
                          />
                          <IconComponent
                            icon={<UnfoldHorizontal />}
                            iconName="Horizontal Flip"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="w-[90%]">
                    <Card>
                      <CardHeader>
                        <CardDescription>Mode</CardDescription>
                      </CardHeader>
                      <CardContent className="w-full">
                        <div className="flex flex-col gap-3">
                          <Button>Reset Image</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}

          {sidebarName === "Adjust" && (
            <div className="w-full h-full">
              <div className="w-full abosulte py-3 text-center italic text-xl font-bold text-slate-300 top-0 left-0">
                Adjust
              </div>
              <ScrollArea className="h-[90%]">
                <AdjustSidebar
                  canvas={mainCanvasRef.current!}
                  image={currentImageRef.current!}
                />
              </ScrollArea>
            </div>
          )}

          {sidebarName === "PenTool" && (
            <div className="w-full h-full">
              <div className="w-full abosulte py-3 text-center italic text-xl font-bold text-slate-300 top-0 left-0">
                Draw
              </div>
              <ScrollArea className="h-[90%]">
                <div className="flex flex-col items-center justify-center w-full gap-4">
                  <div className="w-[90%]">
                    <Card>
                      <CardHeader>
                        <CardDescription>Tool</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <IconComponent
                            icon={<Brush />}
                            iconName="Brush"
                            sidebarName={iconName}
                            setSidebarName={setIconName}
                          />
                          <IconComponent
                            icon={<Eraser />}
                            iconName="Eraser"
                            sidebarName={iconName}
                            setSidebarName={setIconName}
                          />
                          <IconComponent
                            icon={<PaintBucket />}
                            iconName="Fill"
                            sidebarName={iconName}
                            setSidebarName={setIconName}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {iconName == "Brush" && (
                    <div className="w-[90%]">
                      <Card>
                        <CardContent>
                          <div className="flex flex-col gap-3 justify-center  w-full">
                            <div className="flex flex-col gap-2 justify-center items-start">
                              <p className="text-sm text-slate-400">Color</p>
                              <Input
                                id="color_picker"
                                name="color_picker"
                                type="color"
                                value={brushColor}
                                onChange={(e) => setBrushColor(e.target.value)}
                              />
                            </div>
                            <CustomSlider
                              sliderName="Size"
                              min={1}
                              max={10}
                              defaultValue={5}
                              sliderValue={brushSize}
                              setSliderValue={setBrushSize}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                  {iconName == "Eraser" && (
                    <div className="w-[90%]">
                      <Card>
                        <CardContent>
                          <div className="flex flex-col gap-3 justify-center  w-full">
                            <CustomSlider
                              sliderName="Size"
                              min={1}
                              max={10}
                              defaultValue={5}
                              sliderValue={eraserSize}
                              setSliderValue={setEraserSize}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                  {iconName == "Fill" && (
                    <div className="w-[90%]">
                      <Card>
                        <CardContent>
                          <div className="flex flex-col gap-3 justify-center  w-full">
                            <div className="flex flex-col gap-2 justify-center items-start">
                              <p className="text-sm text-slate-400">Color</p>
                              <Input
                                id="color_picker"
                                name="color_picker"
                                type="color"
                                value={fillColor}
                                onChange={(e) => setFillColor(e.target.value)}
                              />
                            </div>
                            <CustomSlider
                              sliderName="Opacity"
                              min={0}
                              max={1}
                              defaultValue={1}
                              sliderValue={fillOpacity}
                              setSliderValue={setFillOpacity}
                              step={0.01}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  <div className="w-[90%]">
                    <Card>
                      <CardHeader>
                        <CardDescription>Mode</CardDescription>
                      </CardHeader>
                      <CardContent className="w-full">
                        <div className="flex flex-col gap-3">
                          <Button>Reset Drawing</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}

          {sidebarName === "Text" && (
            <div className="w-full h-full">
              <div className="w-full abosulte py-3 text-center italic text-xl font-bold text-slate-300 top-0 left-0">
                Text
              </div>
              <ScrollArea className="h-[90%]">
                <div className="flex flex-col items-center justify-center w-full gap-4">
                  <div className="w-[90%]">
                    <Card className="py-2">
                      <CardContent>
                        <div className="flex flex-col gap-3 justify-center  w-full">
                          <div className="flex flex-col gap-2 justify-center items-start">
                            <p className="text-sm text-slate-400">Text</p>
                            <Input
                              id="text"
                              name="text"
                              type="text"
                              value={textValue}
                              onChange={(e) => setTextValue(e.target.value)}
                            />
                          </div>
                          <div className="w-full">
                            <Select
                              onValueChange={(value) => setTextFont(value)}
                              defaultValue={textFont}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a font" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem
                                  value="arial"
                                  className="font-arial"
                                >
                                  Arial
                                </SelectItem>
                                <SelectItem
                                  value="times"
                                  className="font-times"
                                >
                                  Times New Roman
                                </SelectItem>
                                <SelectItem
                                  value="courier"
                                  className="font-courier"
                                >
                                  Courier New
                                </SelectItem>
                                <SelectItem
                                  value="georgia"
                                  className="font-georgia"
                                >
                                  Georgia
                                </SelectItem>
                                <SelectItem
                                  value="verdana"
                                  className="font-verdana"
                                >
                                  Verdana
                                </SelectItem>
                                <SelectItem
                                  value="tahoma"
                                  className="font-tahoma"
                                >
                                  Tahoma
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex flex-col gap-2 justify-center items-start">
                            <p className="text-sm text-slate-400">Color</p>
                            <Input
                              id="text_color_picker"
                              name="text_color_picker"
                              type="color"
                              value={textColorValue}
                              onChange={(e) =>
                                setTextColorValue(e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="w-[90%]">
                    <Card className="py-2">
                      <CardContent>
                        <div className="flex flex-col gap-4 justify-center  w-full">
                          <CustomSlider
                            sliderName="Size"
                            min={4}
                            max={30}
                            defaultValue={5}
                            sliderValue={textSize}
                            setSliderValue={setTextSize}
                          />
                          <CustomSlider
                            sliderName="Opacity"
                            min={0}
                            max={1}
                            defaultValue={1}
                            step={0.01}
                            sliderValue={textOpacity}
                            setSliderValue={setTextOpacity}
                          />
                          <CustomSlider
                            sliderName="Line Spacing"
                            min={-100}
                            max={100}
                            defaultValue={0}
                            sliderValue={textLineSpacing}
                            setSliderValue={setTextLineSpacing}
                          />
                          <CustomSlider
                            sliderName="Letter Spacing"
                            min={-100}
                            max={100}
                            defaultValue={0}
                            sliderValue={textLetterSpacing}
                            setSliderValue={setTextLetterSpacing}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="w-[90%]">
                    <Card>
                      <CardHeader>
                        <CardDescription>Alignment</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <IconComponent
                            icon={<AlignLeft />}
                            iconName="Align Left"
                          />
                          <IconComponent
                            icon={<AlignCenter />}
                            iconName="Align Center"
                          />
                          <IconComponent
                            icon={<AlignRight />}
                            iconName="Align Right"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="w-[90%]">
                    <Card>
                      <CardHeader>
                        <CardDescription>Style</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <IconComponent
                            icon={<CaseUpper />}
                            iconName="Upper Case"
                          />
                          <IconComponent icon={<Italic />} iconName="Italic" />
                          <IconComponent icon={<Bold />} iconName="Bold" />
                          <IconComponent
                            icon={<Underline />}
                            iconName="UnderLine"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="w-[90%]">
                    <Card>
                      <CardHeader>
                        <CardDescription>Mode</CardDescription>
                      </CardHeader>
                      <CardContent className="w-full">
                        <div className="flex flex-col gap-3">
                          <Button>Delete Text</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>

      {/* Main Section */}
      <div className="flex flex-grow h-full flex-col justify-center items-center">
        {/* Design Section */}
        <div className="flex-1 w-full flex items-center justify-center">
          <div
            className="w-[80%] h-[80%] flex justify-center items-center"
            id="CanvasContainer"
          >
            <canvas id="canvas" className="z-1" ref={canvasRef}></canvas>
          </div>
        </div>
        {/* Footer */}
        <div className="flex flex-none w-full">
          <div className="flex w-full h-full items-center justify-center rounded-none border-slate-800 border-t-2 gap-4">
            <div className="flex">
              <IconComponent icon={<ZoomIn />} iconName={"ZoomIn"} />
              <IconComponent icon={<Undo />} iconName={"Undo"} />
              <IconComponent icon={<Redo />} iconName={"Redo"} />
              <IconComponent icon={<ZoomOut />} iconName={"ZoomOut"} />
            </div>

            <div className="flex flex-none gap-1">
              <Button className="px-8" onClick={downloadCanvas}>
                Download
              </Button>
              <Button className="px-8">Save</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
