import { cn } from "@/lib/utils";

import { ReviewSummary } from "@/features/reviews/components/ReviewSummary";
import type { ReviewListStatus } from "@/features/reviews/types";

export interface ReviewsSectionProps {
  title: string;
  average: number;
  count: number;
  distribution: number[];
  quietLine: string | null;
  ctaLabel: string | null;
  status: ReviewListStatus;
  isPending: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
  onWriteReview?: () => void;
  onLoadMore?: () => void;
  onRetry?: () => void;
  children: React.ReactNode;
}

export function ReviewsSection({
  title,
  average,
  count,
  distribution,
  quietLine,
  ctaLabel,
  status,
  isPending,
  hasMore,
  isLoadingMore,
  onWriteReview,
  onLoadMore,
  onRetry,
  children,
}: ReviewsSectionProps) {
  return (
    <section className="flex flex-col gap-6 border-t border-ash pt-12">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="font-heading text-2xl tracking-tight">{title}</h2>
        {ctaLabel && onWriteReview && (
          <button
            type="button"
            onClick={onWriteReview}
            className="border-b border-ink pb-0.5 text-[13px] hover:border-primary hover:text-primary"
          >
            {ctaLabel}
          </button>
        )}
      </div>

      {status === "loading" ? (
        <div aria-busy="true" className="h-24 animate-pulse bg-ash" />
      ) : status === "failed" ? (
        <p role="status" className="text-[13px] text-muted-foreground">
          The reviews did not load.{" "}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="border-b border-ink pb-0.5 text-foreground hover:border-primary hover:text-primary"
            >
              Try again
            </button>
          )}
        </p>
      ) : (
        <>
          <div
            aria-busy={isPending}
            className={cn(
              "flex flex-col gap-6 transition-opacity duration-200",
              isPending && "opacity-60",
            )}
          >
            <div className="flex flex-col gap-2">
              <ReviewSummary
                average={average}
                count={count}
                distribution={distribution}
              />
              {quietLine && (
                <p className="text-[13px] text-muted-foreground">{quietLine}</p>
              )}
            </div>
            <ul className="flex flex-col">{children}</ul>
          </div>
          {hasMore && onLoadMore && (
            <button
              type="button"
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="w-fit border-b border-ink pb-0.5 text-[13px] hover:border-primary hover:text-primary disabled:opacity-50"
            >
              {isLoadingMore ? "Loading…" : "More reviews"}
            </button>
          )}
        </>
      )}
    </section>
  );
}
