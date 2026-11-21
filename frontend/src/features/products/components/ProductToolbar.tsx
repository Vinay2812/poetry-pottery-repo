import { SlidersHorizontal } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductSort } from "@/graphql/generated/graphql";
import { cn } from "@/lib/utils";

import { SORT_OPTIONS } from "@/features/products/types";

export interface ProductToolbarProps {
  countLabel: string;
  isLoading: boolean;
  sort: ProductSort;
  activeFilterCount: number;
  onSortChange: (sort: ProductSort) => void;
  onOpenFilters: () => void;
  onClear: () => void;
}

const CONTROL_CLASS =
  "h-10 border border-ash bg-transparent text-sm transition-colors hover:border-ink";

// Phones get two equal boxes, filters and sort, with the count under them; wider screens put the count left.
export function ProductToolbar({
  countLabel,
  isLoading,
  sort,
  activeFilterCount,
  onSortChange,
  onOpenFilters,
  onClear,
}: ProductToolbarProps) {
  return (
    <div className="flex flex-col gap-3 md:min-h-10 md:flex-row md:items-center md:justify-between md:gap-4">
      <p
        className="order-2 min-h-5 min-w-0 text-[13px] text-muted-foreground tnum md:order-1"
        aria-live="polite"
      >
        {isLoading ? "Finding pieces…" : countLabel}
      </p>
      <div className="order-1 grid shrink-0 grid-cols-2 gap-3 md:order-2 md:flex md:items-center md:gap-4">
        {/* Kept in the layout so clearing never moves the sort control. */}
        <button
          type="button"
          onClick={onClear}
          inert={activeFilterCount === 0}
          className={cn(
            "hidden text-sm underline-offset-4 hover:text-primary hover:underline lg:block",
            activeFilterCount === 0 && "invisible",
          )}
        >
          Clear all
        </button>
        <button
          type="button"
          onClick={onOpenFilters}
          className={cn(
            CONTROL_CLASS,
            "flex items-center justify-center gap-2 px-3 lg:hidden",
          )}
        >
          <SlidersHorizontal className="size-4" strokeWidth={1.5} />
          Filters
          {activeFilterCount > 0 && (
            <span className="text-muted-foreground tnum">
              ({activeFilterCount})
            </span>
          )}
        </button>
        <Select
          value={sort}
          onValueChange={(value) => onSortChange(value as ProductSort)}
        >
          <SelectTrigger
            aria-label="Sort by"
            className={cn(CONTROL_CLASS, "w-full md:w-fit")}
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
      </div>
    </div>
  );
}
