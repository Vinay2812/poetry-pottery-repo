"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  BookWorkshopDocument,
  CancelWorkshopBookingDocument,
  MyWorkshopBookingsDocument,
  RescheduleWorkshopBookingDocument,
  WorkshopBookingDocument,
  WorkshopDocument,
} from "@/graphql/generated/graphql";

import { describeError } from "@/lib/apollo/errors";
import { useOptimisticAction } from "@/lib/use-optimistic-action";

import { useRequireAuth } from "@/features/auth";
import { toBookingPath } from "@/features/workshops/types";

export function useWorkshop(slug: string) {
  const { data, loading, error } = useQuery(WorkshopDocument, {
    variables: { slug },
  });
  return {
    workshop: data?.workshop ?? null,
    isLoading: loading && !data,
    hasError: Boolean(error) && !data,
  };
}

export interface BookSessionInput {
  configSlug: string;
  slotStarts: string[];
  hours: number;
  participants: number;
  note: string;
}

export function useBookWorkshop(onBooked?: () => void) {
  const router = useRouter();
  const requireAuth = useRequireAuth();
  const [mutate] = useMutation(BookWorkshopDocument);

  const { execute, isPending: isBooking } = useOptimisticAction({
    run: (input: BookSessionInput) =>
      mutate({
        variables: {
          input: {
            config_slug: input.configSlug,
            slot_starts: input.slotStarts,
            hours: input.hours,
            participants: input.participants,
            note: input.note.trim() || null,
          },
        },
      }),
    messages: { success: null, failure: "The session could not be booked" },
    onSuccess: ({ data }) => {
      if (!data) return;
      onBooked?.();
      router.push(`${toBookingPath(data.bookWorkshop.id)}?placed=1`);
    },
  });

  const book = useCallback(
    (input: BookSessionInput) => {
      requireAuth(() => execute(input));
    },
    [execute, requireAuth],
  );

  return { book, isBooking };
}

export function useMyWorkshopBookings(page: number) {
  const { isSignedIn, isLoaded } = useAuth();
  const { data, previousData, loading, error, refetch } = useQuery(
    MyWorkshopBookingsDocument,
    {
      variables: { page, limit: 12 },
      skip: !isSignedIn,
      // A session booked or moved while this list was unmounted must not leave a stale page behind.
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: true,
    },
  );
  const result = data?.myWorkshopBookings ?? previousData?.myWorkshopBookings;
  return {
    bookings: isSignedIn ? (result?.items ?? []) : [],
    pageInfo: result?.page_info ?? null,
    isLoading: !isLoaded || (loading && !result),
    isPaging: loading && Boolean(result),
    hasError: Boolean(error) && !result,
    isSignedIn: Boolean(isSignedIn),
    refetch,
  };
}

export function useWorkshopBooking(id: string) {
  const { isSignedIn, isLoaded } = useAuth();
  const { data, loading, error, refetch } = useQuery(WorkshopBookingDocument, {
    variables: { id },
    skip: !isSignedIn,
  });
  return {
    booking: isSignedIn ? (data?.workshopBooking ?? null) : null,
    isLoading: !isLoaded || (loading && !data),
    hasError: Boolean(error) && !data,
    isSignedIn: Boolean(isSignedIn),
    refetch,
  };
}

// The booking page patches inside its own transition, so these return a promise it can await.
export function useCancelWorkshopBooking() {
  const [mutate, { loading }] = useMutation(CancelWorkshopBookingDocument);

  const cancel = useCallback(
    async (id: string, reason: string): Promise<boolean> => {
      try {
        // The reply is the whole booking, so Apollo's own normalisation is the new baseline.
        await mutate({ variables: { id, reason: reason.trim() || null } });
        toast.success("Session cancelled");
        return true;
      } catch (error) {
        toast.error(describeError(error, "The session could not be cancelled"));
        return false;
      }
    },
    [mutate],
  );

  return { cancel, isCancelling: loading };
}

export function useRescheduleWorkshopBooking() {
  const [mutate, { loading }] = useMutation(RescheduleWorkshopBookingDocument);

  const reschedule = useCallback(
    async (id: string, slotStarts: string[]): Promise<boolean> => {
      try {
        await mutate({
          variables: { input: { booking_id: id, slot_starts: slotStarts } },
        });
        toast.success("Session moved");
        return true;
      } catch (error) {
        toast.error(describeError(error, "The session could not be moved"));
        return false;
      }
    },
    [mutate],
  );

  return { reschedule, isRescheduling: loading };
}
