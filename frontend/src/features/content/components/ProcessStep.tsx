export interface ProcessStepProps {
  stepNumber: string;
  title: string;
  body: string;
}

export function ProcessStep({ stepNumber, title, body }: ProcessStepProps) {
  return (
    <li className="flex flex-col gap-2 border-t border-ash pt-5">
      <span className="text-[13px] text-muted-foreground tnum">
        {stepNumber}
      </span>
      <h3 className="text-base">{title}</h3>
      <p className="text-[15px] leading-relaxed text-muted-foreground">
        {body}
      </p>
    </li>
  );
}
