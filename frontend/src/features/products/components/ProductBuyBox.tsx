import { Heart } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";

import { toFreeShippingThreshold } from "@/features/cart/types";
import { GlazeChip } from "@/features/products/components/GlazeChip";
import { PriceTag } from "@/features/products/components/PriceTag";
import { QuantityStepper } from "@/features/products/components/QuantityStepper";
import { StockBadge } from "@/features/products/components/StockBadge";
import {
  STUDIO_NOTE,
  type StockTone,
  toAddToCartLabel,
  toQuantityTotalLine,
} from "@/features/products/types";
import { WhatsAppLink } from "@/components/whatsapp/WhatsAppLink";

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
  // Lets the page tell when the buttons themselves have scrolled away.
  actionsRef?: React.Ref<HTMLDivElement>;
  addToCartRef?: React.Ref<HTMLButtonElement>;
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
  actionsRef,
  addToCartRef,
}: ProductBuyBoxProps) {
  const isSoldOut = stockTone === "sold_out";
  const totalLine = isSoldOut
    ? null
    : toQuantityTotalLine(quantity, formatInr(unitPrice * quantity));

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
        <h1 className="font-heading text-[34px] leading-[1.05] tracking-tight text-balance lg:text-5xl">
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
        <div className="flex flex-col gap-2">
          {/* Stepper, heart, button in the DOM and on screen; under 340px the button takes its own line. */}
          <div
            ref={actionsRef}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-2 min-[340px]:flex"
          >
            {!isSoldOut && (
              <QuantityStepper
                value={quantity}
                max={maxQuantity}
                onChange={onQuantityChange}
              />
            )}
            <Button
              variant="outline"
              size="icon-lg"
              className={cn(
                "col-start-3 shrink-0",
                isWishlisted && "bg-ink text-white",
              )}
              onClick={onToggleWishlist}
              aria-pressed={isWishlisted}
              aria-label={
                isWishlisted
                  ? "Remove from saved pieces"
                  : "Add to saved pieces"
              }
            >
              <Heart
                className={cn("size-5", isWishlisted && "fill-current")}
                strokeWidth={1.5}
              />
            </Button>
            <Button
              ref={addToCartRef}
              size="lg"
              className="col-span-3 px-4 min-[340px]:min-w-32 min-[340px]:flex-1"
              onClick={onAddToCart}
              disabled={!canAddToCart || isAddingToCart || isSoldOut}
            >
              {isSoldOut
                ? "Sold out"
                : isAddingToCart
                  ? "Adding…"
                  : toAddToCartLabel(quantity)}
            </Button>
          </div>

          {totalLine && (
            <p className="text-[13px] text-muted-foreground tnum">
              {totalLine}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 text-[13px] text-muted-foreground">
          <p>{STUDIO_NOTE}</p>
          <p>
            {freeShippingAbove !== null
              ? `Packed by hand in Sangli, free shipping ${toFreeShippingThreshold(freeShippingAbove, formatInr)}.`
              : "Packed by hand in Sangli and shipped across India."}
          </p>
        </div>

        {askUrl && (
          <WhatsAppLink
            href={askUrl}
            kind="glaze-ask"
            className="w-fit border-b border-ink pb-0.5 text-[13px] hover:border-primary hover:text-primary"
          >
            Want it in another glaze or size? Ask us
          </WhatsAppLink>
        )}
      </div>
    </div>
  );
}
