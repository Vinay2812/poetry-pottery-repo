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
    <ol className="flex flex-col">
      {steps.map((step, index) => {
        const isReached = index <= currentIndex;
        const isCurrent = !isClosed && index === currentIndex;
        return (
          <li key={step.key} className="flex gap-4">
            <div className="flex w-2 flex-col items-center pt-1.5">
              <span
                aria-hidden="true"
                className={cn(
                  "size-2 shrink-0",
                  isClosed && isReached && "bg-smoke",
                  !isClosed && isReached && "bg-ink",
                  !isReached && "bg-ash",
                )}
              />
              {index < steps.length - 1 && (
                <span aria-hidden="true" className="w-px flex-1 bg-ash" />
              )}
            </div>
            <div
              className={cn(
                "flex flex-col gap-0.5 pb-6",
                !isReached && "text-muted-foreground",
              )}
            >
              <span className="text-sm">
                {step.label}
                {isCurrent && <span className="sr-only"> (current)</span>}
              </span>
              <span className="text-[13px] text-muted-foreground">
                {step.date ?? step.description}
              </span>
            </div>
          </li>
        );
      })}
      {isClosed && closedLabel && (
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
