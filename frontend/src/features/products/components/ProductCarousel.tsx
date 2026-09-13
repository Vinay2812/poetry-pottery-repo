"use client";

import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { Children, useCallback, useEffect, useRef, useState } from "react";

export interface ProductCarouselProps {
  title: string;
  eyebrow?: string;
  viewAllHref?: string;
  children: React.ReactNode;
}

const ARROW_CLASS =
  "hidden size-8 items-center justify-center border border-ash text-sm leading-none transition-colors hover:border-ink disabled:opacity-30 disabled:hover:border-ash md:flex";

export function ProductCarousel({
  title,
  eyebrow,
  viewAllHref,
  children,
}: ProductCarouselProps) {
  const [emblaRef, embla] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [progress, setProgress] = useState(0);
  const [snapCount, setSnapCount] = useState(1);
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
      setSnapCount(Math.max(1, embla.scrollSnapList().length));
      setProgress(Math.min(1, Math.max(0, embla.scrollProgress())));
    };
    update();
    embla.on("select", update).on("reInit", update).on("scroll", update);
    return () => {
      embla.off("select", update).off("reInit", update).off("scroll", update);
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

  const thumbWidth = 100 / snapCount;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between gap-4">
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
              className="border-b border-ink pb-0.5 text-sm hover:border-primary hover:text-primary"
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

      <div className="flex flex-col gap-4">
        <div
          ref={emblaRef}
          className="-mx-4 overflow-hidden px-4 md:mx-0 md:px-0"
        >
          <div className="flex gap-2">
            {Children.map(children, (child) => (
              <div className="min-w-0 flex-[0_0_calc(45.45%-0.28rem)] sm:flex-[0_0_calc(33.333%-0.34rem)] lg:flex-[0_0_calc(25%-0.375rem)]">
                {child}
              </div>
            ))}
          </div>
        </div>
        <div className="h-px w-full bg-ash" aria-hidden="true">
          <div
            className="h-px bg-ink"
            style={{
              width: `${thumbWidth}%`,
              marginLeft: `${progress * (100 - thumbWidth)}%`,
            }}
          />
        </div>
      </div>
    </section>
  );
}
