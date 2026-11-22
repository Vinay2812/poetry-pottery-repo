import { describe, expect, it } from "vitest";

import { TERMS_REQUIRED, toTermsError } from "./terms";

describe("toTermsError", () => {
  it("stays quiet until the shopper tries to submit", () => {
    expect(toTermsError(false, false)).toBeNull();
  });

  it("asks for the tick after a submit without it", () => {
    expect(toTermsError(false, true)).toBe(TERMS_REQUIRED);
  });

  it("clears once the box is ticked", () => {
    expect(toTermsError(true, true)).toBeNull();
  });
});
