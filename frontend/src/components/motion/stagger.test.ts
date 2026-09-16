import { describe, expect, it } from "vitest";

import { toRevealDelay } from "./stagger";

describe("toRevealDelay", () => {
  it("steps by 40ms per card", () => {
    expect(toRevealDelay(0)).toEqual({ "--reveal-delay": "0ms" });
    expect(toRevealDelay(1)).toEqual({ "--reveal-delay": "40ms" });
    expect(toRevealDelay(7)).toEqual({ "--reveal-delay": "280ms" });
  });

  it("caps at the eighth card", () => {
    expect(toRevealDelay(8)).toEqual({ "--reveal-delay": "280ms" });
    expect(toRevealDelay(99)).toEqual({ "--reveal-delay": "280ms" });
  });

  it("treats anything before the first card as the first card", () => {
    expect(toRevealDelay(-3)).toEqual({ "--reveal-delay": "0ms" });
  });

  it("rounds a fractional index down to the card it sits on", () => {
    expect(toRevealDelay(2.9)).toEqual({ "--reveal-delay": "80ms" });
  });
});
