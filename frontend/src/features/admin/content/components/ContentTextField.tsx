import type { UseFormRegisterReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { AdminField, adminFieldMessageId } from "@/features/admin/ui";

export interface ContentTextFieldProps {
  id: string;
  label: string;
  hint: string | null;
  error: string | undefined;
  isMultiline: boolean;
  registration: UseFormRegisterReturn;
}

/** One labelled console field, dense enough for a form with many of them. */
export function ContentTextField({
  id,
  label,
  hint,
  error,
  isMultiline,
  registration,
}: ContentTextFieldProps) {
  const describedBy = adminFieldMessageId(id, hint, error);
  return (
    <AdminField id={id} label={label} hint={hint} error={error}>
      {isMultiline ? (
        <Textarea
          id={id}
          className="min-h-24 text-[13px] md:text-[13px]"
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...registration}
        />
      ) : (
        <Input
          id={id}
          className="h-9 text-[13px] md:text-[13px]"
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...registration}
        />
      )}
    </AdminField>
  );
}
