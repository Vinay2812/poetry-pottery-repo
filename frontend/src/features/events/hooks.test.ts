import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  EventStatus,
  EventType,
  type EventsQuery,
} from "@/graphql/generated/graphql";

import { useEvents } from "./hooks";
import { DEFAULT_EVENT_FILTERS, type EventFilters } from "./types";

type Page = EventsQuery["events"];

interface QueryState {
  data: EventsQuery | undefined;
  previousData: EventsQuery | undefined;
  loading: boolean;
  error: Error | undefined;
}

const { useQueryMock, clientQueryMock, refetchMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  clientQueryMock:
    vi.fn<
      (options: {
        variables: { filter: { page: number } };
        fetchPolicy: string;
      }) => Promise<{ data: EventsQuery | undefined }>
    >(),
  refetchMock: vi.fn<() => Promise<void>>(),
}));

const client = { query: clientQueryMock };

vi.mock("@apollo/client/react", () => ({
  useQuery: useQueryMock,
  useMutation: () => [vi.fn()],
  useApolloClient: () => client,
}));

vi.mock("@clerk/nextjs", () => ({ useAuth: () => ({ isSignedIn: false }) }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/features/auth", () => ({ useRequireAuth: () => vi.fn() }));

function event(id: number): Page["items"][number] {
  return {
    id,
    slug: `event-${id}`,
    title: `Event ${id}`,
    event_type: EventType.PotteryWorkshop,
    status: EventStatus.Published,
    level: null,
    starts_at: "2026-12-12T10:00:00.000Z",
    ends_at: "2026-12-12T12:00:00.000Z",
    location: "Sangli",
    price: 1200,
    total_seats: 8,
    available_seats: 4,
    instructor: null,
    image_url: "",
    rating_avg: 0,
    rating_count: 0,
    is_past: false,
  };
}

function page(ids: number[], pageNumber: number, total: number): Page {
  return {
    items: ids.map(event),
    page_info: {
      total,
      page: pageNumber,
      limit: 2,
      has_more: pageNumber * 2 < total,
    },
  };
}

const answer = (events: Page): EventsQuery => ({ events });

const OPEN_MICS: EventFilters = {
  ...DEFAULT_EVENT_FILTERS,
  eventType: EventType.OpenMic,
};

let state: QueryState;

function setQuery(next: Partial<QueryState>) {
  state = { ...state, ...next };
}

function renderEvents() {
  return renderHook(
    ({ filters }: { filters: EventFilters }) => useEvents(filters),
    {
      initialProps: { filters: DEFAULT_EVENT_FILTERS },
    },
  );
}

const ids = (events: Page["items"]) => events.map((item) => item.id);

beforeEach(() => {
  vi.clearAllMocks();
  state = {
    data: answer(page([1, 2], 1, 5)),
    previousData: undefined,
    loading: false,
    error: undefined,
  };
  useQueryMock.mockImplementation(() => ({ ...state, refetch: refetchMock }));
  clientQueryMock.mockResolvedValue({ data: answer(page([3, 4], 2, 5)) });
});

describe("useEvents", () => {
  it("fetches the next dates without touching the cache and joins them", async () => {
    const { result } = renderEvents();

    await act(async () => result.current.loadMore());

    const call = clientQueryMock.mock.calls[0]?.[0];
    expect(call?.variables.filter.page).toBe(2);
    expect(call?.fetchPolicy).toBe("no-cache");
    expect(ids(result.current.events)).toEqual([1, 2, 3, 4]);
    expect(result.current.pageInfo?.page).toBe(2);
    expect(result.current.isNextPageLoading).toBe(false);
  });

  it("asks for the next dates once, however fast the button is pressed", async () => {
    const { result } = renderEvents();

    await act(async () => {
      result.current.loadMore();
      result.current.loadMore();
    });

    expect(clientQueryMock).toHaveBeenCalledTimes(1);
    expect(ids(result.current.events)).toEqual([1, 2, 3, 4]);
  });

  it("keeps the cards and offers the same dates again after a failure", async () => {
    clientQueryMock.mockRejectedValueOnce(new Error("down"));
    const { result } = renderEvents();

    await act(async () => result.current.loadMore());
    expect(result.current.hasNextPageFailed).toBe(true);
    expect(ids(result.current.events)).toEqual([1, 2]);

    await act(async () => result.current.loadMore());
    expect(clientQueryMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        variables: { filter: expect.objectContaining({ page: 2 }) },
      }),
    );
    expect(result.current.hasNextPageFailed).toBe(false);
    expect(ids(result.current.events)).toEqual([1, 2, 3, 4]);
  });

  it("keeps the joined dates on screen while new filters load", async () => {
    const { result, rerender } = renderEvents();
    await act(async () => result.current.loadMore());

    setQuery({
      data: undefined,
      previousData: answer(page([1, 2], 1, 5)),
      loading: true,
    });
    rerender({ filters: OPEN_MICS });

    expect(ids(result.current.events)).toEqual([1, 2, 3, 4]);
    expect(result.current.isInitialLoading).toBe(false);
  });

  it("joins a late page only to the filters that asked for it", async () => {
    let release: () => void = () => undefined;
    clientQueryMock.mockReturnValueOnce(
      new Promise((resolve) => {
        release = () => resolve({ data: answer(page([3, 4], 2, 5)) });
      }),
    );
    const { result, rerender } = renderEvents();
    act(() => result.current.loadMore());
    expect(result.current.isNextPageLoading).toBe(true);

    setQuery({ data: answer(page([9], 1, 1)) });
    rerender({ filters: OPEN_MICS });
    await act(async () => release());

    expect(ids(result.current.events)).toEqual([9]);
    expect(result.current.isNextPageLoading).toBe(false);
  });

  it("starts again from the first page when it is read again", async () => {
    const { result } = renderEvents();
    await act(async () => result.current.loadMore());

    act(() => void result.current.refetch());

    expect(refetchMock).toHaveBeenCalled();
    expect(ids(result.current.events)).toEqual([1, 2]);
  });
});
