import Link from "next/link";
import type { Ref } from "react";

import { Checkbox } from "@/components/ui/checkbox";

export interface TermsAgreementProps {
  id: string;
  isChecked: boolean;
  error: string | null;
  // Off where nothing is paid, such as a brief or a free seat.
  hasPaymentNote: boolean;
  // Lets the form focus the box when a submit is refused without it.
  ref?: Ref<HTMLButtonElement>;
  onCheckedChange: (isChecked: boolean) => void;
}

const LINK =
  "border-b border-ink/40 text-ink hover:border-primary hover:text-primary";

export function TermsAgreement({
  id,
  isChecked,
  error,
  hasPaymentNote,
  ref,
  onCheckedChange,
}: TermsAgreementProps) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <Checkbox
          ref={ref}
          id={id}
          checked={isChecked}
          onCheckedChange={(checked) => onCheckedChange(checked === true)}
          aria-invalid={error !== null}
          aria-describedby={error ? errorId : undefined}
          className="mt-0.5"
        />
        <label htmlFor={id} className="text-[13px] leading-relaxed text-ink">
          I agree to the{" "}
          <Link href="/terms" target="_blank" rel="noopener" className={LINK}>
            terms and conditions
            <span className="sr-only"> (opens in a new tab)</span>
          </Link>{" "}
          and have read the{" "}
          <Link href="/privacy" target="_blank" rel="noopener" className={LINK}>
            privacy policy
            <span className="sr-only"> (opens in a new tab)</span>
          </Link>
          .
          {hasPaymentNote &&
            " Once I pay, I can't cancel or get a refund if I change my mind."}
        </label>
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
