import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomSlider from "./custom-slider";
import IconComponent from "./icon-component";

import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Underline,
  Bold,
  CaseUpper,
  Italic,
} from "lucide-react";

import { Canvas, Textbox } from "fabric";
import { Textarea } from "./ui/textarea";
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";
import { useLogContext } from "@/hooks/useLogContext";

type AddTextProps = {
  canvas: Canvas;
};

const AddText = ({ canvas }: AddTextProps) => {
  const { selectedObject, setSelectedObject } = useCanvasObjects();
  const { addLog } = useLogContext();

  // const [selectedObject, setSelectedObject] = useState<Textbox | null>(null);
  const [textValue, setTextValue] = useState("");
  const [textColorValue, setTextColorValue] = useState("#000000");
  const [textFont, setTextFont] = useState("arial");

  const [textSize, setTextSize] = useState(20);
  const [textOpacity, setTextOpacity] = useState(1);

  const [textLineSpacing, setTextLineSpacing] = useState(1);

  const [textAlignValue, setTextAlignValue] = useState("left");

  const [isUpper, setUpper] = useState(false);
  const [isItalic, setItalic] = useState(false);
  const [isBold, setBold] = useState(false);
  const [isUnderLine, setUnderLine] = useState(false);

  // Add text to canvas
  const addText = () => {
    const textId = crypto.randomUUID();
    const text = new Textbox("Sample Text", {
      left: 10,
      top: 10,
      fill: textColorValue,
      fontSize: textSize,
      fontFamily: textFont,
      opacity: textOpacity,

      lineHeight: textLineSpacing,
      textAlign: textAlignValue,

      underline: isUnderLine,
      fontWeight: isBold ? "bold" : "normal",
      fontStyle: isItalic ? "italic" : "normal",
    });
    text.set("id", textId);
    text.set("isUpper", isUpper);
    text.set({
      // lockScalingX: true, // Disable horizontal scaling
      // lockScalingY: true, // Disable vertical scaling
      selectable: true, // Ensure the object is selectable
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    addLog({
      section: "text",
      tab: "text",
      event: "create",
      message: `Created text object with ID ${textId}`,
    });
  };

  // Update text properties
  const updateTextProperties = () => {
    if (selectedObject) {
      selectedObject.set({
        text: isUpper ? textValue.toUpperCase() : textValue,
        fill: textColorValue,
        fontSize: textSize,
        fontFamily: textFont,
        opacity: textOpacity,
        lineHeight: textLineSpacing,
        underline: isUnderLine,
        fontWeight: isBold ? "bold" : "normal",
        fontStyle: isItalic ? "italic" : "normal",
        textAlign: textAlignValue,
      });
      canvas.renderAll();
    }
  };

  // Set up event listeners for object selection
  useEffect(() => {
    const handleObjectSelected = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.type === "textbox") {
        const textObj = activeObject as Textbox;
        setSelectedObject(textObj);
        setTextValue(textObj.text || "");
        setTextColorValue(textObj.fill as string);
        setTextSize(textObj.fontSize || 14);
        setTextFont(textObj.fontFamily || "arial");
        setTextOpacity(textObj.opacity || 1);

        setTextAlignValue(textObj.textAlign);
        setTextLineSpacing(textObj.lineHeight);

        setItalic(textObj.fontStyle === "italic" ? true : false);
        setUnderLine(textObj.underline ? true : false);
        setBold(textObj.fontWeight === "bold" ? true : false);
        setUpper(textObj.get("isUpper") || false);

        // setTimeout(() => {
        //   addLog({
        //     objType: "text",
        //     propType: "selection",
        //     message: `Selected texbox object with ID: ${textObj.get("id")}`,
        //   });
        // }, 0);
      } else {
        setSelectedObject(null);
      }
    };

    const handleObjectUpdated = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.type === "textbox") {
        const textObj = activeObject as Textbox;
        setSelectedObject(textObj);
        setTextValue(textObj.text || "");
        setTextColorValue(textObj.fill as string);
        setTextSize(textObj.fontSize || 14);
        setTextFont(textObj.fontFamily || "arial");
        setTextOpacity(textObj.opacity || 1);

        setTextAlignValue(textObj.textAlign);
        setTextLineSpacing(textObj.lineHeight);

        setItalic(textObj.fontStyle === "italic" ? true : false);
        setUnderLine(textObj.underline ? true : false);
        setBold(textObj.fontWeight === "bold" ? true : false);
        setUpper(textObj.get("isUpper") || false);

        // setTimeout(() => {
        //   addLog({
        //     objType: "text",
        //     propType: "selection",
        //     message: `Updated texbox object with ID: ${textObj.get("id")}`,
        //   });
        // }, 0);
      } else {
        setSelectedObject(null);
      }
    };

    const handleObjectModified = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.type === "textbox") {
        const textObj = activeObject as Textbox;
        setSelectedObject(textObj);
        setTextValue(textObj.text || "");
        setTextColorValue(textObj.fill as string);
        setTextSize(textObj.fontSize || 14);
        setTextFont(textObj.fontFamily || "arial");
        setTextOpacity(textObj.opacity || 1);

        setTextAlignValue(textObj.textAlign);
        setTextLineSpacing(textObj.lineHeight);

        setItalic(textObj.fontStyle === "italic" ? true : false);
        setUnderLine(textObj.underline ? true : false);
        setBold(textObj.fontWeight === "bold" ? true : false);
        setUpper(textObj.get("isUpper") || false);

        // setTimeout(() => {
        //   addLog({
        //     objType: "text",
        //     propType: "selection",
        //     message: `Modified texbox object with ID: ${textObj.get("id")}`,
        //   });
        // }, 0);
      } else {
        setSelectedObject(null);
      }
    };

    const handleObjectScaled = () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.type === "textbox") {
        const scaleX = activeObject.scaleX?.toFixed(2) || "N/A";
        const scaleY = activeObject.scaleY?.toFixed(2) || "N/A";

        addLog({
          section: "text",
          tab: "text",
          event: "update",
          message: `Scaled text ${activeObject.text}. scaleX changed to ${scaleX}, scaleY changed to ${scaleY}`,
          param: "scale",
          objType: "text",
        });

        const textObj = activeObject as Textbox;
        setSelectedObject(textObj);
        setTextValue(textObj.text || "");
        setTextColorValue(textObj.fill as string);
        setTextSize(textObj.fontSize || 14);
        setTextFont(textObj.fontFamily || "arial");
        setTextOpacity(textObj.opacity || 1);

        setTextAlignValue(textObj.textAlign);
        setTextLineSpacing(textObj.lineHeight);

        setItalic(textObj.fontStyle === "italic" ? true : false);
        setUnderLine(textObj.underline ? true : false);
        setBold(textObj.fontWeight === "bold" ? true : false);
        setUpper(textObj.get("isUpper") || false);
      } else {
        setSelectedObject(null);
      }
    };

    const handleObjectDeselected = () => {
      setSelectedObject(null);
    };
    canvas.on("selection:created", handleObjectSelected);
    canvas.on("selection:updated", handleObjectUpdated);
    canvas.on("object:modified", handleObjectModified);
    canvas.on("object:scaling", handleObjectScaled);
    canvas.on("selection:cleared", handleObjectDeselected);

    return () => {
      canvas.off("selection:created", handleObjectSelected);
      canvas.off("selection:updated", handleObjectUpdated);
      canvas.off("object:modified", handleObjectModified);
      canvas.off("object:scaling", handleObjectScaled);
      canvas.off("object:modified", handleObjectSelected);
    };
  }, [canvas]);

  // Delete selected object
  const deleteSelectedObject = () => {
    if (selectedObject) {
      addLog({
        section: "text",
        tab: "text",
        event: "deletion",
        message: `deleted text ${activeObject.text}`,
      });

      canvas.remove(selectedObject);
      setSelectedObject(null); // Clear state after deletion
    }
  };

  useEffect(() => {
    updateTextProperties();
  }, [
    textValue,
    textFont,
    textColorValue,
    textSize,
    textOpacity,
    textLineSpacing,
    textAlignValue,
    isItalic,
    isUnderLine,
    isBold,
    isUpper,
  ]);

  const handleFontChange = (value) => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject) {
      addLog({
        section: "text",
        tab: "text",
        event: "update",
        message: `changed text ${selectedObject.text} font ${textFont} to ${value}`,
        param: "font",
        objType: "text",
      });
    }

    setTextFont(value);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full gap-4">
      <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription>Add</CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            <div className="flex flex-col gap-3">
              <button className="custom-button" onClick={() => addText()}>
                Add Text
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedObject && (
        <div className="w-[90%] flex flex-col items-center justify-center gap-2">
          <div className="w-full">
            <Card className="py-2">
              <CardContent>
                <div className="flex flex-col gap-3 justify-center  w-full">
                  <div className="flex flex-col gap-2 justify-center items-start">
                    <p className="text-sm text-slate-400">Text</p>

                    <Textarea
                      id="text"
                      name="text"
                      value={textValue}
                      onChange={(e) => {
                        addLog({
                          section: "text",
                          tab: "text",
                          event: "update",
                          message: `Changed text from ${textValue} to ${e.target.value}`,
                          param: "font",
                          objType: "text",
                        });

                        setTextValue(e.target.value);
                      }}
                    />
                  </div>
                  <div className="w-full">
                    <Select
                      onValueChange={(value) => {
                        handleFontChange(value);
                      }}
                      defaultValue={textFont}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="arial" className="font-arial">
                          Arial
                        </SelectItem>
                        <SelectItem value="times" className="font-times">
                          Times New Roman
                        </SelectItem>
                        <SelectItem value="courier" className="font-courier">
                          Courier New
                        </SelectItem>
                        <SelectItem value="georgia" className="font-georgia">
                          Georgia
                        </SelectItem>
                        <SelectItem value="verdana" className="font-verdana">
                          Verdana
                        </SelectItem>
                        <SelectItem value="tahoma" className="font-tahoma">
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
                      onChange={(e) => {
                        addLog({
                          section: "text",
                          tab: "text",
                          event: "update",
                          message: `${selectedObject.text} changed text color from ${textColorValue} to ${e.target.value}`,
                          param: "color",
                          objType: "text",
                        });

                        setTextColorValue(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="w-full">
            <Card className="py-2">
              <CardContent>
                <div className="flex flex-col gap-4 justify-center  w-full">
                  <CustomSlider
                    sliderName="Size"
                    min={4}
                    max={150}
                    defaultValue={textSize}
                    sliderValue={textSize}
                    setSliderValue={setTextSize}
                    logName="Text Font Size"
                    section={"text"}
                    tab={"text"}
                  />
                  <CustomSlider
                    sliderName="Opacity"
                    min={0}
                    max={1}
                    defaultValue={textOpacity}
                    step={0.01}
                    sliderValue={textOpacity}
                    setSliderValue={setTextOpacity}
                    logName="Text Opacity"
                    section={"text"}
                    tab={"text"}
                  />
                  <CustomSlider
                    sliderName="Line Spacing"
                    min={1}
                    max={5}
                    defaultValue={textLineSpacing}
                    sliderValue={textLineSpacing}
                    setSliderValue={setTextLineSpacing}
                    logName="Text Line Spacing"
                    section={"text"}
                    tab={"text"}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="w-full">
            <Card>
              <CardHeader>
                <CardDescription>Alignment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <IconComponent
                    icon={<AlignLeft />}
                    iconName="Align Left"
                    handleClick={() => {
                      addLog({
                        section: "text",
                        tab: "text",
                        event: "update",
                        message: `${selectedObject.text} changed Left Aligned to ${textAlignValue} Align`,
                        param: "alignment",
                        objType: "text",
                      });

                      setTextAlignValue("left");
                    }}
                    extraStyles={`${
                      textAlignValue === "left" ? "bg-slate-200" : ""
                    }`}
                  />
                  <IconComponent
                    icon={<AlignCenter />}
                    iconName="Align Center"
                    handleClick={() => {
                      addLog({
                        section: "text",
                        tab: "text",
                        event: "update",
                        message: `${selectedObject.text} changed Center Alignedto ${textAlignValue} Align`,
                        param: "alignment",
                        objType: "text",
                      });

                      setTextAlignValue("center");
                    }}
                    extraStyles={`${
                      textAlignValue === "center" ? "bg-slate-200" : ""
                    }`}
                  />
                  <IconComponent
                    icon={<AlignRight />}
                    iconName="Align Right"
                    handleClick={() => {
                      addLog({
                        section: "text",
                        tab: "text",
                        event: "update",
                        message: `${selectedObject.text} changed Right Aligned dto ${textAlignValue} Align`,
                        param: "alignment",
                        objType: "text",
                      });

                      setTextAlignValue("right");
                    }}
                    extraStyles={`${
                      textAlignValue === "right" ? "bg-slate-200" : ""
                    }`}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="w-full">
            <Card>
              <CardHeader>
                <CardDescription>Style</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <IconComponent
                    icon={<CaseUpper />}
                    iconName="Upper Case"
                    handleClick={() => {
                      if (isUpper) {
                        addLog({
                          section: "text",
                          tab: "text",
                          event: "update",
                          message: `${selectedObject.text} Changed text from uppercase to lower case`,
                          param: "style",
                          objType: "text",
                        });
                      } else {
                        addLog({
                          section: "text",
                          tab: "text",
                          event: "update",
                          message: `${selectedObject.text} Changed text from lowercase to upper case`,
                          param: "style",
                          objType: "text",
                        });
                      }
                      setUpper(!isUpper);
                    }}
                    extraStyles={`${isUpper ? "bg-slate-200" : ""}`}
                  />
                  <IconComponent
                    icon={<Italic />}
                    iconName="Italic"
                    handleClick={() => {
                      if (isItalic) {
                        addLog({
                          section: "text",
                          tab: "text",
                          event: "update",
                          message: `${selectedObject.text} Changed text from italic to normal`,
                          param: "style",
                          objType: "text",
                        });
                      } else {
                        addLog({
                          section: "text",
                          tab: "text",
                          event: "update",
                          message: `${selectedObject.text} Changed text from normal to italic`,
                          param: "style",
                          objType: "text",
                        });
                      }
                      setItalic(!isItalic);
                    }}
                    extraStyles={`${isItalic ? "bg-slate-200" : ""}`}
                  />
                  <IconComponent
                    icon={<Bold />}
                    iconName="Bold"
                    handleClick={() => {
                      if (isBold) {
                        addLog({
                          section: "text",
                          tab: "text",
                          event: "update",
                          message: `${selectedObject.text} Changed text from bold to normal`,
                          param: "style",
                          objType: "text",
                        });
                      } else {
                        addLog({
                          section: "text",
                          tab: "text",
                          event: "update",
                          message: `${selectedObject.text} Changed text from normal to bold`,
                          param: "style",
                          objType: "text",
                        });
                      }
                      setBold(!isBold);
                    }}
                    extraStyles={`${isBold ? "bg-slate-200" : ""}`}
                  />
                  <IconComponent
                    icon={<Underline />}
                    iconName="UnderLine"
                    handleClick={() => {
                      if (isUnderLine) {
                        addLog({
                          section: "text",
                          tab: "text",
                          event: "update",
                          message: `${selectedObject.text} Removed text Underline`,
                          param: "style",
                          objType: "text",
                        });
                      } else {
                        addLog({
                          section: "text",
                          tab: "text",
                          event: "update",
                          message: `${selectedObject.text} Added text Underline`,
                          param: "style",
                          objType: "text",
                        });
                      }
                      setUnderLine(!isUnderLine);
                    }}
                    extraStyles={`${isUnderLine ? "bg-slate-200" : ""}`}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="w-full">
            <Card>
              <CardHeader>
                <CardDescription>Mode</CardDescription>
              </CardHeader>
              <CardContent className="w-full">
                <div className="flex flex-col gap-3">
                  <button
                    className="custom-button"
                    onClick={deleteSelectedObject}
                  >
                    Delete Text
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddText;
