"use client";

import useEmblaCarousel, {
  type EmblaViewportRefType,
} from "embla-carousel-react";
import { useCallback, useEffect, useRef, useState } from "react";

type CarouselOptions = NonNullable<Parameters<typeof useEmblaCarousel>[0]>;

export interface ImageCarousel {
  carouselRef: EmblaViewportRefType;
  selectedIndex: number;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
}

const ONE_PER_VIEW: CarouselOptions = {
  align: "start",
  containScroll: "trimSnaps",
};

// One photo per slide, drag and swipe on, no autoplay. Embla itself swallows the
// click that ends a drag, so slides may hold links.
export function useImageCarousel(options?: CarouselOptions): ImageCarousel {
  const [carouselRef, embla] = useEmblaCarousel({
    ...ONE_PER_VIEW,
    ...options,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
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
      setSelectedIndex(embla.selectedScrollSnap());
      setCanScrollPrev(embla.canScrollPrev());
      setCanScrollNext(embla.canScrollNext());
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
  const scrollTo = useCallback(
    (index: number) => embla?.scrollTo(index, isReducedMotion.current),
    [embla],
  );

  return {
    carouselRef,
    selectedIndex,
    canScrollPrev,
    canScrollNext,
    scrollPrev,
    scrollNext,
    scrollTo,
  };
}
