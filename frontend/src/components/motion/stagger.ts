import type { CSSProperties } from "react";

const STEP_MS = 40;
// Capped at eight so the fourth row of a grid never waits on the first three.
const MAX_STEP = 7;

export function toRevealDelay(index: number): CSSProperties {
  const step = Math.min(Math.max(Math.trunc(index), 0), MAX_STEP);
  return { "--reveal-delay": `${step * STEP_MS}ms` } as CSSProperties;
}
