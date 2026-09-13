import { describe, expect, it } from "vitest";

import {
  MAKING_STEPS,
  clamp,
  toArrowStep,
  toStepIndex,
  toStepNumber,
  toStepScrollTop,
  toStoryProgress,
} from "./types";

describe("clamp", () => {
  it("holds a value between its bounds", () => {
    expect(clamp(5, 0, 1)).toBe(1);
    expect(clamp(-5, 0, 1)).toBe(0);
    expect(clamp(0.4, 0, 1)).toBe(0.4);
  });
});

describe("toStoryProgress", () => {
  it("is zero before the band starts moving", () => {
    expect(toStoryProgress(0, 6000, 1000)).toBe(0);
  });

  it("is one once the band has been scrolled through", () => {
    expect(toStoryProgress(-5000, 6000, 1000)).toBe(1);
  });

  it("reads the middle of the travel", () => {
    expect(toStoryProgress(-2500, 6000, 1000)).toBe(0.5);
  });

  it("clamps above and below the band", () => {
    expect(toStoryProgress(400, 6000, 1000)).toBe(0);
    expect(toStoryProgress(-9000, 6000, 1000)).toBe(1);
  });

  it("stays at zero when the band is shorter than the viewport", () => {
    expect(toStoryProgress(-100, 800, 1000)).toBe(0);
  });
});

describe("toStepIndex", () => {
  it("splits the travel into one slice per step", () => {
    expect(toStepIndex(0)).toBe(0);
    expect(toStepIndex(0.16)).toBe(0);
    expect(toStepIndex(0.17)).toBe(1);
    expect(toStepIndex(0.5)).toBe(3);
    expect(toStepIndex(0.99)).toBe(5);
  });

  it("never runs past the last step", () => {
    expect(toStepIndex(1)).toBe(MAKING_STEPS.length - 1);
    expect(toStepIndex(4)).toBe(MAKING_STEPS.length - 1);
    expect(toStepIndex(-1)).toBe(0);
  });
});

describe("toStepScrollTop", () => {
  it("parks one viewport further down per step", () => {
    expect(toStepScrollTop(2000, 0, 900)).toBe(2000);
    expect(toStepScrollTop(2000, 3, 900)).toBe(4700);
  });

  it("clamps to the steps that exist", () => {
    expect(toStepScrollTop(0, 9, 900)).toBe(4500);
    expect(toStepScrollTop(0, -2, 900)).toBe(0);
  });
});

describe("toArrowStep", () => {
  it("moves left and right between steps", () => {
    expect(toArrowStep("ArrowRight", 2)).toBe(3);
    expect(toArrowStep("ArrowLeft", 2)).toBe(1);
  });

  it("stops at both ends", () => {
    expect(toArrowStep("ArrowLeft", 0)).toBe(0);
    expect(toArrowStep("ArrowRight", 5)).toBe(5);
  });

  it("leaves other keys to the browser", () => {
    expect(toArrowStep("ArrowDown", 2)).toBe(2);
    expect(toArrowStep("Enter", 2)).toBe(2);
  });
});

describe("toStepNumber", () => {
  it("pads the step number to two digits", () => {
    expect(toStepNumber(0)).toBe("01");
    expect(toStepNumber(5)).toBe("06");
  });
});

describe("MAKING_STEPS", () => {
  it("carries five values and a closing frame", () => {
    expect(MAKING_STEPS).toHaveLength(6);
    expect(MAKING_STEPS.filter((step) => step.value)).toHaveLength(5);
    expect(MAKING_STEPS.at(-1)?.value).toBe("");
  });
});
