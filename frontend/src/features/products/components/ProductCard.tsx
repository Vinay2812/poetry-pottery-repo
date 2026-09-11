import { Heart, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { GlazeChip } from "@/features/products/components/GlazeChip";
import { PriceTag } from "@/features/products/components/PriceTag";
import type { StockTone } from "@/features/products/types";

export interface ProductCardProps {
  href: string;
  name: string;
  imageUrl: string | null;
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
  isAddingToCart?: boolean;
  isPriority?: boolean;
  onToggleWishlist?: () => void;
  onAddToCart?: () => void;
}

export function ProductCard({
  href,
  name,
  imageUrl,
  price,
  compareAtPrice,
  discountPercent,
  material,
  colorName,
  colorCode,
  stockTone,
  stockLabel,
  ratingAvg,
  ratingCount,
  isWishlisted,
  isAddingToCart = false,
  isPriority = false,
  onToggleWishlist,
  onAddToCart,
}: ProductCardProps) {
  const isSoldOut = stockTone === "sold_out";
  const badge =
    stockTone === "sold_out" ||
    stockTone === "low" ||
    stockTone === "made_to_order"
      ? stockLabel
      : discountPercent !== null
        ? `−${discountPercent}%`
        : null;

  return (
    <article className="group relative flex flex-col gap-2.5">
      <Link
        href={href}
        className="relative block aspect-square overflow-hidden rounded-2xl bg-primary-light shadow-soft transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-card"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            priority={isPriority}
            sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, 50vw"
            className={cn(
              "object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]",
              isSoldOut && "opacity-70 grayscale-[30%]",
            )}
          />
        ) : (
          <span className="flex h-full items-center justify-center font-script text-2xl text-clay-dark italic">
            No photo yet
          </span>
        )}
        {badge && (
          <span
            className={cn(
              "absolute top-2.5 left-2.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide backdrop-blur-sm",
              stockTone === "sold_out" && "bg-neutral-800/85 text-white",
              stockTone === "low" && "bg-terracotta/95 text-white",
              stockTone === "made_to_order" && "bg-cream/95 text-clay-dark",
              stockTone === "in_stock" &&
                "bg-primary/95 text-primary-foreground",
            )}
          >
            {badge}
          </span>
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
          className="absolute top-2.5 right-2.5 flex size-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-soft backdrop-blur-sm transition-transform active:scale-90"
        >
          <Heart
            className={cn(
              "size-4 transition-colors",
              isWishlisted && "fill-terracotta text-terracotta",
            )}
          />
        </button>
      )}

      <div className="flex min-w-0 flex-col gap-1 px-0.5">
        <Link
          href={href}
          className="line-clamp-2 text-sm leading-snug font-medium"
        >
          {name}
        </Link>
        <GlazeChip
          colorCode={colorCode}
          colorName={colorName}
          material={material}
        />
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <PriceTag price={price} compareAtPrice={compareAtPrice} />
          {ratingCount > 0 && (
            <span className="text-xs text-muted-foreground">
              <span aria-hidden="true">★</span> {ratingAvg.toFixed(1)}
              <span className="sr-only"> stars from</span> ({ratingCount})
            </span>
          )}
        </div>
      </div>

      {onAddToCart && !isSoldOut && (
        <button
          type="button"
          onClick={onAddToCart}
          disabled={isAddingToCart}
          aria-label={`Add ${name} to cart`}
          className="absolute right-2.5 bottom-[4.5rem] flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover active:scale-90 disabled:opacity-60 lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:focus-visible:translate-y-0 lg:focus-visible:opacity-100"
        >
          <Plus className="size-5" />
        </button>
      )}
    </article>
  );
}
