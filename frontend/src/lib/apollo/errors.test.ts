import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { describe, expect, it } from "vitest";

import { isNotFoundError } from "./errors";

function apiError(statusCode: number): CombinedGraphQLErrors {
  return new CombinedGraphQLErrors({
    errors: [
      { message: "Not Found", extensions: { originalError: { statusCode } } },
    ],
  });
}

describe("isNotFoundError", () => {
  it("reads the 404 Nest wrapped inside the GraphQL error", () => {
    expect(isNotFoundError(apiError(404))).toBe(true);
  });

  it("leaves every other failure alone", () => {
    expect(isNotFoundError(apiError(500))).toBe(false);
    expect(isNotFoundError(new Error("fetch failed"))).toBe(false);
    expect(isNotFoundError(null)).toBe(false);
  });
});
