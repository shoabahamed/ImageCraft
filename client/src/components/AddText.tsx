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
import { Button } from "./ui/button";

import { Canvas, Textbox } from "fabric";
import { Textarea } from "./ui/textarea";

type AddTextProps = {
  canvas: Canvas;
};

const AddText = ({ canvas }: AddTextProps) => {
  const [selectedObject, setSelectedObject] = useState<Textbox | null>(null);
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
    text.set("isUpper", isUpper);
    text.set({
      // lockScalingX: true, // Disable horizontal scaling
      // lockScalingY: true, // Disable vertical scaling
      selectable: true, // Ensure the object is selectable
    });
    canvas.add(text);
    canvas.setActiveObject(text);
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
      } else {
        setSelectedObject(null);
      }
      console.log("TEXT SELETECTED");
    };

    const handleObjectDeselected = () => {
      setSelectedObject(null);
    };
    canvas.on("selection:created", handleObjectSelected);
    canvas.on("selection:updated", handleObjectSelected);
    canvas.on("object:modified", handleObjectSelected);
    canvas.on("selection:cleared", handleObjectDeselected);

    return () => {
      canvas.off("selection:created", handleObjectSelected);
      canvas.off("selection:updated", handleObjectSelected);
      canvas.off("selection:cleared", handleObjectDeselected);
      canvas.off("object:modified", handleObjectSelected);
    };
  }, [canvas]);

  // Delete selected object
  const deleteSelectedObject = () => {
    if (selectedObject) {
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

  return (
    <div className="flex flex-col items-center justify-center w-full gap-4">
      <div className="w-[90%]">
        <Card>
          <CardHeader>
            <CardDescription>Add</CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            <div className="flex flex-col gap-3">
              <Button onClick={() => addText()}>Add Text</Button>
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
                      onChange={(e) => setTextColorValue(e.target.value)}
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
                  />
                  <CustomSlider
                    sliderName="Opacity"
                    min={0}
                    max={1}
                    defaultValue={textOpacity}
                    step={0.01}
                    sliderValue={textOpacity}
                    setSliderValue={setTextOpacity}
                  />
                  <CustomSlider
                    sliderName="Line Spacing"
                    min={1}
                    max={5}
                    defaultValue={textLineSpacing}
                    sliderValue={textLineSpacing}
                    setSliderValue={setTextLineSpacing}
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
                    handleClick={() => setTextAlignValue("left")}
                    extraStyles={`${
                      textAlignValue === "left" ? "bg-slate-200" : ""
                    }`}
                  />
                  <IconComponent
                    icon={<AlignCenter />}
                    iconName="Align Center"
                    handleClick={() => setTextAlignValue("center")}
                    extraStyles={`${
                      textAlignValue === "center" ? "bg-slate-200" : ""
                    }`}
                  />
                  <IconComponent
                    icon={<AlignRight />}
                    iconName="Align Right"
                    handleClick={() => setTextAlignValue("right")}
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
                      setUpper(!isUpper);
                    }}
                    extraStyles={`${isUpper ? "bg-slate-200" : ""}`}
                  />
                  <IconComponent
                    icon={<Italic />}
                    iconName="Italic"
                    handleClick={() => setItalic(!isItalic)}
                    extraStyles={`${isItalic ? "bg-slate-200" : ""}`}
                  />
                  <IconComponent
                    icon={<Bold />}
                    iconName="Bold"
                    handleClick={() => setBold(!isBold)}
                    extraStyles={`${isBold ? "bg-slate-200" : ""}`}
                  />
                  <IconComponent
                    icon={<Underline />}
                    iconName="UnderLine"
                    handleClick={() => setUnderLine(!isUnderLine)}
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
                  <Button onClick={deleteSelectedObject}>Delete Text</Button>
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
