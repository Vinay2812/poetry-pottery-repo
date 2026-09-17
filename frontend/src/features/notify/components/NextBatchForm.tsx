import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { NotifyState } from "@/features/notify/types";

export interface NextBatchFormProps {
  email: string;
  state: NotifyState;
  message: string | null;
  onEmailChange: (value: string) => void;
  onSubmit: () => void;
}

export function NextBatchForm({
  email,
  state,
  message,
  onEmailChange,
  onSubmit,
}: NextBatchFormProps) {
  if (state === "waiting") {
    return (
      <p role="status" className="border-t border-ash pt-5 text-[15px]">
        {message}
      </p>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-3 border-t border-ash pt-5"
    >
      <Label htmlFor="next-batch-email" className="text-[15px]">
        Tell me when this comes out of the kiln
      </Label>
      <div className="flex max-w-md gap-0">
        <Input
          id="next-batch-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          aria-invalid={state === "error"}
          onChange={(event) => onEmailChange(event.target.value)}
        />
        <Button type="submit">Tell me</Button>
      </div>
      {/* The line keeps its height either way, so nothing below it jumps. */}
      <p role="alert" className="min-h-4 text-[13px] text-destructive">
        {state === "error" ? message : null}
      </p>
    </form>
  );
}
