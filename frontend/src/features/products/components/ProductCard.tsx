import { ArrowUpRight, Heart, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { toPotteryIconKind } from "@/components/icons/pottery";
import { PlaceholderImage } from "@/components/media/PlaceholderImage";
import { cn } from "@/lib/utils";

import { PriceTag } from "@/features/products/components/PriceTag";
import type { StockTone } from "@/features/products/types";

export interface ProductCardProps {
  href: string;
  name: string;
  imageUrl: string | null;
  secondImageUrl?: string | null;
  price: number;
  compareAtPrice: number | null;
  discountPercent: number | null;
  material: string;
  colorName: string | null;
  colorCode: string | null;
  stockTone: StockTone;
  stockLabel: string;
  ratingAvg: number;
  ratingCount: number;
  isWishlisted: boolean;
  isCustomizable?: boolean;
  isAddingToCart?: boolean;
  isPriority?: boolean;
  onToggleWishlist?: () => void;
  onAddToCart?: () => void;
}

const SIZES = "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 50vw";
const OVERLAY_BUTTON =
  "flex size-9 items-center justify-center border border-ink bg-white text-ink transition-opacity duration-200 hover:bg-ink hover:text-white lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100";

// Image first, then one line of name and price. Made-to-order pieces link to their options instead of adding blind.
export function ProductCard({
  href,
  name,
  imageUrl,
  secondImageUrl = null,
  price,
  compareAtPrice,
  stockTone,
  stockLabel,
  isWishlisted,
  isCustomizable = false,
  isAddingToCart = false,
  isPriority = false,
  onToggleWishlist,
  onAddToCart,
}: ProductCardProps) {
  const isSoldOut = stockTone === "sold_out";

  return (
    <article className="group flex flex-col gap-2.5">
      <div className="relative aspect-square bg-white">
        <Link
          href={href}
          className="absolute inset-0 overflow-hidden outline-none focus-visible:ring-1 focus-visible:ring-ink"
        >
          {imageUrl ? (
            <>
              <Image
                src={imageUrl}
                alt={name}
                fill
                priority={isPriority}
                sizes={SIZES}
                className={cn(
                  "object-cover transition-opacity duration-500 ease-out",
                  secondImageUrl &&
                    "group-focus-within:opacity-0 group-hover:opacity-0",
                )}
              />
              {secondImageUrl && (
                <Image
                  src={secondImageUrl}
                  alt=""
                  fill
                  sizes={SIZES}
                  className="object-cover opacity-0 transition-opacity duration-500 ease-out group-focus-within:opacity-100 group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <PlaceholderImage kind={toPotteryIconKind(name)} />
          )}
        </Link>

        {onToggleWishlist && (
          <button
            type="button"
            onClick={onToggleWishlist}
            aria-pressed={isWishlisted}
            aria-label={
              isWishlisted
                ? `Remove ${name} from wishlist`
                : `Save ${name} to wishlist`
            }
            className={cn(
              OVERLAY_BUTTON,
              "absolute top-2 right-2 hidden lg:flex",
              isWishlisted && "lg:opacity-100",
            )}
          >
            <Heart
              className={cn("size-4", isWishlisted && "fill-current")}
              strokeWidth={1.5}
            />
          </button>
        )}

        {isCustomizable ? (
          <Link
            href={href}
            aria-label={`Choose options for ${name}`}
            className={cn(OVERLAY_BUTTON, "absolute right-2 bottom-2")}
          >
            <ArrowUpRight className="size-4" strokeWidth={1.5} />
          </Link>
        ) : onAddToCart && !isSoldOut ? (
          <button
            type="button"
            onClick={onAddToCart}
            disabled={isAddingToCart}
            aria-label={`Add ${name} to cart`}
            className={cn(
              OVERLAY_BUTTON,
              "absolute right-2 bottom-2 disabled:opacity-50",
            )}
          >
            <Plus className="size-4" strokeWidth={1.5} />
          </button>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={href}
            className="line-clamp-2 min-w-0 text-sm leading-snug underline-offset-4 hover:underline"
          >
            {name}
          </Link>
          <PriceTag price={price} compareAtPrice={compareAtPrice} />
        </div>
        {stockTone !== "in_stock" && (
          <p
            className={cn(
              "text-[13px]",
              stockTone === "made_to_order"
                ? "text-primary"
                : "text-muted-foreground",
            )}
          >
            {stockLabel}
          </p>
        )}
      </div>
    </article>
  );
}
