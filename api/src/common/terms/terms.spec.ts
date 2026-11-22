import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";

import { assertAcceptedTerms, TERMS_REQUIRED } from "./terms";

describe("assertAcceptedTerms", () => {
  it("lets a ticked box through", () => {
    expect(() => assertAcceptedTerms(true)).not.toThrow();
  });

  it.each([false, null, undefined])("refuses %p", (value) => {
    expect(() => assertAcceptedTerms(value)).toThrow(
      new BadRequestException(TERMS_REQUIRED),
    );
  });
});
