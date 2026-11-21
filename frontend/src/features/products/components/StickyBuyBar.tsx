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
  barRef?: React.Ref<HTMLDivElement>;
}

// Phone and tablet bar that appears once the main buttons have scrolled up out of view.
// Sits on the bottom nav (64px, its rule, the safe-area inset); STICKY_BAR_SCROLL_PADDING covers both, resize together.
export function StickyBuyBar({
  isVisible,
  name,
  quantity,
  total,
  isSoldOut,
  isAddingToCart,
  canAddToCart,
  onAddToCart,
  barRef,
}: StickyBuyBarProps) {
  return (
    <div
      ref={barRef}
      aria-hidden={!isVisible}
      inert={!isVisible}
      className={cn(
        "fixed inset-x-0 bottom-[calc(4rem+1px+env(safe-area-inset-bottom))] z-30 flex items-center gap-3 border-t border-ash bg-background px-4 py-3 transition-transform duration-300 lg:hidden",
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
