import { Button } from "@/components/ui/button";

export interface LoadMoreProps {
  hasMore: boolean;
  isLoading: boolean;
  loadedCount: number;
  total: number;
  onLoadMore: () => void;
  sentinelRef?: (node: HTMLDivElement | null) => void;
}

export function LoadMore({
  hasMore,
  isLoading,
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
      {hasMore && (
        <Button variant="outline" onClick={onLoadMore} disabled={isLoading}>
          {isLoading ? "Loading…" : "Show more pieces"}
        </Button>
      )}
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
    </div>
  );
}
