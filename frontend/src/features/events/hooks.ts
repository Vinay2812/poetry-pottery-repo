"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  CancelRegistrationDocument,
  EventsDocument,
  type EventsQuery,
  MyRegistrationsDocument,
  RegisterForEventDocument,
  RegistrationDocument,
} from "@/graphql/generated/graphql";

import { toPageTurn } from "@/lib/page-turn";
import { useOptimisticAction } from "@/lib/use-optimistic-action";
import { usePageTrail } from "@/lib/use-page-trail";

import { useRequireAuth } from "@/features/auth";
import {
  type EventFilters,
  hasEventStarted,
  toEventsFilterInput,
  toStartDelayMs,
  toEventsFilterKey,
  toRegistrationPath,
} from "@/features/events/types";

type EventsPage = EventsQuery["events"];

interface ReserveRequest {
  eventId: number;
  seats: number;
  note: string;
}

interface CancelRequest {
  id: string;
  reason: string;
}

interface CancelRegistrationOptions {
  patch?: (request: CancelRequest) => void;
  refresh?: () => Promise<unknown>;
}

// Page one comes through the query; each "show more" page joins it through the shared page trail.
export function useEvents(
  filters: EventFilters,
  initialEvents: EventsPage | null = null,
  initialFilterKey: string | null = null,
) {
  const filterInput = toEventsFilterInput(filters, 1);
  const filterKey = toEventsFilterKey(filterInput);
  const { data, previousData, loading, error, refetch } = useQuery(
    EventsDocument,
    {
      variables: { filter: filterInput },
      notifyOnNetworkStatusChange: true,
    },
  );
  const pages = usePageTrail({
    query: EventsDocument,
    filterKey,
    toVariables: (page) => ({ filter: toEventsFilterInput(filters, page) }),
    toPage: (answer) => answer.events,
    firstPage: data?.events,
    previousFirstPage: previousData?.events,
    canAskNextPage: !loading && !error,
  });
  // The server's first page covers the first load, but only while the filters still match it.
  const serverPage =
    initialEvents && initialFilterKey === filterKey ? initialEvents : undefined;
  // Old results bridge a load, not a failure: they would sit under filters they do not match.
  const result =
    pages.list ?? (error ? undefined : (pages.previousList ?? serverPage));

  const { restart } = pages;
  const retry = useCallback(() => {
    restart();
    return refetch();
  }, [refetch, restart]);

  return {
    events: result?.items ?? [],
    pageInfo: result?.page_info ?? null,
    isInitialLoading: loading && !result,
    isNextPageLoading: pages.isNextPageLoading,
    // New filters are loading under the old cards.
    isRefreshing: loading && Boolean(result),
    hasError: Boolean(error) && !result,
    hasNextPageFailed: pages.hasNextPageFailed,
    loadMore: pages.loadMore,
    refetch: retry,
  };
}

// The page's clock, seeded from the server so the first render matches, then moved on once at the start.
export function useEventClock(initialNow: string, startsAt: string) {
  const [now, setNow] = useState(() => new Date(initialNow));

  useEffect(() => {
    if (hasEventStarted(startsAt, now)) return;
    // A zero delay also catches a server time that was already stale on arrival.
    const timer = setTimeout(
      () => setNow(new Date()),
      toStartDelayMs(startsAt, new Date()),
    );
    return () => clearTimeout(timer);
  }, [now, startsAt]);

  const sync = useCallback(() => setNow(new Date()), []);

  return { now, sync };
}

export function useRegisterForEvent() {
  const router = useRouter();
  const requireAuth = useRequireAuth();
  const [mutate] = useMutation(RegisterForEventDocument);

  const { execute, isPending: isReserving } = useOptimisticAction({
    run: (request: ReserveRequest) =>
      mutate({
        variables: {
          input: {
            event_id: request.eventId,
            seats: request.seats,
            note: request.note.trim() || null,
          },
        },
      }),
    messages: { success: null, failure: "Your request could not be sent" },
    onSuccess: ({ data }) => {
      if (!data) return;
      // The event page is a server component; its seat count is stale until refreshed.
      router.refresh();
      router.push(`${toRegistrationPath(data.registerForEvent.id)}?placed=1`);
    },
  });

  const reserve = useCallback(
    (eventId: number, seats: number, note: string) => {
      requireAuth(() => execute({ eventId, seats, note }));
    },
    [execute, requireAuth],
  );

  return { reserve, isReserving };
}

// Signed-out visitors get a sign-in prompt instead of an auth error from the API.
export function useMyRegistrations(page: number) {
  const { isSignedIn, isLoaded } = useAuth();
  const { data, previousData, loading, error, refetch } = useQuery(
    MyRegistrationsDocument,
    {
      variables: { page, limit: 12 },
      skip: !isSignedIn,
      // A seat reserved or cancelled elsewhere must not leave a stale list behind.
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: true,
    },
  );
  const result = isSignedIn
    ? (data?.myRegistrations ?? previousData?.myRegistrations)
    : undefined;
  const { shownPage, failedPage } = toPageTurn(
    page,
    result?.page_info.page ?? null,
    Boolean(error),
  );
  return {
    registrations: result?.items ?? [],
    pageInfo: result?.page_info ?? null,
    shownPage,
    failedPage,
    isLoading: !isLoaded || (loading && !result),
    isPaging: loading && Boolean(result),
    hasError: Boolean(error) && !result,
    isSignedIn: Boolean(isSignedIn),
    refetch,
  };
}

export function useRegistration(id: string) {
  const { isSignedIn, isLoaded } = useAuth();
  const { data, loading, error, refetch } = useQuery(RegistrationDocument, {
    variables: { id },
    skip: !isSignedIn,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
  return {
    registration: isSignedIn ? (data?.registration ?? null) : null,
    isLoading: !isLoaded || (loading && !data),
    hasError: Boolean(error) && !data,
    isSignedIn: Boolean(isSignedIn),
    refetch,
  };
}

// The reply is the whole booking, so Apollo's own normalisation is the new baseline.
export function useCancelRegistration({
  patch,
  refresh,
}: CancelRegistrationOptions = {}) {
  const router = useRouter();
  const [mutate] = useMutation(CancelRegistrationDocument);

  const { execute, isPending: isCancelling } = useOptimisticAction({
    patch,
    run: (request: CancelRequest) =>
      mutate({
        variables: { id: request.id, reason: request.reason.trim() || null },
      }),
    refresh,
    messages: {
      success: "Booking cancelled",
      failure: "The booking could not be cancelled",
    },
    // The event page is a server component; its seat count is stale until refreshed.
    onSuccess: () => router.refresh(),
  });

  const cancel = useCallback(
    (id: string, reason: string) => execute({ id, reason }),
    [execute],
  );

  return { cancel, isCancelling };
}
