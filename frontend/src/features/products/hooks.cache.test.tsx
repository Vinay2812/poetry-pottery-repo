import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
} from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { ProductsFilterInput } from "@/graphql/generated/graphql";

import { useShelfResults } from "./hooks";
import {
  EMPTY_FILTERS,
  type ProductFilters,
  toFilterInput,
  toFilterKey,
} from "./types";

// A real client and cache over a link whose answers can be delayed, held or failed,
// so the races between first pages, next pages and filter changes play out as in a browser.

const PAGE_SIZE = 24;

function piece(id: number) {
  return {
    __typename: "Product",
    id,
    slug: `piece-${id}`,
    name: `Piece ${id}`,
    price: 500,
    compare_at_price: null,
    material: "Stoneware",
    color_name: null,
    color_code: null,
    glaze: null,
    image_urls: [],
    stock: 4,
    is_active: true,
    is_archived: false,
    is_featured: false,
    is_customizable: false,
    is_second: false,
    rating_avg: 0,
    rating_count: 0,
    collection: null,
  };
}

function range(from: number, count: number): number[] {
  return Array.from({ length: count }, (_, index) => from + index);
}

function page(ids: number[], pageNumber: number, total: number) {
  return {
    __typename: "ProductsResult",
    items: ids.map(piece),
    page_info: {
      __typename: "PageInfo",
      total,
      page: pageNumber,
      limit: PAGE_SIZE,
      has_more: pageNumber * PAGE_SIZE < total,
    },
    facets: {
      __typename: "ProductFacets",
      categories: [],
      collections: [],
      materials: [],
      glazes: [],
      price_min: 0,
      price_max: 900,
      active_count: total,
      archive_count: 0,
      seconds_count: 0,
    },
  };
}

type Page = ReturnType<typeof page>;

interface Answer {
  page: Page;
  delay?: number;
  isHeld?: boolean;
  isFailing?: boolean;
}

function toName(filter: ProductsFilterInput): string {
  const list = filter.search ?? filter.category_slugs?.join(",") ?? "all";
  return `${list} p${filter.page ?? 1}`;
}

function shelfClient(answerFor: (filter: ProductsFilterInput) => Answer) {
  const log: string[] = [];
  const held: (() => void)[] = [];
  const link = new ApolloLink(
    (operation) =>
      new Observable((observer) => {
        const filter = operation.variables.filter as ProductsFilterInput;
        const name = toName(filter);
        const answer = answerFor(filter);
        log.push(`start ${name}`);
        const finish = () => {
          if (answer.isFailing) {
            observer.error(new Error(`${name} failed`));
            return;
          }
          observer.next({ data: { products: answer.page } });
          observer.complete();
        };
        if (answer.isHeld) {
          held.push(finish);
          return;
        }
        const timer = setTimeout(finish, answer.delay ?? 0);
        return () => clearTimeout(timer);
      }),
  );
  return {
    client: new ApolloClient({ link, cache: new InMemoryCache() }),
    log,
    releaseHeld: () => {
      for (const finish of held.splice(0)) finish();
    },
  };
}

const ALL_P1 = page(range(1, 24), 1, 30);
const ALL_P2 = page(range(25, 6), 2, 30);
const MUGS_P1 = page([101, 102], 1, 2);
const SERVER_KEY = toFilterKey(toFilterInput(EMPTY_FILTERS, 1));
const MUGS: ProductFilters = { ...EMPTY_FILTERS, categories: ["mugs"] };

function renderShelf(
  client: ApolloClient,
  initialProducts: Page | null = null,
  initialFilters: ProductFilters = EMPTY_FILTERS,
) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ApolloProvider client={client}>{children}</ApolloProvider>
  );
  return renderHook(
    ({ filters }: { filters: ProductFilters }) =>
      useShelfResults({
        filters,
        initialProducts,
        initialFilterKey: SERVER_KEY,
      }),
    { wrapper, initialProps: { filters: initialFilters } },
  );
}

const pause = (ms: number) =>
  act(() => new Promise<void>((resolve) => setTimeout(resolve, ms)));

let rejections: unknown[] = [];
const onRejection = (reason: unknown) => rejections.push(reason);

beforeEach(() => {
  rejections = [];
  process.on("unhandledRejection", onRejection);
});

afterEach(() => {
  process.off("unhandledRejection", onRejection);
});

