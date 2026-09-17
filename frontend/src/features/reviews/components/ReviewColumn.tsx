import Link from "next/link";

import { RatingMarkers } from "@/features/reviews/components/RatingMarkers";

export interface ReviewColumnProps {
  authorName: string;
  rating: number;
  line: string;
  subjectName: string | null;
  href: string | null;
}

// One hairline column in the home row: a name, a rating and a single line.
export function ReviewColumn({
  authorName,
  rating,
  line,
  subjectName,
  href,
}: ReviewColumnProps) {
  const subject =
    subjectName && href ? (
      <Link
        href={href}
        className="text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        {subjectName}
      </Link>
    ) : subjectName ? (
      <span className="text-[13px] text-muted-foreground">{subjectName}</span>
    ) : null;

  return (
    <div className="flex flex-col gap-3 border-t border-ash pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-6 md:first:border-l-0 md:first:pl-0">
      <RatingMarkers rating={rating} />
      <p className="text-[15px] leading-relaxed">{line}</p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[13px]">{authorName}</span>
        {subject && (
          <>
            <span
              aria-hidden="true"
              className="text-[13px] text-muted-foreground"
            >
              ·
            </span>
            {subject}
          </>
        )}
      </div>
    </div>
  );
}
