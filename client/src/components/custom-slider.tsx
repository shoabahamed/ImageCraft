import { Slider } from "./ui/slider";

type SlideProps = {
  sliderName: string;
  min: number;
  max: number;
  defaultValue: number;
  sliderValue: number;
  setSliderValue: (value: number) => void;
  step?: number;
};

const CustomSlider = ({
  sliderName,
  min,
  max,
  defaultValue,
  sliderValue,
  setSliderValue,
  step = 1,
}: SlideProps) => {
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
        onValueChange={(e) => setSliderValue(e[0])}
      />
    </div>
  );
};

export default CustomSlider;
