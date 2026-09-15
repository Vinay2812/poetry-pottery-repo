import { describe, expect, it } from "vitest";

import { newPublicId, PUBLIC_ID_PATTERN } from "./public-id";

describe("newPublicId", () => {
  it("produces prefixed, unambiguous ids", () => {
    const ids = new Set(Array.from({ length: 200 }, () => newPublicId("PP")));
    expect(ids.size).toBe(200);
    for (const id of ids) {
      expect(id).toMatch(PUBLIC_ID_PATTERN);
      expect(id).not.toMatch(/[01OIL]/);
    }
  });
});
