import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

export interface QuantityStepperProps {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  size?: "sm" | "md";
}

export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  size = "md",
}: QuantityStepperProps) {
  const buttonClass = cn(
    "flex items-center justify-center transition-colors hover:text-primary disabled:opacity-40",
    size === "sm" ? "size-8" : "size-11",
  );
  return (
    <div
      className="inline-flex items-center border border-ash"
      role="group"
      aria-label="Quantity"
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className={buttonClass}
      >
        <Minus className="size-4" strokeWidth={1.5} />
      </button>
      <span className="min-w-6 text-center text-sm tnum" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        className={buttonClass}
      >
        <Plus className="size-4" strokeWidth={1.5} />
      </button>
    </div>
  );
}
