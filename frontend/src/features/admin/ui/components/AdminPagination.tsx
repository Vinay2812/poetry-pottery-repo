"use client";

import { Button } from "@/components/ui/button";

import { formatRange } from "@/features/admin/shell/types";

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
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <p className="text-[13px] text-muted-foreground tnum">
        {formatRange(page, limit, total)}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
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
    </div>
  );
}
