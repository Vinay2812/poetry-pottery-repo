"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";

import { toPotteryIconKind } from "@/components/icons/pottery";
import { PlaceholderImage } from "@/components/media/PlaceholderImage";
import { useImageCarousel } from "@/components/media/useImageCarousel";
import { cn } from "@/lib/utils";

import { toPhotoAlt, toPhotoLabel } from "@/features/products/types";

export interface ProductGalleryProps {
  images: string[];
  name: string;
  overlay?: React.ReactNode;
}

const ARROW_CLASS =
  "absolute top-1/2 z-10 hidden size-8 -translate-y-1/2 items-center justify-center border border-ash bg-white text-sm leading-none text-ink transition-colors hover:border-ink disabled:opacity-30 disabled:hover:border-ash lg:flex";

// Draggable main carousel with a synced thumbnail strip on desktop and dots on mobile.
export function ProductGallery({ images, name, overlay }: ProductGalleryProps) {
  const {
    carouselRef,
    selectedIndex,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
    scrollTo,
  } = useImageCarousel();
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    thumbRefs.current[selectedIndex]?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  }, [selectedIndex]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollNext, scrollPrev],
  );

  if (images.length === 0) {
    return (
      <div className="relative aspect-square bg-white">
        <PlaceholderImage kind={toPotteryIconKind(name)} size="hero" />
        {overlay}
      </div>
    );
  }

  const hasMany = images.length > 1;

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:gap-4">
      <div
        className="relative aspect-square min-w-0 flex-1 bg-white outline-none focus-visible:ring-1 focus-visible:ring-ink"
        role="group"
        aria-roledescription="carousel"
        aria-label={`${name} photos`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <div ref={carouselRef} className="h-full overflow-hidden">
          <div className="flex h-full">
            {images.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="relative h-full min-w-0 flex-[0_0_100%]"
                role="group"
                aria-roledescription="slide"
                aria-label={toPhotoLabel(index, images.length)}
              >
                <Image
                  src={url}
                  alt={toPhotoAlt(name, index)}
                  fill
                  priority={index === 0}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className={cn(
                    "object-cover",
                    index === 0 && "animate-clip-reveal",
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        {overlay}

        {hasMany && (
          <>
            <button
              type="button"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              aria-label="Previous photo"
              className={cn(ARROW_CLASS, "left-2")}
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              onClick={scrollNext}
              disabled={!canScrollNext}
              aria-label="Next photo"
              className={cn(ARROW_CLASS, "right-2")}
            >
              <span aria-hidden="true">→</span>
            </button>
          </>
        )}

        <p className="sr-only" aria-live="polite">
          {toPhotoLabel(selectedIndex, images.length)}
        </p>
      </div>

      {hasMany && (
        <>
          <div className="flex justify-center gap-2 lg:hidden">
            {images.map((url, index) => (
              <button
                key={`${url}-${index}`}
                type="button"
                aria-label={toPhotoLabel(index, images.length)}
                aria-current={index === selectedIndex}
                onClick={() => scrollTo(index)}
                className={cn(
                  "size-1.5",
                  index === selectedIndex ? "bg-ink" : "bg-ash",
                )}
              />
            ))}
          </div>
          <div className="hidden max-h-[560px] flex-col gap-2 overflow-y-auto lg:flex">
            {images.map((url, index) => (
              <button
                key={`${url}-${index}`}
                type="button"
                ref={(node) => {
                  thumbRefs.current[index] = node;
                }}
                aria-label={toPhotoLabel(index, images.length)}
                aria-current={index === selectedIndex}
                onClick={() => scrollTo(index)}
                className={cn(
                  "relative size-16 shrink-0 overflow-hidden bg-white transition-opacity",
                  index === selectedIndex
                    ? "ring-1 ring-ink"
                    : "opacity-60 hover:opacity-100",
                )}
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
