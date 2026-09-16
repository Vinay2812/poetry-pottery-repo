interface CommissionStepItem {
  title: string;
  detail: string;
}

export interface CommissionStepsProps {
  steps: CommissionStepItem[];
}

// A real sequence, numbered, so the wait is stated before anyone has to ask about it.
export function CommissionSteps({ steps }: CommissionStepsProps) {
  return (
    <ol className="grid gap-px bg-ash sm:grid-cols-2 lg:grid-cols-5">
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="flex flex-col gap-2 bg-background p-5 lg:p-6"
        >
          <span className="text-[11px] tracking-[0.18em] text-muted-foreground tnum">
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
