import { beforeEach, describe, expect, it, vi } from "vitest";

import { getArchiveProducts, getArchiveWall } from "./catalog";

const query = vi.fn();

vi.mock("@/lib/apollo/rsc-client", () => ({
  getClient: () => ({ query }),
}));

beforeEach(() => {
  query.mockReset();
});

function page(
  items: { id: number }[],
  hasMore: boolean,
): { data: { products: unknown } } {
  return {
    data: {
      products: {
        items,
        page_info: { total: 120, page: 1, limit: 60, has_more: hasMore },
      },
    },
  };
}

describe("getArchiveWall", () => {
  it("walks the pages until the archive runs out", async () => {
    query
      .mockResolvedValueOnce(page([{ id: 1 }], true))
      .mockResolvedValueOnce(page([{ id: 2 }], false));

    const wall = await getArchiveWall();

    expect(query).toHaveBeenCalledTimes(2);
    expect(wall.items).toHaveLength(2);
  });

  it("counts what reached the wall, not what the API says it holds", async () => {
    query.mockResolvedValue(page([{ id: 1 }], true));

    const wall = await getArchiveWall();

    // Ten pages is the cap; the header must not promise pieces the wall never rendered.
    expect(query).toHaveBeenCalledTimes(10);
    expect(wall.page_info.total).toBe(wall.items.length);
  });
});

describe("getArchiveProducts", () => {
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
