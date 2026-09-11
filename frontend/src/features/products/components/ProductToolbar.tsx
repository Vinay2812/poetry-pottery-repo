import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductSort } from "@/graphql/generated/graphql";

import { SORT_OPTIONS } from "@/features/products/types";

export interface ProductToolbarProps {
  total: number;
  isLoading: boolean;
  sort: ProductSort;
  activeFilterCount: number;
  onSortChange: (sort: ProductSort) => void;
  onOpenFilters: () => void;
}

export function ProductToolbar({
  total,
  isLoading,
  sort,
  activeFilterCount,
  onSortChange,
  onOpenFilters,
}: ProductToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {isLoading
          ? "Finding pieces…"
          : `${total} ${total === 1 ? "piece" : "pieces"}`}
      </p>
      <div className="flex items-center gap-2">
        <Select
          value={sort}
          onValueChange={(value) => onSortChange(value as ProductSort)}
        >
          <SelectTrigger
            aria-label="Sort by"
            className="h-10 rounded-full bg-background"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          className="h-10 rounded-full lg:hidden"
          onClick={onOpenFilters}
        >
          <SlidersHorizontal className="size-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
