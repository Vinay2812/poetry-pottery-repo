import { cn } from "@/lib/utils";

import type { TimelineStep } from "@/features/orders/types";

export interface OrderTimelineProps {
  steps: TimelineStep[];
  closedLabel: string | null;
}

const STATE_FOR_READERS: Record<TimelineStep["state"], string> = {
  done: "",
  current: " (current)",
  upcoming: " (not yet)",
};

// Shared by orders, wheel sessions and event bookings; each maps its own status to stages.
export function OrderTimeline({ steps, closedLabel }: OrderTimelineProps) {
  const isClosed = closedLabel !== null;
  return (
    <ol className="flex flex-col">
      {steps.map((step, index) => {
        const isUpcoming = step.state === "upcoming";
        const hasLine = index < steps.length - 1 || isClosed;
        return (
          <li key={step.key} className="flex gap-4">
            <div className="flex w-2 flex-col items-center pt-1.5">
              <span
                aria-hidden="true"
                className={cn(
                  "size-2 shrink-0",
                  isUpcoming ? "bg-ash" : isClosed ? "bg-smoke" : "bg-ink",
                )}
              />
              {hasLine && (
                <span aria-hidden="true" className="w-px flex-1 bg-ash" />
              )}
            </div>
            <div className="flex flex-col gap-0.5 pb-6">
              <span
                className={cn("text-sm", isUpcoming && "text-muted-foreground")}
              >
                {step.label}
                <span className="sr-only">{STATE_FOR_READERS[step.state]}</span>
              </span>
              {step.date && (
                <span className="text-[13px] text-muted-foreground tnum">
                  {step.date}
                </span>
              )}
              {step.note && (
                <span className="text-[13px] text-muted-foreground">
                  {step.note}
                </span>
              )}
            </div>
          </li>
        );
      })}
      {closedLabel && (
        <li className="flex gap-4">
          <div className="flex w-2 flex-col items-center pt-1.5">
            <span aria-hidden="true" className="size-2 shrink-0 bg-ink" />
          </div>
          <span className="text-sm">{closedLabel}</span>
        </li>
      )}
    </ol>
  );
}
