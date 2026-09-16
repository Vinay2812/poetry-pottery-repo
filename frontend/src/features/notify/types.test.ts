import { describe, expect, it } from "vitest";

import { applyNotifyResult, canWatchPiece, IDLE_NOTIFY } from "./types";

describe("canWatchPiece", () => {
  it("offers the form on a piece that has sold out", () => {
    expect(canWatchPiece(0, false, false)).toBe(true);
  });

  it("offers it on an archived piece whatever its stock reads", () => {
    expect(canWatchPiece(4, false, true)).toBe(true);
  });

  it("stays away from a piece that can be bought or thrown to order", () => {
    expect(canWatchPiece(3, false, false)).toBe(false);
    expect(canWatchPiece(0, true, false)).toBe(false);
  });
});

describe("applyNotifyResult", () => {
  it("swaps the current answer for the pending one", () => {
    expect(
      applyNotifyResult(IDLE_NOTIFY, { state: "waiting", message: "On it" }),
    ).toEqual({ state: "waiting", message: "On it" });
  });
});
