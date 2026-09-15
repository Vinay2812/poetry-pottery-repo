import { Heart } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";

import { GlazeChip } from "@/features/products/components/GlazeChip";
import { PriceTag } from "@/features/products/components/PriceTag";
import { QuantityStepper } from "@/features/products/components/QuantityStepper";
import { StockBadge } from "@/features/products/components/StockBadge";
import { STUDIO_NOTE, type StockTone } from "@/features/products/types";

export interface ProductBuyBoxProps {
  name: string;
  collectionName: string | null;
  collectionHref: string | null;
  unitPrice: number;
  compareAtPrice: number | null;
  material: string;
  colorName: string | null;
  colorCode: string | null;
  sizeLine: string | null;
  stockTone: StockTone;
  stockLabel: string;
  quantity: number;
  maxQuantity: number;
  isWishlisted: boolean;
  isAddingToCart: boolean;
  canAddToCart: boolean;
  freeShippingAbove: number | null;
  askUrl: string | null;
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
  sizeLine,
  stockTone,
  stockLabel,
  quantity,
  maxQuantity,
  isWishlisted,
  isAddingToCart,
  canAddToCart,
  freeShippingAbove,
  askUrl,
  onQuantityChange,
  onAddToCart,
  onToggleWishlist,
  options,
}: ProductBuyBoxProps) {
  const isSoldOut = stockTone === "sold_out";
  const total = unitPrice * quantity;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {collectionName && collectionHref && (
          <Link
            href={collectionHref}
            className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase underline-offset-4 hover:underline"
          >
            {collectionName}
          </Link>
        )}
        <h1 className="font-heading text-3xl leading-tight tracking-tight text-balance md:text-4xl">
          {name}
        </h1>
        <div className="flex flex-col gap-1">
          <PriceTag
            price={unitPrice}
            compareAtPrice={compareAtPrice}
            size="lg"
          />
          {sizeLine && (
            <p className="text-[13px] text-muted-foreground">{sizeLine}</p>
          )}
        </div>
        <GlazeChip
          colorCode={colorCode}
          colorName={colorName}
          material={material}
        />
        <StockBadge tone={stockTone} label={stockLabel} />
      </div>

      {options}

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          {!isSoldOut && (
            <QuantityStepper
              value={quantity}
              max={maxQuantity}
              onChange={onQuantityChange}
            />
          )}
          <Button
            size="lg"
            className="flex-1"
            onClick={onAddToCart}
            disabled={!canAddToCart || isAddingToCart || isSoldOut}
          >
            {isSoldOut
              ? "Sold out"
              : isAddingToCart
                ? "Adding…"
                : `Add to cart · ${formatInr(total)}`}
          </Button>
          <Button
            variant="outline"
            size="icon-lg"
            className={cn(isWishlisted && "bg-ink text-white")}
            onClick={onToggleWishlist}
            aria-pressed={isWishlisted}
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Save to wishlist"
            }
          >
            <Heart
              className={cn("size-5", isWishlisted && "fill-current")}
              strokeWidth={1.5}
            />
          </Button>
        </div>

        <p className="text-[13px] text-muted-foreground">{STUDIO_NOTE}</p>

        {askUrl && (
          <a
            href={askUrl}
            target="_blank"
            rel="noreferrer"
            className="w-fit border-b border-ink pb-0.5 text-[13px] hover:border-primary hover:text-primary"
          >
            Want it in another glaze or size? Ask us
          </a>
        )}

        <p className="text-[13px] text-muted-foreground">
          {freeShippingAbove !== null
            ? `Packed by hand in Sangli, free shipping above ${formatInr(freeShippingAbove)}.`
            : "Packed by hand in Sangli and shipped across India."}
        </p>
      </div>
    </div>
  );
}
