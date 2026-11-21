import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NetworkStatus } from "@apollo/client";

import type { ProductsQuery } from "@/graphql/generated/graphql";

import { useSearchDraft, useShelfResults } from "./hooks";
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
  // Left out, it follows `loading`: a first-page load or ready.
  networkStatus?: NetworkStatus;
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
      useShelfResults({
        filters,
        initialProducts: SERVER_PAGE,
        initialFilterKey: SERVER_KEY,
      }),
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
    networkStatus:
      state.networkStatus ??
      (state.loading ? NetworkStatus.setVariables : NetworkStatus.ready),
    fetchMore: fetchMoreMock,
    refetch: refetchMock,
  }));
  fetchMoreMock.mockResolvedValue(undefined);
});

describe("useShelfResults", () => {
  it("shows the server's page as the current answer while the browser fetches its own", () => {
    const { result } = renderShelf();

    expect(result.current.result).toBe(SERVER_PAGE);
    expect(result.current.phase).toBe("ready");
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
    expect(result.current.phase).toBe("pending");
    expect(result.current.isRefreshing).toBe(true);
  });

  it("bridges a filter change made before the browser's first answer", () => {
    const { result, rerender } = renderShelf();

    rerender({ filters: MUGS });

    expect(result.current.result).toBe(SERVER_PAGE);
    expect(result.current.phase).toBe("pending");
  });

  it("settles once the current filters have their own answer", () => {
    const { result, rerender } = renderShelf();
    setQuery({ previousData: answer(SERVER_PAGE) });
    rerender({ filters: MUGS });

    setQuery({ data: answer(page([3], 1, 1)), loading: false });
    rerender({ filters: MUGS });

    expect(result.current.result?.items.map((item) => item.id)).toEqual([3]);
    expect(result.current.phase).toBe("ready");
  });

  it("fails without dropping the last answer, so the filter options stay", () => {
    setQuery({ data: answer(SERVER_PAGE), loading: false });
    const { result, rerender } = renderShelf();

    setQuery({
      data: undefined,
      previousData: answer(SERVER_PAGE),
      loading: false,
      error: new Error("down"),
    });
    rerender({ filters: MUGS });

    expect(result.current.phase).toBe("failed");
    expect(result.current.result?.facets.categories).toHaveLength(1);
    expect(result.current.canAskNextPage).toBe(false);
  });

  it("stays ready while Apollo reports a next page still out", () => {
    setQuery({
      data: answer(SERVER_PAGE),
      loading: true,
      networkStatus: NetworkStatus.fetchMore,
    });
    const { result } = renderShelf();

    expect(result.current.phase).toBe("ready");
    expect(result.current.canAskNextPage).toBe(true);
    expect(result.current.isRefreshing).toBe(false);
  });

  it("is pending while the filters on screen are ahead of the list", () => {
    setQuery({ data: answer(SERVER_PAGE), loading: false });
    const { result } = renderHook(() =>
      useShelfResults({
        filters: EMPTY_FILTERS,
        initialProducts: SERVER_PAGE,
        initialFilterKey: SERVER_KEY,
        isFiltersMoving: true,
      }),
    );

    expect(result.current.phase).toBe("pending");
    expect(result.current.isRefreshing).toBe(true);
  });

  it("marks a failed next page and keeps the cards", async () => {
    setQuery({ data: answer(SERVER_PAGE), loading: false });
    fetchMoreMock.mockRejectedValue(new Error("page two down"));
    const { result } = renderShelf();

    await act(async () => result.current.loadMore());

    expect(result.current.hasAppendFailed).toBe(true);
    expect(result.current.isNextPageLoading).toBe(false);
    expect(result.current.result?.items).toHaveLength(2);
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
    expect(result.current.isNextPageLoading).toBe(true);

    const mugs = answer(page([7], 1, 1));
    setQuery({ data: mugs, loading: false });
    rerender({ filters: MUGS });
    // The filters changed, so the old page's spinner no longer belongs to this list.
    expect(result.current.isNextPageLoading).toBe(false);

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

describe("useSearchDraft", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function renderDraft(search: string) {
    const commit = vi.fn<(value: string) => void>();
    const view = renderHook(
      ({ query }: { query: string }) => useSearchDraft(query, commit),
      { initialProps: { query: search } },
    );
    return { ...view, commit };
  }

  it("keeps what was typed, trailing space included, and trims only what it sends", () => {
    const { result, rerender, commit } = renderDraft("");

    act(() => result.current.change("mug "));
    act(() => vi.advanceTimersByTime(300));
    expect(commit).toHaveBeenLastCalledWith("mug");
    rerender({ query: "mug" });
    expect(result.current.value).toBe("mug ");

    act(() => result.current.change("mug c"));
    expect(result.current.value).toBe("mug c");
    act(() => vi.advanceTimersByTime(300));
    expect(commit).toHaveBeenLastCalledWith("mug c");
  });

  it("follows the URL when history moves the query after a send", () => {
    const { result, rerender, commit } = renderDraft("bowl");

    act(() => result.current.change("cup"));
    act(() => vi.advanceTimersByTime(300));
    expect(commit).toHaveBeenLastCalledWith("cup");
    rerender({ query: "cup" });
    // Back: the URL returns to an earlier search the field never sent.
    rerender({ query: "mug" });

    expect(result.current.value).toBe("mug");
  });

  it("drops a pending send when history moves the query first", () => {
    const { result, rerender, commit } = renderDraft("bowl");

    act(() => result.current.change("cu"));
    rerender({ query: "mug" });
    act(() => vi.advanceTimersByTime(300));

    expect(result.current.value).toBe("mug");
    expect(commit).not.toHaveBeenCalled();
  });

  it("follows the URL back to the query it was typed over", () => {
    const { result, rerender } = renderDraft("bowl");

    act(() => result.current.change("cup"));
    act(() => vi.advanceTimersByTime(300));
    rerender({ query: "cup" });
    rerender({ query: "bowl" });

    expect(result.current.value).toBe("bowl");
  });
});