describe("useShelfResults against a real cache", () => {
  it("waits for the browser's own first page before asking for the next", async () => {
    const { client, log } = shelfClient((filter) =>
      filter.page === 1
        ? { page: ALL_P1, delay: 80 }
        : { page: ALL_P2, delay: 10 },
    );
    const { result } = renderShelf(client, ALL_P1);

    expect(result.current.phase).toBe("ready");
    expect(result.current.canAskNextPage).toBe(false);
    act(() => result.current.loadMore());
    await pause(20);
    expect(log).toEqual(["start all p1"]);
    expect(result.current.result?.items).toHaveLength(24);

    await waitFor(() => expect(result.current.canAskNextPage).toBe(true));
    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.result?.items).toHaveLength(30));
    expect(log).toEqual(["start all p1", "start all p2"]);
    expect(rejections).toEqual([]);
  });

  it("keeps the loaded cards and offers a retry when a next page fails", async () => {
    const { client } = shelfClient((filter) =>
      filter.page === 1 ? { page: ALL_P1 } : { page: ALL_P2, isFailing: true },
    );
    const { result } = renderShelf(client, ALL_P1);
    await waitFor(() => expect(result.current.canAskNextPage).toBe(true));

    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.hasAppendFailed).toBe(true));

    expect(result.current.result?.items).toHaveLength(24);
    expect(result.current.isNextPageLoading).toBe(false);
    expect(result.current.phase).toBe("ready");
    await pause(10);
    expect(rejections).toEqual([]);
  });

  it("drops a next page that lands under other filters", async () => {
    const { client } = shelfClient((filter) => {
      if (filter.category_slugs?.includes("mugs"))
        return { page: MUGS_P1, delay: 120 };
      return filter.page === 1 ? { page: ALL_P1 } : { page: ALL_P2, delay: 40 };
    });
    const { result, rerender } = renderShelf(client, ALL_P1);
    await waitFor(() => expect(result.current.canAskNextPage).toBe(true));

    act(() => result.current.loadMore());
    rerender({ filters: MUGS });
    expect(result.current.phase).toBe("pending");
    await pause(80);
    // The shelf's page two has landed; the mugs list is still the old one, dimmed.
    expect(result.current.result?.items).toHaveLength(24);

    await waitFor(() =>
      expect(result.current.result?.items.map((item) => item.id)).toEqual([
        101, 102,
      ]),
    );
    rerender({ filters: EMPTY_FILTERS });
    await waitFor(() => expect(result.current.phase).toBe("ready"));
    expect(result.current.result?.items).toHaveLength(24);
  });

  it("never sticks on loading after returning to a search with a page still out", async () => {
    const mugPages = [page(range(1, 24), 1, 60), page(range(25, 24), 2, 60)];
    const bowlPages = [
      page(range(201, 24), 1, 40),
      page(range(225, 16), 2, 40),
    ];
    const { client, log, releaseHeld } = shelfClient((filter) => {
      const pages = filter.search === "bowl" ? bowlPages : mugPages;
      const index = (filter.page ?? 1) - 1;
      const next = pages[index] ?? page([], index + 1, 0);
      return { page: next, isHeld: index > 0 };
    });
    const MUG: ProductFilters = { ...EMPTY_FILTERS, search: "mug" };
    const BOWL: ProductFilters = { ...EMPTY_FILTERS, search: "bowl" };
    const { result, rerender } = renderShelf(client, null, MUG);
    await waitFor(() => expect(result.current.canAskNextPage).toBe(true));

    act(() => result.current.loadMore());
    expect(result.current.isNextPageLoading).toBe(true);
    rerender({ filters: BOWL });
    await waitFor(() => expect(result.current.canAskNextPage).toBe(true));
    act(() => result.current.loadMore());
    rerender({ filters: MUG });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    await act(async () => releaseHeld());
    await waitFor(() => expect(result.current.canAskNextPage).toBe(true));

    expect(result.current.phase).toBe("ready");
    expect(result.current.canAskNextPage).toBe(true);
    expect(result.current.result?.items).toHaveLength(48);
    act(() => result.current.loadMore());
    expect(log).toContain("start mug p3");
    expect(rejections).toEqual([]);
  });

  it("appends a page once when it returns to a list with that page still out (A)", async () => {
    const mugPages = [page(range(1, 24), 1, 60), page(range(25, 24), 2, 60)];
    const bowlPages = [page(range(201, 24), 1, 70)];
    const { client, log, releaseHeld } = shelfClient((filter) => {
      const pages = filter.search === "bowl" ? bowlPages : mugPages;
      const index = (filter.page ?? 1) - 1;
      return {
        page: pages[index] ?? page(range(225, 24), index + 1, 70),
        isHeld: index > 0,
      };
    });
    const MUG: ProductFilters = { ...EMPTY_FILTERS, search: "mug" };
    const BOWL: ProductFilters = { ...EMPTY_FILTERS, search: "bowl" };
    const { result, rerender } = renderShelf(client, null, MUG);
    await waitFor(() => expect(result.current.canAskNextPage).toBe(true));

    act(() => result.current.loadMore());
    rerender({ filters: BOWL });
    await waitFor(() => expect(result.current.canAskNextPage).toBe(true));
    act(() => result.current.loadMore());
    rerender({ filters: MUG });
    await waitFor(() => expect(result.current.phase).toBe("ready"));
    // Scrolling back down asks again while the first request for page two is still out.
    act(() => result.current.loadMore());
    act(() => result.current.loadMore());

    await act(async () => releaseHeld());
    await waitFor(() => expect(result.current.canAskNextPage).toBe(true));

    const items = result.current.result?.items ?? [];
    expect(items).toHaveLength(48);
    expect(new Set(items.map((item) => item.id)).size).toBe(48);
    expect(log.filter((entry) => entry === "start mug p2")).toHaveLength(1);
  });

  it("sends one request for two load-mores in the same frame or before an answer (G)", async () => {
    const { client, log, releaseHeld } = shelfClient((filter) =>
      filter.page === 1 ? { page: ALL_P1 } : { page: ALL_P2, isHeld: true },
    );
    const { result } = renderShelf(client, ALL_P1);
    await waitFor(() => expect(result.current.canAskNextPage).toBe(true));

    act(() => {
      result.current.loadMore();
      result.current.loadMore();
    });
    // And once more after the re-render, before either answer is released.
    act(() => result.current.loadMore());

    await act(async () => releaseHeld());
    await waitFor(() => expect(result.current.result?.items).toHaveLength(30));
    await pause(10);

    const items = result.current.result?.items ?? [];
    expect(new Set(items.map((item) => item.id)).size).toBe(30);
    expect(result.current.result?.page_info.page).toBe(2);
    expect(log.filter((entry) => entry === "start all p2")).toHaveLength(1);
  });
});
