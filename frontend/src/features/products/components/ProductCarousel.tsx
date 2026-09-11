"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Children, useCallback, useEffect, useState } from "react";

export interface ProductCarouselProps {
  title: string;
  eyebrow?: string;
  viewAllHref?: string;
  children: React.ReactNode;
}

export function ProductCarousel({
  title,
  eyebrow,
  viewAllHref,
  children,
}: ProductCarouselProps) {
  const [emblaRef, embla] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (!embla) return;
    const update = () => {
      setCanPrev(embla.canScrollPrev());
      setCanNext(embla.canScrollNext());
    };
    update();
    embla.on("select", update).on("reInit", update);
    return () => {
      embla.off("select", update).off("reInit", update);
    };
  }, [embla]);

  const scrollPrev = useCallback(() => embla?.scrollPrev(), [embla]);
  const scrollNext = useCallback(() => embla?.scrollNext(), [embla]);
  const arrowClass =
    "flex size-10 items-center justify-center rounded-full bg-primary-light transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-30";

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          {eyebrow && (
            <p className="text-xs font-semibold tracking-[0.14em] text-terracotta-dark uppercase">
              {eyebrow}
            </p>
          )}
          <h2 className="font-heading text-2xl md:text-4xl">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              View all
            </Link>
          )}
          <div className="hidden gap-1 md:flex">
            <button
              type="button"
              onClick={scrollPrev}
              disabled={!canPrev}
              aria-label="Previous"
              className={arrowClass}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              disabled={!canNext}
              aria-label="Next"
              className={arrowClass}
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </div>
      <div
        ref={emblaRef}
        className="-mx-4 overflow-hidden px-4 md:mx-0 md:px-0"
      >
        <div className="flex gap-3 md:gap-5">
          {Children.map(children, (child) => (
            <div className="min-w-0 flex-[0_0_62%] sm:flex-[0_0_42%] md:flex-[0_0_31%] xl:flex-[0_0_23%]">
              {child}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
