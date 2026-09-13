"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { NewsletterState } from "@/features/content/types";

export interface NewsletterFormProps {
  email: string;
  state: NewsletterState;
  message: string | null;
  onEmailChange: (value: string) => void;
  onSubmit: () => void;
}

export function NewsletterForm({
  email,
  state,
  message,
  onEmailChange,
  onSubmit,
}: NewsletterFormProps) {
  if (state === "subscribed") {
    return (
      <p role="status" className="text-[15px]">
        {message ?? "You are on the list. We write when a batch comes out."}
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
      className="flex flex-col gap-3"
    >
      <Label htmlFor="newsletter-email" className="text-[15px]">
        Hear when a new batch comes out of the kiln
      </Label>
      <div className="flex max-w-md gap-0">
        <Input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          aria-invalid={state === "error"}
          onChange={(event) => onEmailChange(event.target.value)}
        />
        <Button type="submit" disabled={state === "submitting"}>
          {state === "submitting" ? "Adding…" : "Subscribe"}
        </Button>
      </div>
      {state === "error" && message && (
        <p role="alert" className="text-[13px] text-destructive">
          {message}
        </p>
      )}
    </form>
  );
}
