"use client";

import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { Children, useCallback, useEffect, useRef, useState } from "react";

import { toRevealDelay } from "@/components/motion/stagger";

export interface ProductCarouselProps {
  title: string;
  eyebrow?: string;
  viewAllHref?: string;
  children: React.ReactNode;
}

const ARROW_CLASS =
  "hidden size-8 items-center justify-center border border-ash text-sm leading-none transition-colors duration-200 ease-out hover:border-ink hover:bg-ink hover:text-white disabled:opacity-30 disabled:hover:border-ash disabled:hover:bg-transparent disabled:hover:text-inherit md:flex";

export function ProductCarousel({
  title,
  eyebrow,
  viewAllHref,
  children,
}: ProductCarouselProps) {
  const [emblaRef, embla] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    // Both shelves listen on their own root, so a swipe started on a card's photos
    // would otherwise drag the shelf underneath it as well.
    watchDrag: (_api, event) =>
      !(
        event.target instanceof Element &&
        event.target.closest('[aria-roledescription="carousel"]')
      ),
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  // Held in a ref so a motion preference change never forces a re-render mid-drag.
  const isReducedMotion = useRef(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    isReducedMotion.current = query.matches;
    const handleChange = (event: MediaQueryListEvent) => {
      isReducedMotion.current = event.matches;
    };
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

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

  // Passing jump=true skips the easing, which is what reduced motion asks for.
  const scrollPrev = useCallback(
    () => embla?.scrollPrev(isReducedMotion.current),
    [embla],
  );
  const scrollNext = useCallback(
    () => embla?.scrollNext(isReducedMotion.current),
    [embla],
  );

  return (
    <section className="flex flex-col gap-6">
      <div className="reveal-item flex items-baseline justify-between gap-4">
        <div className="flex flex-col gap-2">
          {eyebrow && (
            <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
              {eyebrow}
            </p>
          )}
          <h2 className="font-heading text-2xl leading-tight tracking-tight md:text-4xl">
            {title}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="link-underline pb-0.5 text-sm hover:text-primary"
            >
              See everything
            </Link>
          )}
          <div className="hidden gap-1 md:flex">
            <button
              type="button"
              onClick={scrollPrev}
              disabled={!canPrev}
              aria-label="Previous pieces"
              className={ARROW_CLASS}
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              onClick={scrollNext}
              disabled={!canNext}
              aria-label="Next pieces"
              className={ARROW_CLASS}
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards sit as far apart as they do on the shop grid, so a price never lands
          beside the next card's name. The arrows and the peeking card say it scrolls. */}
      <div
        ref={emblaRef}
        className="-mx-4 overflow-hidden px-4 md:mx-0 md:px-0"
      >
        <div className="flex gap-3 md:gap-6">
          {Children.map(children, (child, index) => (
            <div
              style={toRevealDelay(index + 1)}
              className="reveal-item min-w-0 flex-[0_0_calc(45.45%-0.41rem)] sm:flex-[0_0_calc(33.333%-0.5rem)] md:flex-[0_0_calc(33.333%-1rem)] lg:flex-[0_0_calc(25%-1.125rem)]"
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
