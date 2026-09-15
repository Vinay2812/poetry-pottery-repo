"use client";

import { cn } from "@/lib/utils";

import { toRatingLabel } from "@/features/reviews/types";

export interface RatingInputProps {
  name: string;
  value: number;
  error?: string | undefined;
  onChange: (rating: number) => void;
}

const CHOICES = [1, 2, 3, 4, 5];

// A plain radio group: five squares, each with its own accessible name.
export function RatingInput({
  name,
  value,
  error,
  onChange,
}: RatingInputProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-[13px] text-muted-foreground">Rating</legend>
      <div className="flex items-center gap-2">
        {CHOICES.map((choice) => (
          <label
            key={choice}
            className="group cursor-pointer p-1 focus-within:ring-2 focus-within:ring-primary/30"
          >
            <input
              type="radio"
              name={name}
              value={choice}
              checked={value === choice}
              onChange={() => onChange(choice)}
              className="sr-only"
            />
            <span className="sr-only">{toRatingLabel(choice)}</span>
            <span
              aria-hidden="true"
              className={cn(
                "block size-6 transition-colors duration-150 motion-reduce:transition-none",
                choice <= value
                  ? "bg-ink"
                  : "border border-ash group-hover:border-ink",
              )}
            />
          </label>
        ))}
      </div>
      {error && (
        <p role="alert" className="text-[13px] text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  );
}
