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
      <p className="text-[13px] text-muted-foreground tnum" aria-live="polite">
        {isLoading
          ? "Finding pieces…"
          : `${total} ${total === 1 ? "piece" : "pieces"}`}
      </p>
      <div className="flex items-center gap-2">
        <Select
          value={sort}
          onValueChange={(value) => onSortChange(value as ProductSort)}
        >
          <SelectTrigger aria-label="Sort by" className="h-10 bg-transparent">
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
        <button
          type="button"
          onClick={onOpenFilters}
          className="text-sm underline-offset-4 hover:text-primary hover:underline lg:hidden"
        >
          Filters{" "}
          <span className={cn("tnum", activeFilterCount === 0 && "invisible")}>
            ({activeFilterCount})
          </span>
        </button>
      </div>
    </div>
  );
}
