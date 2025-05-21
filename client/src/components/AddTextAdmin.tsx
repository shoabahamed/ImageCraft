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
import IconComponent from "./icon-component";

import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Underline,
  Bold,
  CaseUpper,
  Italic,
  Layers,
} from "lucide-react";

import { Canvas, FabricImage, Textbox, Shadow } from "fabric";
import { Textarea } from "./ui/textarea";
import { useCanvasObjects } from "@/hooks/useCanvasObjectContext";
import { useLogContext } from "@/hooks/useLogContext";
import useAddTextStore from "@/hooks/appStore/AddTextStore";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";

// TODO: I need to export the isUpper, Id and Frame as extra values during saving
// TODO: when

type AddTextProps = {
  canvas: Canvas;
};

const AddTextAdmin = ({ canvas }: AddTextProps) => {
  const { selectedObject, setSelectedObject } = useCanvasObjects();

  // Unpacking state values one by one
  const textValue = useAddTextStore((state) => state.textValue);
  const textColorValue = useAddTextStore((state) => state.textColorValue);
  const textFont = useAddTextStore((state) => state.textFont);
  const textSize = useAddTextStore((state) => state.textSize);
  const textOpacity = useAddTextStore((state) => state.textOpacity);
  const textLineSpacing = useAddTextStore((state) => state.textLineSpacing);
  const textAlignValue = useAddTextStore((state) => state.textAlignValue);
  const isUpper = useAddTextStore((state) => state.isUpper);
  const isItalic = useAddTextStore((state) => state.isItalic);
  const isBold = useAddTextStore((state) => state.isBold);
  const isUnderLine = useAddTextStore((state) => state.isUnderLine);
  const charSpacing = useAddTextStore((state) => state.charSpacing);

  // Unpacking setter functions one by one
  const setTextValue = useAddTextStore((state) => state.setTextValue);
  const setTextColorValue = useAddTextStore((state) => state.setTextColorValue);
  const setTextFont = useAddTextStore((state) => state.setTextFont);
  const setTextSize = useAddTextStore((state) => state.setTextSize);
  const setTextOpacity = useAddTextStore((state) => state.setTextOpacity);
  const setTextLineSpacing = useAddTextStore(
    (state) => state.setTextLineSpacing
  );
  const setTextAlignValue = useAddTextStore((state) => state.setTextAlignValue);
  const setUpper = useAddTextStore((state) => state.setUpper);
  const setItalic = useAddTextStore((state) => state.setItalic);
  const setBold = useAddTextStore((state) => state.setBold);
  const setUnderLine = useAddTextStore((state) => state.setUnderLine);

  const setCharSpacing = useAddTextStore((state) => state.setCharSpacing);

  // Unpack shadow properties
  const shadowEnabled = useAddTextStore((state) => state.shadowEnabled);
  const shadowColor = useAddTextStore((state) => state.shadowColor);
  const shadowBlur = useAddTextStore((state) => state.shadowBlur);
  const shadowOffsetX = useAddTextStore((state) => state.shadowOffsetX);
  const shadowOffsetY = useAddTextStore((state) => state.shadowOffsetY);

  // Unpack shadow setters
  const setShadowEnabled = useAddTextStore((state) => state.setShadowEnabled);
  const setShadowColor = useAddTextStore((state) => state.setShadowColor);
  const setShadowBlur = useAddTextStore((state) => state.setShadowBlur);
  const setShadowOffsetX = useAddTextStore((state) => state.setShadowOffsetX);
  const setShadowOffsetY = useAddTextStore((state) => state.setShadowOffsetY);

  // Add text to canvas
  const addText = () => {
    const textId = crypto.randomUUID();
    const baseFontSize = Math.round(canvas.width * 0.05);
    const charSpacing = Math.round(baseFontSize * 0.2);

    const text = new Textbox("Sample Text", {
      left: canvas.width / 2,
      top: canvas.height / 2,
      fill: textColorValue,
      fontSize: baseFontSize,
      fontFamily: textFont,
      opacity: textOpacity,
      charSpacing: charSpacing,
      lineHeight: textLineSpacing,
      textAlign: textAlignValue,
      // lockScalingX: true,
      // lockScalingY: true,
      underline: isUnderLine,
      fontWeight: isBold ? "bold" : "normal",
      fontStyle: isItalic ? "italic" : "normal",
      originX: "center",
      originY: "center",
    });
    text.set("id", textId);
    text.set("isUpper", isUpper);
    text.set({
      selectable: true,
    });
    canvas.add(text);

    canvas.setActiveObject(text);
  };

  // Set up event listeners for object selection

  // Delete selected object
  const deleteSelectedObject = () => {
    if (selectedObject && selectedObject.type === "textbox") {
      canvas.remove(selectedObject);
      setSelectedObject(null); // Clear state after deletion
    }
  };

  const handleTextWeightChange = (value) => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject) {
      selectedObject.set({
        fontWeight: value ? "bold" : "normal",
      });

      setBold(value);

      selectedObject.setCoords();
      canvas.fire("object:modified");

      canvas.renderAll();
    }
  };

  const handleTextUnderlineChange = (value) => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject) {
      selectedObject.set({
        underline: value,
      });

      setUnderLine(value);

      selectedObject.setCoords();
      canvas.fire("object:modified");

      canvas.renderAll();
    }
  };

  const handleTextItalicChange = (value) => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject) {
      selectedObject.set({
        fontStyle: value ? "italic" : "normal",
      });

      setItalic(value);

      selectedObject.setCoords();
      canvas.fire("object:modified");

      canvas.renderAll();
    }
  };

  const handleTextUpperChange = (value) => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject) {
      selectedObject.set({
        text: value ? textValue.toUpperCase() : textValue,
      });

      setUpper(value);

      selectedObject.setCoords();
      canvas.fire("object:modified");

      canvas.renderAll();
    }
  };

  const handleFontChange = (value) => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject) {
      setTextFont(value);
      selectedObject.set({
        fontFamily: value,
      });

      selectedObject.setCoords();
      canvas.fire("object:modified");

      canvas.renderAll();
    }
  };
  const handleTextAlignChange = (value) => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject) {
      selectedObject.set({
        textAlign: value,
      });

      setTextAlignValue(value);

      selectedObject.setCoords();
      canvas.fire("object:modified");

      canvas.renderAll();
    }
  };

  const handleTextSizeChange = (value) => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject) {
      selectedObject.set({
        fontSize: value,
      });

      setTextSize(value);

      selectedObject.setCoords();
      canvas.fire("object:modified");

      canvas.renderAll();
    }
  };

  const handleTextOpacityChange = (value) => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject) {
      selectedObject.set({
        opacity: value,
      });

      setTextOpacity(value);

      selectedObject.setCoords();
      canvas.fire("object:modified");

      canvas.renderAll();
    }
  };

  const handleTextLineSpacingChange = (value) => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject) {
      selectedObject.set({
        lineHeight: value,
      });

      setTextLineSpacing(value);

      selectedObject.setCoords();
      canvas.fire("object:modified");

      canvas.renderAll();
    }
  };

  const handleTextCharSpacingChange = (value) => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject) {
      selectedObject.set({
        charSpacing: value,
      });

      setCharSpacing(value);

      selectedObject.setCoords();
      canvas.fire("object:modified");

      canvas.renderAll();
    }
  };

  const handleTextChange = (value) => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject) {
      selectedObject.set({
        text: isUpper ? textValue.toUpperCase() : textValue,
      });

      setTextValue(value);

      selectedObject.setCoords();
      canvas.fire("object:modified");

      canvas.renderAll();
    }
  };

  const handleFillChange = (value) => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject) {
      selectedObject.set({
        fill: value,
      });

      setTextColorValue(value);

      selectedObject.setCoords();
      canvas.fire("object:modified");

      canvas.renderAll();
    }
  };

  const handleShadowToggle = (checked: boolean) => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject) {
      if (checked) {
        const shadow = new Shadow({
          color: shadowColor,
          blur: shadowBlur,
          offsetX: shadowOffsetX,
          offsetY: shadowOffsetY,
        });
        selectedObject.set("shadow", shadow);
        setShadowEnabled(true);
      } else {
        selectedObject.set("shadow", null);
        setShadowEnabled(false);
      }
      selectedObject.setCoords();
      canvas.fire("object:modified");
      canvas.renderAll();
    }
  };

  const handleShadowColor = (value: string) => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject && selectedObject.shadow) {
      const shadow = selectedObject.shadow;
      shadow.color = value;
      selectedObject.set("shadow", shadow);
      setShadowColor(value);
      selectedObject.setCoords();
      canvas.fire("object:modified");
      canvas.renderAll();
    }
  };

  const handleShadowBlur = (value: number) => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject && selectedObject.shadow) {
      const shadow = selectedObject.shadow;
      shadow.blur = value;
      selectedObject.set("shadow", shadow);
      setShadowBlur(value);
      selectedObject.setCoords();
      canvas.fire("object:modified");
      canvas.renderAll();
    }
  };

  const handleShadowOffsetX = (value: number) => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject && selectedObject.shadow) {
      const shadow = selectedObject.shadow;
      shadow.offsetX = value;
      selectedObject.set("shadow", shadow);
      setShadowOffsetX(value);
      selectedObject.setCoords();
      canvas.fire("object:modified");
      canvas.renderAll();
    }
  };

  const handleShadowOffsetY = (value: number) => {
    const selectedObject = canvas.getActiveObject();
    if (selectedObject && selectedObject.shadow) {
      const shadow = selectedObject.shadow;
      shadow.offsetY = value;
      selectedObject.set("shadow", shadow);
      setShadowOffsetY(value);
      selectedObject.setCoords();
      canvas.fire("object:modified");
      canvas.renderAll();
    }
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

      {selectedObject && selectedObject.type === "textbox" && (
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
                        handleTextChange(e.target.value);
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
                        handleFillChange(e.target.value);
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
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-slate-400 text-sm">
                      <p>Size</p>
                      <p>{textSize}</p>
                    </div>

                    <Slider
                      // defaultValue={[defaultValue]}
                      value={[textSize]}
                      min={4}
                      max={300}
                      step={1}
                      onValueChange={(e) => {
                        handleTextSizeChange(e[0]);
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-slate-400 text-sm">
                      <p>Opacity</p>
                      <p>{textOpacity}</p>
                    </div>

                    <Slider
                      // defaultValue={[defaultValue]}
                      value={[textOpacity]}
                      min={0}
                      max={1}
                      step={0.01}
                      onValueChange={(e) => {
                        handleTextOpacityChange(e[0]);
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-slate-400 text-sm">
                      <p>Char Spacing</p>
                      <p>{charSpacing}</p>
                    </div>

                    <Slider
                      // defaultValue={[defaultValue]}
                      value={[charSpacing]}
                      min={1}
                      max={300}
                      step={1}
                      onValueChange={(e) => {
                        handleTextCharSpacingChange(e[0]);
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-slate-400 text-sm">
                      <p>Line Spacing</p>
                      <p>{textLineSpacing}</p>
                    </div>

                    <Slider
                      // defaultValue={[defaultValue]}
                      value={[textLineSpacing]}
                      min={1}
                      max={10}
                      step={1}
                      onValueChange={(e) => {
                        handleTextLineSpacingChange(e[0]);
                      }}
                    />
                  </div>
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
                <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <IconComponent
                    icon={<AlignLeft />}
                    iconName="Align Left"
                    handleClick={() => {
                      handleTextAlignChange("left");
                    }}
                    extraStyles={`${
                      textAlignValue === "left" ? "bg-slate-200" : ""
                    }`}
                  />
                  <IconComponent
                    icon={<AlignCenter />}
                    iconName="Align Center"
                    handleClick={() => {
                      handleTextAlignChange("center");
                    }}
                    extraStyles={`${
                      textAlignValue === "center" ? "bg-slate-200" : ""
                    }`}
                  />
                  <IconComponent
                    icon={<AlignRight />}
                    iconName="Align Right"
                    handleClick={() => {
                      handleTextAlignChange("right");
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
                      handleTextUpperChange(!isUpper);
                    }}
                    extraStyles={`${isUpper ? "bg-slate-200" : ""}`}
                  />
                  <IconComponent
                    icon={<Italic />}
                    iconName="Italic"
                    handleClick={() => {
                      handleTextItalicChange(!isItalic);
                    }}
                    extraStyles={`${isItalic ? "bg-slate-200" : ""}`}
                  />
                  <IconComponent
                    icon={<Bold />}
                    iconName="Bold"
                    handleClick={() => {
                      handleTextWeightChange(!isBold);
                    }}
                    extraStyles={`${isBold ? "bg-slate-200" : ""}`}
                  />
                  <IconComponent
                    icon={<Underline />}
                    iconName="UnderLine"
                    handleClick={() => {
                      handleTextUnderlineChange(!isUnderLine);
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
                <CardDescription>Shadow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-slate-400" />
                      <label className="text-sm text-slate-400">Shadow</label>
                    </div>
                    <Switch
                      checked={shadowEnabled}
                      onCheckedChange={handleShadowToggle}
                    />
                  </div>
                  {shadowEnabled && (
                    <div className="flex flex-col gap-4 pl-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm text-slate-400">
                          Shadow Color
                        </label>
                        <Input
                          type="color"
                          value={shadowColor}
                          onChange={(e) => {
                            handleShadowColor(e.target.value);
                          }}
                        />
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center text-slate-400 text-sm">
                          <p>Blur</p>
                          <p>{shadowBlur}</p>
                        </div>
                        <Slider
                          value={[shadowBlur]}
                          min={0}
                          max={50}
                          step={1}
                          onValueChange={(e) => {
                            handleShadowBlur(e[0]);
                          }}
                        />
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center text-slate-400 text-sm">
                          <p>Offset X</p>
                          <p>{shadowOffsetX}</p>
                        </div>
                        <Slider
                          value={[shadowOffsetX]}
                          min={-50}
                          max={50}
                          step={1}
                          onValueChange={(e) => {
                            handleShadowOffsetX(e[0]);
                          }}
                        />
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center text-slate-400 text-sm">
                          <p>Offset Y</p>
                          <p>{shadowOffsetY}</p>
                        </div>
                        <Slider
                          value={[shadowOffsetY]}
                          min={-50}
                          max={50}
                          step={1}
                          onValueChange={(e) => {
                            handleShadowOffsetY(e[0]);
                          }}
                        />
                      </div>
                    </div>
                  )}
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

export default AddTextAdmin;
