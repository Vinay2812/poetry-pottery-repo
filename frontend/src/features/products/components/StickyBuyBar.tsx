import { Button } from "@/components/ui/button";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";

import { toAddToCartLabel } from "@/features/products/types";

export interface StickyBuyBarProps {
  isVisible: boolean;
  name: string;
  quantity: number;
  total: number;
  isSoldOut: boolean;
  isAddingToCart: boolean;
  canAddToCart: boolean;
  onAddToCart: () => void;
}

// Phone and tablet bar that appears once the main buttons have scrolled up out of view.
// Its height plus the bottom nav's is STICKY_BAR_SCROLL_PADDING in products/types.ts; resize both together.
export function StickyBuyBar({
  isVisible,
  name,
  quantity,
  total,
  isSoldOut,
  isAddingToCart,
  canAddToCart,
  onAddToCart,
}: StickyBuyBarProps) {
  return (
    <div
      aria-hidden={!isVisible}
      className={cn(
        "fixed inset-x-0 bottom-16 z-30 flex items-center gap-3 border-t border-ash bg-background px-4 py-3 transition-transform duration-300 lg:hidden",
        isVisible ? "translate-y-0" : "translate-y-[120%]",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{name}</p>
        <p className="text-sm text-muted-foreground tnum">{formatInr(total)}</p>
      </div>
      <Button
        onClick={onAddToCart}
        disabled={isSoldOut || !canAddToCart || isAddingToCart}
        tabIndex={isVisible ? 0 : -1}
      >
        {isSoldOut
          ? "Sold out"
          : isAddingToCart
            ? "Adding…"
            : toAddToCartLabel(quantity)}
      </Button>
    </div>
  );
}
