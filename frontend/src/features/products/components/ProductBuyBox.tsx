import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";

import { GlazeChip } from "@/features/products/components/GlazeChip";
import { PriceTag } from "@/features/products/components/PriceTag";
import { QuantityStepper } from "@/features/products/components/QuantityStepper";
import { StockBadge } from "@/features/products/components/StockBadge";
import type { StockTone } from "@/features/products/types";

export interface ProductBuyBoxProps {
  name: string;
  collectionName: string | null;
  collectionHref: string | null;
  unitPrice: number;
  compareAtPrice: number | null;
  material: string;
  colorName: string | null;
  colorCode: string | null;
  stockTone: StockTone;
  stockLabel: string;
  ratingAvg: number;
  ratingCount: number;
  quantity: number;
  maxQuantity: number;
  isWishlisted: boolean;
  isAddingToCart: boolean;
  canAddToCart: boolean;
  freeShippingAbove: number | null;
  onQuantityChange: (value: number) => void;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
  options?: React.ReactNode;
}

export function ProductBuyBox({
  name,
  collectionName,
  collectionHref,
  unitPrice,
  compareAtPrice,
  material,
  colorName,
  colorCode,
  stockTone,
  stockLabel,
  ratingAvg,
  ratingCount,
  quantity,
  maxQuantity,
  isWishlisted,
  isAddingToCart,
  canAddToCart,
  freeShippingAbove,
  onQuantityChange,
  onAddToCart,
  onToggleWishlist,
  options,
}: ProductBuyBoxProps) {
  const isSoldOut = stockTone === "sold_out";
  const total = unitPrice * quantity;
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        {collectionName && collectionHref && (
          <Link
            href={collectionHref}
            className="text-xs font-semibold tracking-[0.14em] text-terracotta-dark uppercase"
          >
            {collectionName}
          </Link>
        )}
        <h1 className="font-heading text-3xl leading-tight text-balance md:text-4xl">
          {name}
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <GlazeChip
            colorCode={colorCode}
            colorName={colorName}
            material={material}
          />
          {ratingCount > 0 && (
            <a
              href="#reviews"
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              <span aria-hidden="true">★</span> {ratingAvg.toFixed(1)} ·{" "}
              {ratingCount} {ratingCount === 1 ? "review" : "reviews"}
            </a>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <PriceTag price={unitPrice} compareAtPrice={compareAtPrice} size="lg" />
        <StockBadge tone={stockTone} label={stockLabel} />
      </div>

      {options}

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {!isSoldOut && (
            <QuantityStepper
              value={quantity}
              max={maxQuantity}
              onChange={onQuantityChange}
            />
          )}
          <Button
            size="lg"
            className="h-12 flex-1 rounded-full"
            onClick={onAddToCart}
            disabled={!canAddToCart || isAddingToCart || isSoldOut}
          >
            <ShoppingBag className="size-4" />
            {isSoldOut
              ? "Sold out"
              : isAddingToCart
                ? "Adding…"
                : `Add to cart · ${formatInr(total)}`}
          </Button>
          <Button
            variant="outline"
            size="icon-lg"
            className={cn(
              "rounded-full",
              isWishlisted && "border-terracotta text-terracotta",
            )}
            onClick={onToggleWishlist}
            aria-pressed={isWishlisted}
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Save to wishlist"
            }
          >
            <Heart
              className={cn("size-5", isWishlisted && "fill-terracotta")}
            />
          </Button>
        </div>
        <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
          <li>Fired and packed by hand in our Sangli studio</li>
          <li>
            {freeShippingAbove !== null
              ? `Free shipping on orders above ${formatInr(freeShippingAbove)}`
              : "Flat-rate shipping across India"}
          </li>
          <li>
            Order now, we confirm on WhatsApp, pay by UPI or bank transfer
          </li>
        </ul>
      </div>
    </div>
  );
}
