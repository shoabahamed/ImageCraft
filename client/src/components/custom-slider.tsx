import { useLogContext } from "@/hooks/useLogContext";
import { Slider } from "./ui/slider";
import { useCallback, useRef } from "react";

type SlideProps = {
  sliderName: string;
  min: number;
  max: number;
  defaultValue?: number;
  sliderValue: number;
  setSliderValue: (value: number) => void;
  step?: number;
  logName?: string;
  section?: string;
  tab?: string;
  disabled?: boolean;
};

const CustomSlider = ({
  sliderName,
  min,
  max,
  defaultValue,
  sliderValue,
  setSliderValue,
  step = 1,
  logName = "",
  section = "",
  tab = "",
  disabled = false,
}: SlideProps) => {
  const { addLog } = useLogContext();
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  const debouncedValueChange = useCallback(
    (value: number) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        addLog({
          section: section,
          tab: tab,
          event: "update",
          message: `${
            logName === "" ? sliderName : logName
          } value changed from ${sliderValue} to ${value}`,
          value: `${value}`,
        });
        setSliderValue(value);
      }, 150); // 150ms debounce
    },
    [sliderName, logName, section, tab, sliderValue, setSliderValue, addLog]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center text-slate-400 text-sm">
        <p>{sliderName}</p>
        <p>{sliderValue}</p>
      </div>
      <Slider
        value={[sliderValue]}
        min={min}
        max={max}
        step={step}
        onValueChange={(e) => {
          debouncedValueChange(e[0]);
        }}
        disabled={disabled}
      />
    </div>
  );
};

export default CustomSlider;
