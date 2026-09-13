import { cn } from "@/lib/utils";

import { toRatingLabel } from "@/features/reviews/types";

export interface RatingMarkersProps {
  rating: number;
  isLarge?: boolean;
  className?: string;
}

const MARKS = [1, 2, 3, 4, 5];

// Five small squares instead of stars: filled in ink, empty as a hairline.
export function RatingMarkers({
  rating,
  isLarge = false,
  className,
}: RatingMarkersProps) {
  return (
    <span
      role="img"
      aria-label={toRatingLabel(rating)}
      className={cn("inline-flex items-center gap-1", className)}
    >
      {MARKS.map((mark) => (
        <span
          key={mark}
          aria-hidden="true"
          className={cn(
            isLarge ? "size-3" : "size-2",
            mark <= rating ? "bg-ink" : "border border-ash",
          )}
        />
      ))}
    </span>
  );
}
