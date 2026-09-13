import { cn } from "@/lib/utils";

import { ReviewSummary } from "@/features/reviews/components/ReviewSummary";

export interface ReviewsSectionProps {
  title: string;
  average: number;
  count: number;
  distribution: number[];
  quietLine: string | null;
  ctaLabel: string | null;
  isLoading: boolean;
  isPending: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
  onWriteReview?: () => void;
  onLoadMore?: () => void;
  children: React.ReactNode;
}

export function ReviewsSection({
  title,
  average,
  count,
  distribution,
  quietLine,
  ctaLabel,
  isLoading,
  isPending,
  hasMore,
  isLoadingMore,
  onWriteReview,
  onLoadMore,
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

      {isLoading ? (
        <div aria-busy="true" className="h-24 animate-pulse bg-ash" />
      ) : (
        <>
          <div
            aria-busy={isPending}
            className={cn(
              "flex flex-col gap-6 transition-opacity duration-200",
              isPending && "opacity-60",
            )}
          >
            <ReviewSummary
              average={average}
              count={count}
              distribution={distribution}
            />
            {quietLine && (
              <p className="text-[13px] text-muted-foreground">{quietLine}</p>
            )}
            <ul className="flex flex-col">{children}</ul>
          </div>
          {hasMore && onLoadMore && (
            <button
              type="button"
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="w-fit border-b border-ink pb-0.5 text-[13px] hover:border-primary hover:text-primary disabled:opacity-50"
            >
              {isLoadingMore ? "Loading…" : "Load more"}
            </button>
          )}
        </>
      )}
    </section>
  );
}
