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
    <div className="flex flex-col items-center gap-3 py-8">
      <p className="text-xs text-muted-foreground">
        Showing {loadedCount} of {total}
      </p>
      {hasMore && (
        <Button
          variant="outline"
          className="rounded-full"
          onClick={onLoadMore}
          disabled={isLoading}
        >
          {isLoading ? "Loading…" : "Show more pieces"}
        </Button>
      )}
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
    </div>
  );
}
