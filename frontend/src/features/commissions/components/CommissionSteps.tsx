interface CommissionStepItem {
  title: string;
  detail: string;
}

export interface CommissionStepsProps {
  steps: CommissionStepItem[];
}

// A real sequence, numbered, so the wait is stated before anyone has to ask about it.
// Columns flow from the step count, so any number the studio sets fills one row on desktop.
export function CommissionSteps({ steps }: CommissionStepsProps) {
  return (
    <ol className="grid gap-x-6 sm:grid-cols-2 lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none">
      {steps.map((step, index) => (
        <li
          key={`${index}:${step.title}`}
          className="grid grid-cols-[2.25rem_1fr] gap-y-1.5 border-t border-ash py-5 lg:flex lg:flex-col lg:gap-2 lg:pb-0"
        >
          <span className="row-span-2 pt-0.5 text-[11px] tracking-[0.18em] text-muted-foreground tnum">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="text-[15px] leading-snug">{step.title}</h3>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            {step.detail}
          </p>
        </li>
      ))}
    </ol>
  );
}
