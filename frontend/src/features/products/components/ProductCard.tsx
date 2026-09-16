"use client";

import { ArrowUpRight, Heart, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";

import { toPotteryIconKind } from "@/components/icons/pottery";
import { PlaceholderImage } from "@/components/media/PlaceholderImage";
import { useImageCarousel } from "@/components/media/useImageCarousel";
import { cn } from "@/lib/utils";

import { GlazeSwatch } from "@/features/products/components/GlazeSwatch";
import { PriceTag } from "@/features/products/components/PriceTag";
import {
  type StockTone,
  toCardStatusLine,
  toPhotoAlt,
  toPhotoLabel,
} from "@/features/products/types";

export interface ProductCardProps {
  href: string;
  name: string;
  imageUrls: string[];
  price: number;
  compareAtPrice: number | null;
  stockTone: StockTone;
  stockLabel: string;
  glazeName?: string | null;
  glazeColor?: string | null;
  isWishlisted: boolean;
  isSecond?: boolean;
  isCustomizable?: boolean;
  isAddingToCart?: boolean;
  isPriority?: boolean;
  isEager?: boolean;
  onToggleWishlist?: () => void;
  onAddToCart?: () => void;
}

const SIZES = "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 50vw";
const OVERLAY_BUTTON =
  "z-20 flex size-9 items-center justify-center border border-ink bg-white text-ink transition-[color,background-color,opacity] duration-200 ease-out hover:bg-ink hover:text-white lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100";

// Image first, then one line of name and price. Made-to-order pieces link to their options instead of adding blind.
export function ProductCard({
  href,
  name,
  imageUrls,
  price,
  compareAtPrice,
  stockTone,
  stockLabel,
  glazeName = null,
  glazeColor = null,
  isWishlisted,
  isSecond = false,
  isCustomizable = false,
  isAddingToCart = false,
  isPriority = false,
  isEager = false,
  onToggleWishlist,
  onAddToCart,
}: ProductCardProps) {
  const { carouselRef, selectedIndex, scrollTo } = useImageCarousel();
  const [hasPickedPhoto, setHasPickedPhoto] = useState(false);
  const handlePickPhoto = useCallback(
    (index: number) => {
      setHasPickedPhoto(true);
      scrollTo(index);
    },
    [scrollTo],
  );
  const isSoldOut = stockTone === "sold_out";
  const hasMany = imageUrls.length > 1;
  const hoverImageUrl = imageUrls[1] ?? null;
  // The old hover crossfade still reads on desktop, but only from the first photo and
  // only until someone picks a photo by hand — after that the choice wins over the hover.
  // Both images stay mounted so turning it off fades them across instead of flashing white.
  const isHoverFade =
    !hasPickedPhoto && selectedIndex === 0 && hoverImageUrl !== null;

  return (
    <article className="group flex flex-col gap-2.5">
      <div className="relative aspect-square bg-white">
        {imageUrls.length === 0 ? (
          <Link
            href={href}
            className="absolute inset-0 overflow-hidden outline-none focus-visible:ring-1 focus-visible:ring-ink"
          >
            <PlaceholderImage kind={toPotteryIconKind(name)} />
          </Link>
        ) : (
          <div
            ref={hasMany ? carouselRef : undefined}
            className="absolute inset-0 overflow-hidden"
            role={hasMany ? "group" : undefined}
            aria-roledescription={hasMany ? "carousel" : undefined}
            aria-label={hasMany ? `${name} photos` : undefined}
          >
            <div className="flex h-full">
              {imageUrls.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="relative h-full min-w-0 flex-[0_0_100%]"
                >
                  <Image
                    src={url}
                    alt={toPhotoAlt(name, index)}
                    fill
                    loading={isEager && index === 0 ? "eager" : undefined}
                    fetchPriority={
                      isPriority && index === 0 ? "high" : undefined
                    }
                    sizes={SIZES}
                    className={cn(
                      "photo-zoom object-cover transition-opacity duration-500 ease-out",
                      index === 0 &&
                        isHoverFade &&
                        "group-focus-within:opacity-0 group-hover:opacity-0",
                    )}
                  />
                  {index === 0 && hoverImageUrl && (
                    <Image
                      src={hoverImageUrl}
                      alt=""
                      fill
                      sizes={SIZES}
                      className={cn(
                        "photo-zoom object-cover opacity-0 transition-opacity duration-500 ease-out",
                        isHoverFade &&
                          "group-focus-within:opacity-100 group-hover:opacity-100",
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
            {/* Sits inside the carousel so embla can swallow the click that ends a drag. */}
            <Link
              href={href}
              aria-label={name}
              className="absolute inset-0 z-10 outline-none focus-visible:ring-1 focus-visible:ring-ink"
            />
          </div>
        )}

        {hasMany && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center">
            {imageUrls.map((url, index) => (
              <button
                key={`${url}-${index}`}
                type="button"
                onClick={() => handlePickPhoto(index)}
                aria-label={toPhotoLabel(index, imageUrls.length)}
                aria-current={index === selectedIndex}
                className="pointer-events-auto p-1.5"
              >
                <span
                  className={cn(
                    "block size-[3px]",
                    index === selectedIndex ? "bg-ink" : "bg-ash",
                  )}
                />
              </button>
            ))}
          </div>
        )}

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
            // The heart is how a phone fills the wishlist, so it only fades at rest
            // where there is a hover to bring it back.
            className={cn(
              OVERLAY_BUTTON,
              "absolute top-2 right-2",
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

      {/* Two lines kept for the name and one for the stock line, so a short name and a
          missing stock line leave a card the same height as every other one. */}
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex min-h-10 items-start justify-between gap-3">
          <span className="flex min-w-0 items-start gap-2">
            {glazeColor && (
              <GlazeSwatch
                name={glazeName ?? name}
                colorCode={glazeColor}
                size="sm"
                className="mt-1 border border-ink/15"
              />
            )}
            <Link
              href={href}
              className="min-w-0 text-sm leading-snug break-words underline-offset-4 hover:underline"
            >
              {name}
            </Link>
          </span>
          <PriceTag price={price} compareAtPrice={compareAtPrice} />
        </div>
        <p
          className={cn(
            "min-h-5 text-[13px]",
            stockTone === "made_to_order"
              ? "text-primary"
              : "text-muted-foreground",
          )}
        >
          {toCardStatusLine(isSecond, stockTone, stockLabel)}
        </p>
      </div>
    </article>
  );
}
