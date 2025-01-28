import { useLogContext } from "@/hooks/useLogContext";
import { Slider } from "./ui/slider";

type SlideProps = {
  sliderName: string;
  min: number;
  max: number;
  defaultValue: number;
  sliderValue: number;
  setSliderValue: (value: number) => void;
  step?: number;
  logName?: string;
  section?: string;
  tab?: string;
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
}: SlideProps) => {
  const { addLog } = useLogContext(); // Use log contextuseLogContext
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center text-slate-400 text-sm">
        <p>{sliderName}</p>
        <p>{sliderValue}</p>
      </div>
      <Slider
        defaultValue={[defaultValue]}
        min={min}
        max={max}
        step={step}
        onValueChange={(e) => {
          addLog({
            section: section,
            tab: tab,
            event: "update",
            message: `${
              logName === "" ? sliderName : logName
            } value changed from ${sliderValue} to ${e[0]}`,
            value: `${e[0]}`,
          });
          setSliderValue(e[0]);
        }}
      />
    </div>
  );
};

export default CustomSlider;
