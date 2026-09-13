"use client";

import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";

import { MakingPiece } from "@/features/home/components/MakingPiece";
import { MakingPieceDefs } from "@/features/home/components/MakingPieceDefs";
import {
  MAKING_STEP_COUNT,
  MAKING_STEPS,
  toStepNumber,
} from "@/features/home/types";

export interface MakingStoryProps {
  shopHref: string;
  shopLabel: string;
  onMarkerClick: (index: number) => void;
  onMarkerKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
  ref?: React.Ref<HTMLElement>;
}

/**
 * Six making steps in one band. Which one is showing is decided entirely in
 * CSS from the `data-step` attribute the container writes, so nothing here
 * re-renders while the page scrolls. Without that attribute — no JS, narrow
 * screens, reduced motion — all six render stacked and fully drawn.
 */
export function MakingStory({
  shopHref,
  shopLabel,
  onMarkerClick,
  onMarkerKeyDown,
  ref,
}: MakingStoryProps) {
  const lastIndex = MAKING_STEP_COUNT - 1;

  return (
    <section
      ref={ref}
      aria-labelledby="making-story-heading"
      className="story-wrapper border-t border-ash"
    >
      <h2 id="making-story-heading" className="sr-only">
        How a piece is made
      </h2>

      <MakingPieceDefs />

      <div className="story-band">
        <div className="story-steps">
          {MAKING_STEPS.map((step, index) => (
            <Reveal key={step.id} className="story-step">
              <div className="story-panel">
                <div className="story-piece">
                  <MakingPiece step={index} />
                </div>

                <div className="story-copy">
                  <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                    {toStepNumber(index)}
                    <span className="story-total">
                      {" "}
                      / {toStepNumber(lastIndex)}
                    </span>
                    <span aria-hidden="true"> — </span>
                    How a piece is made
                  </p>

                  <h3 className="font-heading text-[26px] leading-[1.1] tracking-tight text-balance md:text-[40px]">
                    {step.title}
                  </h3>

                  {step.body && (
                    <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>
                  )}

                  {step.value && (
                    <p className="text-[11px] tracking-[0.18em] text-sage uppercase">
                      {step.value}
                    </p>
                  )}

                  {index === lastIndex && (
                    <Link
                      href={shopHref}
                      className="w-fit border-b border-ink pb-0.5 text-sm hover:border-primary hover:text-primary"
                    >
                      {shopLabel}
                    </Link>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div
          role="group"
          aria-label="Making steps"
          className="story-markers"
          onKeyDown={onMarkerKeyDown}
        >
          {MAKING_STEPS.map((step, index) => (
            <button
              key={step.id}
              type="button"
              data-marker={index}
              className="story-marker"
              aria-label={`Step ${toStepNumber(index)}: ${step.title}`}
              onClick={() => onMarkerClick(index)}
            >
              <span className="story-dot" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
