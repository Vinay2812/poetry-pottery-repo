"use client";

import { useCallback, useEffect, useRef } from "react";

import { MakingStory } from "@/features/home/components/MakingStory";
import {
  toArrowStep,
  toStepIndex,
  toStepScrollTop,
  toStoryProgress,
} from "@/features/home/types";

export interface MakingStoryContainerProps {
  shopHref: string;
  shopLabel: string;
}

const WIDE = "(min-width: 768px)";
const REDUCED = "(prefers-reduced-motion: reduce)";

/**
 * Turns scroll position into one `data-step` attribute on the document root.
 * Nothing here touches React state, so a scroll through the band costs one
 * rAF read and one attribute write per step change.
 */
export function MakingStoryContainer({
  shopHref,
  shopLabel,
}: MakingStoryContainerProps) {
  const rootRef = useRef<HTMLElement>(null);
  const stepRef = useRef(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const documentRoot = document.documentElement;
    const steps = Array.from(root.querySelectorAll<HTMLElement>(".story-step"));
    const pieces = Array.from(
      root.querySelectorAll<HTMLElement>(".story-piece"),
    );
    const markers = Array.from(
      root.querySelectorAll<HTMLElement>(".story-marker"),
    );
    const wideQuery = window.matchMedia(WIDE);
    const motionQuery = window.matchMedia(REDUCED);

    let frame = 0;
    let isQueued = false;
    let isListening = false;
    let observer: IntersectionObserver | null = null;

    const applyStep = (next: number) => {
      if (documentRoot.dataset.step === String(next)) return;
      stepRef.current = next;
      documentRoot.dataset.step = String(next);
      steps.forEach((step, index) => {
        const isActive = index === next;
        step.toggleAttribute("inert", !isActive);
        step.setAttribute("aria-hidden", isActive ? "false" : "true");
      });
      markers.forEach((marker, index) => {
        if (index === next) marker.setAttribute("aria-current", "step");
        else marker.removeAttribute("aria-current");
      });
      // Marks the layer drawn so its strokes animate once and never replay.
      pieces[next]?.setAttribute("data-drawn", "");
    };

    const measure = () => {
      isQueued = false;
      const rect = root.getBoundingClientRect();
      applyStep(
        toStepIndex(toStoryProgress(rect.top, rect.height, window.innerHeight)),
      );
    };

    const handleScroll = () => {
      if (isQueued) return;
      isQueued = true;
      frame = requestAnimationFrame(measure);
    };

    const listen = (isOnScreen: boolean) => {
      if (isOnScreen === isListening) return;
      isListening = isOnScreen;
      if (isOnScreen) {
        window.addEventListener("scroll", handleScroll, { passive: true });
        root.setAttribute("data-live", "");
        measure();
      } else {
        window.removeEventListener("scroll", handleScroll);
        root.removeAttribute("data-live");
      }
    };

    const enable = () => {
      if (observer) return;
      observer = new IntersectionObserver(
        (entries) => listen(entries.some((entry) => entry.isIntersecting)),
        { rootMargin: "0px" },
      );
      observer.observe(root);
      measure();
    };

    const disable = () => {
      observer?.disconnect();
      observer = null;
      listen(false);
      cancelAnimationFrame(frame);
      isQueued = false;
      stepRef.current = 0;
      delete documentRoot.dataset.step;
      steps.forEach((step) => {
        step.removeAttribute("inert");
        step.removeAttribute("aria-hidden");
      });
      markers.forEach((marker) => marker.removeAttribute("aria-current"));
    };

    // Pinning is opt-in: wide viewport, motion allowed, re-checked on change.
    const sync = () => {
      if (wideQuery.matches && !motionQuery.matches) enable();
      else disable();
    };

    sync();
    wideQuery.addEventListener("change", sync);
    motionQuery.addEventListener("change", sync);
    return () => {
      wideQuery.removeEventListener("change", sync);
      motionQuery.removeEventListener("change", sync);
      disable();
    };
  }, []);

  const scrollToStep = useCallback((index: number) => {
    const root = rootRef.current;
    if (!root) return;
    const wrapperTop = window.scrollY + root.getBoundingClientRect().top;
    window.scrollTo({
      top: toStepScrollTop(wrapperTop, index, window.innerHeight),
      behavior: window.matchMedia(REDUCED).matches ? "auto" : "smooth",
    });
  }, []);

  const handleMarkerKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      const next = toArrowStep(event.key, stepRef.current);
      if (next === stepRef.current) return;
      event.preventDefault();
      scrollToStep(next);
      rootRef.current
        ?.querySelector<HTMLButtonElement>(`[data-marker="${next}"]`)
        ?.focus({ preventScroll: true });
    },
    [scrollToStep],
  );

  return (
    <MakingStory
      ref={rootRef}
      shopHref={shopHref}
      shopLabel={shopLabel}
      onMarkerClick={scrollToStep}
      onMarkerKeyDown={handleMarkerKeyDown}
    />
  );
}
