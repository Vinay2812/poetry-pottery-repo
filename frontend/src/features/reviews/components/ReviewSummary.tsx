import { RatingMarkers } from "@/features/reviews/components/RatingMarkers";
import {
  toDistributionRows,
  toRatingLabel,
  toSummaryLine,
} from "@/features/reviews/types";

export interface ReviewSummaryProps {
  average: number;
  count: number;
  distribution: number[];
}

// Average on the left, hairline bars from five down to one on the right.
export function ReviewSummary({
  average,
  count,
  distribution,
}: ReviewSummaryProps) {
  const rows = toDistributionRows(distribution, count);
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-10">
      <div className="flex items-center gap-3">
        <RatingMarkers rating={Math.round(average)} isLarge />
        <p className="text-[15px] tnum">{toSummaryLine(average, count)}</p>
      </div>
      {count > 0 && (
        <ul className="flex w-full max-w-xs flex-col gap-1.5">
          {rows.map((row) => (
            <li key={row.rating} className="flex items-center gap-3">
              <span className="w-14 text-[13px] text-muted-foreground tnum">
                {toRatingLabel(row.rating)}
              </span>
              <span aria-hidden="true" className="h-px flex-1 bg-ash">
                <span
                  className="block h-px bg-ink"
                  style={{ width: `${row.percent}%` }}
                />
              </span>
              <span className="w-6 text-right text-[13px] text-muted-foreground tnum">
                {row.count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
