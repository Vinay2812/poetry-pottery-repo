"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";

import {
  EventDocument,
  type EventQuery,
  type EventQueryVariables,
  RegistrationDocument,
  type RegistrationQuery,
  useCancelRegistrationMutation,
  useEventsQuery,
  useMyRegistrationsQuery,
  useRegisterForEventMutation,
  useRegistrationQuery,
} from "@/graphql/generated/graphql";
import type { ApolloCache } from "@apollo/client";

import { useRequireAuth } from "@/features/auth";
import {
  type EventFilters,
  type RegistrationData,
  toEventsFilterInput,
  toRegistrationPath,
} from "@/features/events/types";

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}

// Keeps the event page in step with a booking made or cancelled elsewhere in the session.
function writeEventRegistration(
  cache: ApolloCache,
  registration: RegistrationData,
  seatChange: number,
): void {
  cache.updateQuery<EventQuery, EventQueryVariables>(
    { query: EventDocument, variables: { slug: registration.event.slug } },
    (existing) =>
      existing
        ? {
            event: {
              ...existing.event,
              available_seats: Math.max(
                0,
                existing.event.available_seats + seatChange,
              ),
              my_registration: registration,
            },
          }
        : undefined,
  );
}

export function useEvents(filters: EventFilters) {
  const { data, previousData, loading, error, fetchMore, refetch } =
    useEventsQuery({
      variables: { filter: toEventsFilterInput(filters, 1) },
      notifyOnNetworkStatusChange: true,
    });
  const result = data?.events ?? previousData?.events;
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
  const [mutate, { loading }] = useRegisterForEventMutation();

  const reserve = useCallback(
    (eventId: number, seats: number, note: string) => {
      requireAuth(() => {
        void mutate({
          variables: {
            input: { event_id: eventId, seats, note: note.trim() || null },
          },
          update: (cache, { data }) => {
            if (data)
              writeEventRegistration(cache, data.registerForEvent, -seats);
          },
        })
          .then(({ data }) => {
            if (data)
              router.push(
                `${toRegistrationPath(data.registerForEvent.id)}?placed=1`,
              );
          })
          .catch((error: unknown) => toast.error(toErrorMessage(error)));
      });
    },
    [mutate, requireAuth, router],
  );

  return { reserve, isReserving: loading };
}

export function useMyRegistrations(page: number) {
  const { data, previousData, loading, error, refetch } =
    useMyRegistrationsQuery({
      variables: { page, limit: 12 },
      notifyOnNetworkStatusChange: true,
    });
  const result = data?.myRegistrations ?? previousData?.myRegistrations;
  return {
    registrations: result?.items ?? [],
    pageInfo: result?.page_info ?? null,
    isLoading: loading && !result,
    hasError: Boolean(error) && !result,
    refetch,
  };
}

export function useRegistration(id: string) {
  const { data, loading, error, refetch } = useRegistrationQuery({
    variables: { id },
  });
  return {
    registration: data?.registration ?? null,
    isLoading: loading && !data,
    hasError: Boolean(error) && !data,
    refetch,
  };
}

export function useCancelRegistration() {
  const [mutate, { loading }] = useCancelRegistrationMutation();

  const cancel = useCallback(
    async (id: string, reason: string): Promise<boolean> => {
      try {
        await mutate({
          variables: { id, reason: reason.trim() || null },
          update: (cache, { data }) => {
            const cancelled = data?.cancelRegistration;
            if (!cancelled) return;
            cache.writeQuery<RegistrationQuery>({
              query: RegistrationDocument,
              variables: { id },
              data: { registration: cancelled },
            });
            writeEventRegistration(cache, cancelled, cancelled.seats);
          },
        });
        toast.success("Booking cancelled");
        return true;
      } catch (error) {
        toast.error(toErrorMessage(error));
        return false;
      }
    },
    [mutate],
  );

  return { cancel, isCancelling: loading };
}
