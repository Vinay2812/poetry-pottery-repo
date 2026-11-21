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
  // A search keeps its own relevance order, so no other sort is offered while one is active.
  isRelevanceOnly?: boolean;
  activeFilterCount: number;
  onSortChange: (sort: ProductSort) => void;
  onOpenFilters: () => void;
  onClear: () => void;
}

const CONTROL_CLASS = "h-10 border border-ash bg-transparent text-sm";

// Phones get the filters and sort boxes with the count under them; wider screens put the count left.
export function ProductToolbar({
  countLabel,
  isLoading,
  sort,
  isRelevanceOnly = false,
  activeFilterCount,
  onSortChange,
  onOpenFilters,
  onClear,
}: ProductToolbarProps) {
  return (
    <div className="flex flex-col gap-3 md:min-h-10 md:flex-row md:items-center md:justify-between md:gap-4">
      {/* The filters box takes what it needs, so the sort box has room for its longest name. */}
      <div className="grid shrink-0 grid-cols-[auto_minmax(0,1fr)] gap-3 md:flex md:items-center md:gap-4">
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
            "flex items-center justify-center gap-2 px-4 transition-colors hover:border-ink lg:hidden",
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
        {isRelevanceOnly ? (
          <p
            className={cn(
              CONTROL_CLASS,
              "flex items-center px-2.5 text-muted-foreground",
            )}
          >
            <span className="sr-only">Sorted by </span>
            Most relevant
          </p>
        ) : (
          <Select
            value={sort}
            onValueChange={(value) => onSortChange(value as ProductSort)}
          >
            <SelectTrigger
              aria-label="Sort by"
              className={cn(
                CONTROL_CLASS,
                "w-full transition-colors hover:border-ink md:w-fit",
              )}
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
        )}
      </div>
      {/* After the controls in reading order, as phones show it; wider screens lift it to the left. */}
      <p
        className="min-h-5 min-w-0 text-[13px] wrap-anywhere text-muted-foreground tnum md:order-first"
        aria-live="polite"
      >
        {isLoading ? "Finding pieces…" : countLabel}
      </p>
    </div>
  );
}
