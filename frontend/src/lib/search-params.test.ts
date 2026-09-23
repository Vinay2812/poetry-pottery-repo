import { describe, expect, it } from "vitest";

import { toUrlSearchParams } from "./search-params";

describe("toUrlSearchParams", () => {
  it("keeps single values, repeats array values and drops missing ones", () => {
    const params = toUrlSearchParams({
      sort: "newest",
      category: ["mugs", "bowls"],
      q: undefined,
    });
    expect(params.get("sort")).toBe("newest");
    expect(params.getAll("category")).toEqual(["mugs", "bowls"]);
    expect(params.has("q")).toBe(false);
  });
});
