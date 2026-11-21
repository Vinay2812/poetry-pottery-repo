import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ProductsQuery } from "@/graphql/generated/graphql";

import { useShelfResults } from "./hooks";
import {
  EMPTY_FILTERS,
  type ProductFilters,
  toFilterInput,
  toFilterKey,
} from "./types";

type Page = ProductsQuery["products"];
type UpdateQuery = (
  previous: ProductsQuery,
  options: { fetchMoreResult: ProductsQuery },
) => ProductsQuery;

interface QueryState {
  data: ProductsQuery | undefined;
  previousData: ProductsQuery | undefined;
  loading: boolean;
  error: Error | undefined;
}

const { useQueryMock, fetchMoreMock, refetchMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  fetchMoreMock:
    vi.fn<
      (options: {
        variables: { filter: { page: number; category_slugs: unknown } };
        updateQuery: UpdateQuery;
      }) => Promise<void>
    >(),
  refetchMock: vi.fn<() => Promise<void>>(),
}));

vi.mock("@apollo/client/react", () => ({
  useQuery: useQueryMock,
  useMutation: () => [vi.fn()],
}));

function piece(id: number): Page["items"][number] {
  return {
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

function page(ids: number[], pageNumber: number, total: number): Page {
  return {
    items: ids.map(piece),
    page_info: {
      total,
      page: pageNumber,
      limit: 2,
      has_more: pageNumber * 2 < total,
    },
    facets: {
      categories: [{ value: "mugs", label: "Mugs", count: 1 }],
      collections: [],
      materials: [],
      glazes: [],
      price_min: 450,
      price_max: 900,
      active_count: total,
      archive_count: 0,
      seconds_count: 0,
    },
  };
}

const answer = (products: Page): ProductsQuery => ({ products });

const MUGS: ProductFilters = { ...EMPTY_FILTERS, categories: ["mugs"] };
const SERVER_PAGE = page([1, 2], 1, 5);
const SERVER_KEY = toFilterKey(toFilterInput(EMPTY_FILTERS, 1));

let state: QueryState;

function setQuery(next: Partial<QueryState>) {
  state = { ...state, ...next };
}

function renderShelf() {
  return renderHook(
    ({ filters }: { filters: ProductFilters }) =>
      useShelfResults(filters, SERVER_PAGE, SERVER_KEY),
    { initialProps: { filters: EMPTY_FILTERS } },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  state = {
    data: undefined,
    previousData: undefined,
    loading: true,
    error: undefined,
  };
  useQueryMock.mockImplementation(() => ({
    ...state,
    fetchMore: fetchMoreMock,
    refetch: refetchMock,
  }));
  fetchMoreMock.mockResolvedValue(undefined);
});

describe("useShelfResults", () => {
  it("shows the server's page as the current answer while the browser fetches its own", () => {
    const { result } = renderShelf();

    expect(result.current.result).toBe(SERVER_PAGE);
    expect(result.current.isSettled).toBe(true);
  });

  it("first filter change keeps the old cards and the filter panel mounted", () => {
    setQuery({ data: answer(SERVER_PAGE), loading: false });
    const { result, rerender } = renderShelf();

    setQuery({
      data: undefined,
      previousData: answer(SERVER_PAGE),
      loading: true,
    });
    rerender({ filters: MUGS });

    expect(result.current.result?.items.map((item) => item.id)).toEqual([1, 2]);
    expect(result.current.result?.facets.categories).toHaveLength(1);
    expect(result.current.isSettled).toBe(false);
    expect(result.current.isRefreshing).toBe(true);
  });

  it("bridges a filter change made before the browser's first answer", () => {
    const { result, rerender } = renderShelf();

    rerender({ filters: MUGS });

    expect(result.current.result).toBe(SERVER_PAGE);
    expect(result.current.isSettled).toBe(false);
  });

  it("settles once the current filters have their own answer", () => {
    const { result, rerender } = renderShelf();
    setQuery({ previousData: answer(SERVER_PAGE) });
    rerender({ filters: MUGS });

    setQuery({ data: answer(page([3], 1, 1)), loading: false });
    rerender({ filters: MUGS });

    expect(result.current.result?.items.map((item) => item.id)).toEqual([3]);
    expect(result.current.isSettled).toBe(true);
  });

  it("never settles on a failure and reports it when nothing can be shown", () => {
    setQuery({ loading: false, error: new Error("down") });
    const { result, rerender } = renderShelf();
    rerender({ filters: MUGS });

    expect(result.current.isSettled).toBe(false);
    expect(result.current.isFailed).toBe(true);
    expect(result.current.result).toBeUndefined();
  });

  it("appends the next page to the list that asked for it", async () => {
    setQuery({ data: answer(SERVER_PAGE), loading: false });
    const { result } = renderShelf();

    await act(async () => result.current.loadMore());

    const call = fetchMoreMock.mock.calls[0]?.[0];
    expect(call?.variables.filter.page).toBe(2);
    const merged = call?.updateQuery(answer(SERVER_PAGE), {
      fetchMoreResult: answer(page([3, 4], 2, 5)),
    });
    expect(merged?.products.items.map((item) => item.id)).toEqual([1, 2, 3, 4]);
  });

  it("drops a page that lands after the filters moved on", async () => {
    setQuery({ data: answer(SERVER_PAGE), loading: false });
    const { result, rerender } = renderShelf();
    let release: () => void = () => undefined;
    fetchMoreMock.mockReturnValue(
      new Promise<void>((resolve) => {
        release = resolve;
      }),
    );

    act(() => result.current.loadMore());
    expect(result.current.isAppending).toBe(true);

    const mugs = answer(page([7], 1, 1));
    setQuery({ data: mugs, loading: false });
    rerender({ filters: MUGS });
    // The filters changed, so the old page's spinner no longer belongs to this list.
    expect(result.current.isAppending).toBe(false);

    const call = fetchMoreMock.mock.calls[0]?.[0];
    const merged = call?.updateQuery(mugs, {
      fetchMoreResult: answer(page([3, 4], 2, 5)),
    });
    expect(merged).toBe(mugs);
    await act(async () => release());
  });

  it("asks for no page while the list on screen belongs to other filters", () => {
    setQuery({ data: answer(SERVER_PAGE), loading: false });
    const { result, rerender } = renderShelf();

    setQuery({
      data: undefined,
      previousData: answer(SERVER_PAGE),
      loading: true,
    });
    rerender({ filters: MUGS });
    act(() => result.current.loadMore());

    expect(fetchMoreMock).not.toHaveBeenCalled();
  });
});
