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
  // The page moves focus here after a retry: back to the button on failure, the heading on success.
  headingRef?: React.Ref<HTMLHeadingElement>;
  retryRef?: React.Ref<HTMLButtonElement>;
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
  headingRef,
  retryRef,
  children,
}: ReviewsSectionProps) {
  const isRetrying = status === "retrying";

  return (
    <section className="flex flex-col gap-6 border-t border-ash pt-12">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-heading text-2xl tracking-tight outline-none"
        >
          {title}
        </h2>
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
      ) : status === "failed" || isRetrying ? (
        <p role="status" className="text-[13px] text-muted-foreground">
          The reviews did not load.{" "}
          {onRetry && (
            // aria-disabled rather than disabled, so a keyboard user's focus stays on it.
            <button
              ref={retryRef}
              type="button"
              onClick={isRetrying ? undefined : onRetry}
              aria-disabled={isRetrying}
              className="border-b border-ink pb-0.5 text-foreground hover:border-primary hover:text-primary aria-disabled:opacity-50 aria-disabled:hover:border-ink aria-disabled:hover:text-foreground"
            >
              {isRetrying ? "Loading…" : "Try again"}
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
