import { Button } from "@/components/ui/button";

export interface LoadMoreProps {
  hasMore: boolean;
  isLoading: boolean;
  // The last next-page request failed; the cards already loaded stay, and the button retries.
  hasFailed?: boolean;
  loadedCount: number;
  total: number;
  onLoadMore: () => void;
  sentinelRef?: (node: HTMLDivElement | null) => void;
}

export function LoadMore({
  hasMore,
  isLoading,
  hasFailed = false,
  loadedCount,
  total,
  onLoadMore,
  sentinelRef,
}: LoadMoreProps) {
  if (!hasMore && loadedCount === 0) return null;
  return (
    <div className="flex flex-col items-center gap-4 border-t border-ash py-10">
      <p className="text-[13px] text-muted-foreground tnum">
        Showing {loadedCount} of {total}
      </p>
      {hasFailed && (
        <p role="status" className="text-[13px] text-muted-foreground">
          The next pieces did not load.
        </p>
      )}
      {hasMore && (
        <Button variant="outline" onClick={onLoadMore} disabled={isLoading}>
          {isLoading
            ? "Loading…"
            : hasFailed
              ? "Try again"
              : "Show more pieces"}
        </Button>
      )}
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
    </div>
  );
}
