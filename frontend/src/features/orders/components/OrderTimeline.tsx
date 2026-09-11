import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export interface OrderTimelineStep {
  key: string;
  label: string;
  description: string;
  date: string | null;
}

export interface OrderTimelineProps {
  steps: OrderTimelineStep[];
  currentIndex: number;
  isClosed: boolean;
  closedLabel: string | null;
}

export function OrderTimeline({
  steps,
  currentIndex,
  isClosed,
  closedLabel,
}: OrderTimelineProps) {
  return (
    <ol className="flex flex-col gap-0">
      {steps.map((step, index) => {
        const isDone = !isClosed && index < currentIndex;
        const isCurrent = !isClosed && index === currentIndex;
        const isFrozen = isClosed && index <= currentIndex;
        return (
          <li key={step.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  isDone && "bg-primary text-primary-foreground",
                  isCurrent &&
                    "bg-primary text-primary-foreground ring-4 ring-primary/20",
                  isFrozen && "bg-neutral-300 text-neutral-700",
                  !isDone &&
                    !isCurrent &&
                    !isFrozen &&
                    "bg-primary-light text-primary-hover",
                )}
                aria-hidden="true"
              >
                {isDone ? <Check className="size-4" /> : index + 1}
              </span>
              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "w-px flex-1",
                    isDone ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
            <div
              className={cn(
                "flex flex-col pb-6",
                !isDone && !isCurrent && "text-muted-foreground",
              )}
            >
              <span className="text-sm font-medium">
                {step.label}
                {isCurrent && <span className="sr-only"> (current)</span>}
              </span>
              <span className="text-xs">{step.date ?? step.description}</span>
            </div>
          </li>
        );
      })}
      {isClosed && closedLabel && (
        <li className="flex gap-4">
          <span
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs text-white"
            aria-hidden="true"
          >
            ×
          </span>
          <span className="text-sm font-medium">{closedLabel}</span>
        </li>
      )}
    </ol>
  );
}
