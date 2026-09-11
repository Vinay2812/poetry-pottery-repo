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
    "flex items-center justify-center rounded-full transition-colors hover:bg-primary-light disabled:opacity-40",
    size === "sm" ? "size-8" : "size-11",
  );
  return (
    <div
      className="inline-flex items-center rounded-full border border-border bg-background"
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
        <Minus className="size-4" />
      </button>
      <span
        className="min-w-8 text-center text-sm font-semibold tabular-nums"
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        className={buttonClass}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
