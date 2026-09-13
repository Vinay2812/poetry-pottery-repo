import { cn } from "@/lib/utils";

export interface ReviewMarksProps {
  rating: number;
  label: string;
}

const MARKS = [1, 2, 3, 4, 5];

// Five squares rather than stars: filled in ink, empty as a hairline.
export function ReviewMarks({ rating, label }: ReviewMarksProps) {
  return (
    <span
      role="img"
      aria-label={label}
      className="inline-flex items-center gap-1"
    >
      {MARKS.map((mark) => (
        <span
          key={mark}
          aria-hidden="true"
          className={cn(
            "size-2",
            mark <= rating ? "bg-ink" : "border border-ash",
          )}
        />
      ))}
    </span>
  );
}
