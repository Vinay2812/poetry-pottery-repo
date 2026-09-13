export interface AdminOrderTimelineStep {
  key: string;
  label: string;
  atLabel: string;
  note: string | null;
}

export interface AdminOrderTimelineProps {
  steps: AdminOrderTimelineStep[];
}

export function AdminOrderTimeline({ steps }: AdminOrderTimelineProps) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, index) => (
        <li key={step.key} className="flex gap-3">
          <div className="flex w-2 flex-col items-center pt-1.5">
            <span aria-hidden="true" className="size-2 shrink-0 bg-ink" />
            {index < steps.length - 1 && (
              <span aria-hidden="true" className="w-px flex-1 bg-ash" />
            )}
          </div>
          <div className="flex flex-col gap-0.5 pb-4">
            <span className="text-[13px]">{step.label}</span>
            <span className="text-[12px] text-muted-foreground tnum">
              {step.atLabel}
            </span>
            {step.note && (
              <span className="text-[12px] text-muted-foreground">
                {step.note}
              </span>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
