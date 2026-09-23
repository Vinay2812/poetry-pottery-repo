"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  CancelRegistrationDocument,
  EventsDocument,
  type EventsQuery,
  MyRegistrationsDocument,
  RegisterForEventDocument,
  RegistrationDocument,
} from "@/graphql/generated/graphql";

import { useRequireAuth } from "@/features/auth";
import {
  type EventFilters,
  toEventsFilterInput,
  toEventsFilterKey,
  toRegistrationPath,
} from "@/features/events/types";

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}

export function useEvents(
  filters: EventFilters,
  initialEvents: EventsQuery["events"] | null = null,
  initialFilterKey: string | null = null,
) {
  const filterInput = toEventsFilterInput(filters, 1);
  const { data, previousData, loading, error, fetchMore, refetch } = useQuery(
    EventsDocument,
    {
      variables: { filter: filterInput },
      notifyOnNetworkStatusChange: true,
    },
  );
  // The server's first page covers the first load, but only while the filters still match it.
  const serverPage =
    initialEvents && initialFilterKey === toEventsFilterKey(filterInput)
      ? initialEvents
      : undefined;
  // Old results bridge a load, not a failure: they would sit under filters they do not match.
  const result =
    data?.events ?? (error ? undefined : (previousData?.events ?? serverPage));
  const pageInfo = result?.page_info ?? null;

  const loadMore = useCallback(() => {
    if (!pageInfo?.has_more || loading) return;
    void fetchMore({
      variables: { filter: toEventsFilterInput(filters, pageInfo.page + 1) },
      updateQuery: (previous, { fetchMoreResult }) => ({
        events: {
          ...fetchMoreResult.events,
          items: [...previous.events.items, ...fetchMoreResult.events.items],
        },
      }),
    });
  }, [fetchMore, filters, loading, pageInfo]);

  return {
    events: result?.items ?? [],
    pageInfo,
    isInitialLoading: loading && !result,
    isFetchingMore: loading && Boolean(result),
    hasError: Boolean(error) && !result,
    loadMore,
    refetch,
  };
}

export function useRegisterForEvent() {
  const router = useRouter();
  const requireAuth = useRequireAuth();
  const [mutate, { loading }] = useMutation(RegisterForEventDocument);

  const reserve = useCallback(
    (eventId: number, seats: number, note: string) => {
      requireAuth(() => {
        void mutate({
          variables: {
            input: { event_id: eventId, seats, note: note.trim() || null },
          },
        })
          .then(({ data }) => {
            if (data) {
              // The event page is a server component; its seat count is stale until refreshed.
              router.refresh();
              router.push(
                `${toRegistrationPath(data.registerForEvent.id)}?placed=1`,
              );
            }
          })
          .catch((error: unknown) => toast.error(toErrorMessage(error)));
      });
    },
    [mutate, requireAuth, router],
  );

  return { reserve, isReserving: loading };
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
  return {
    registrations: result?.items ?? [],
    pageInfo: result?.page_info ?? null,
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

export function useCancelRegistration() {
  const router = useRouter();
  const [mutate, { loading }] = useMutation(CancelRegistrationDocument);

  const cancel = useCallback(
    async (id: string, reason: string): Promise<boolean> => {
      try {
        // The reply is the whole booking, so Apollo's own normalisation is the new baseline.
        await mutate({ variables: { id, reason: reason.trim() || null } });
        // The event page is a server component; its seat count is stale until refreshed.
        router.refresh();
        toast.success("Booking cancelled");
        return true;
      } catch (error) {
        toast.error(toErrorMessage(error));
        return false;
      }
    },
    [mutate, router],
  );

  return { cancel, isCancelling: loading };
}
