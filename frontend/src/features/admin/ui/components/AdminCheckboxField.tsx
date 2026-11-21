"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface AdminCheckboxFieldProps {
  id: string;
  label: string;
  hint: string | null;
  isChecked: boolean;
  isDisabled: boolean;
  onCheckedChange: (isChecked: boolean) => void;
}

/** A checkbox, its label as a tall tap target, and an optional line under the label. */
export function AdminCheckboxField({
  id,
  label,
  hint,
  isChecked,
  isDisabled,
  onCheckedChange,
}: AdminCheckboxFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-x-2.5">
      <Checkbox
        id={id}
        checked={isChecked}
        disabled={isDisabled}
        aria-describedby={hintId}
        onCheckedChange={(checked) => onCheckedChange(checked === true)}
      />
      <Label htmlFor={id} className="flex min-h-9 items-center text-[13px]">
        {label}
      </Label>
      {hint && (
        <p
          id={hintId}
          className="col-start-2 text-[12px] text-muted-foreground"
        >
          {hint}
        </p>
      )}
    </div>
  );
}
