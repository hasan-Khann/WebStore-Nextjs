"use client";

import * as React from "react";
import * as RadixSlider from "@radix-ui/react-slider";
import clsx from "clsx";

const Slider = React.forwardRef(({ value, onValueChange, min = 0, max = 100, step = 1, className }, ref) => (
  <RadixSlider.Root
    ref={ref}
    value={value}
    onValueChange={onValueChange}
    min={min}
    max={max}
    step={step}
    className={clsx("relative flex items-center select-none touch-none w-full h-5", className)}
  >
    <RadixSlider.Track className="relative bg-zinc-200 dark:bg-zinc-800 flex-1 h-1 rounded-full">
      <RadixSlider.Range className="absolute bg-indigo-600 dark:bg-indigo-400 h-full rounded-full" />
    </RadixSlider.Track>
    <RadixSlider.Thumb className="block w-5 h-5 bg-indigo-600 dark:bg-indigo-400 rounded-full shadow-md hover:scale-110 transition-transform" />
  </RadixSlider.Root>
));

Slider.displayName = "Slider";

export { Slider };
