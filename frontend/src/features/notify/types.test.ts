import { describe, expect, it } from "vitest";

import { applyNotifyResult, canWatchPiece, IDLE_NOTIFY } from "./types";

describe("canWatchPiece", () => {
  it("offers the form on a listed piece that has sold out", () => {
    expect(canWatchPiece(0, false, true)).toBe(true);
  });

  it("stays away from a piece the studio has taken down", () => {
    expect(canWatchPiece(0, false, false)).toBe(false);
  });

  it("stays away from a piece that can be bought or thrown to order", () => {
    expect(canWatchPiece(3, false, true)).toBe(false);
    expect(canWatchPiece(0, true, true)).toBe(false);
  });
});

describe("applyNotifyResult", () => {
  it("swaps the current answer for the pending one", () => {
    expect(
      applyNotifyResult(IDLE_NOTIFY, { state: "waiting", message: "On it" }),
    ).toEqual({ state: "waiting", message: "On it" });
  });
});
