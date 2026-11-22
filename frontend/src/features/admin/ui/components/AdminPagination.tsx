"use client";

import { Button } from "@/components/ui/button";

import { formatRange, toPreviousPage } from "@/features/admin/shell/types";

export interface AdminPaginationProps {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
}

export function AdminPagination({
  page,
  limit,
  total,
  hasMore,
  onPageChange,
}: AdminPaginationProps) {
  const range = formatRange(page, limit, total);
  // One page needs only the count, not two dead buttons.
  const hasPager = page > 1 || hasMore;
  if (!range && !hasPager) return null;
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      {range && (
        <p className="text-[13px] text-muted-foreground tnum">{range}</p>
      )}
      {hasPager && (
        <div className="ml-auto flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(toPreviousPage(page, limit, total))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!hasMore}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
