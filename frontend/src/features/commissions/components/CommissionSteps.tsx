interface CommissionStepItem {
  title: string;
  detail: string;
}

export interface CommissionStepsProps {
  steps: CommissionStepItem[];
}

// A numbered sequence; each step keeps a readable width and rows wrap, so any step count fits.
export function CommissionSteps({ steps }: CommissionStepsProps) {
  return (
    <ol className="grid gap-x-6 sm:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]">
      {steps.map((step, index) => (
        <li
          key={`${index}:${step.title}`}
          className="grid min-w-0 grid-cols-[2.25rem_1fr] gap-y-1.5 border-t border-ash py-5 sm:flex sm:flex-col sm:gap-2"
        >
          <span className="row-span-2 pt-0.5 text-[11px] tracking-[0.18em] text-muted-foreground tnum">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="text-[15px] leading-snug wrap-anywhere">
            {step.title}
          </h3>
          <p className="text-[13px] leading-relaxed wrap-anywhere text-muted-foreground">
            {step.detail}
          </p>
        </li>
      ))}
    </ol>
  );
}
