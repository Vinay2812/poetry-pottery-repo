import { beforeEach, describe, expect, it, vi } from "vitest";

import { getArchiveProducts } from "./catalog";

const query = vi.fn();

vi.mock("@/lib/apollo/rsc-client", () => ({
  getClient: () => ({ query }),
}));

describe("getArchiveProducts", () => {
  beforeEach(() => {
    query.mockReset();
  });

  it("hands the 404 page whatever the archive returned", async () => {
    const items = [{ id: 1 }];
    query.mockResolvedValue({ data: { products: { items } } });

    await expect(getArchiveProducts(4)).resolves.toEqual(items);
  });

  it("returns nothing when the API cannot be reached", async () => {
    // The 404 must stay a 404 even with the API down, so a rejected fetch cannot escape.
    query.mockRejectedValue(new Error("fetch failed"));

    await expect(getArchiveProducts(4)).resolves.toEqual([]);
  });
});
