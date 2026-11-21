import type { ReactNode } from "react";

export interface OrderNextStepProps {
  number: number;
  title: string;
  line: string;
  action?: ReactNode;
}

// One numbered step after an order is placed; an action sits under the step it belongs to.
export function OrderNextStep({
  number,
  title,
  line,
  action,
}: OrderNextStepProps) {
  return (
    <li className="flex gap-4">
      <span className="w-4 shrink-0 text-[15px] text-muted-foreground tnum">
        {number}
      </span>
      <div className="flex flex-col items-start gap-0.5">
        <p className="text-[15px]">{title}</p>
        <p className="text-[13px] text-muted-foreground">{line}</p>
        {action && <div className="mt-3">{action}</div>}
      </div>
    </li>
  );
}
