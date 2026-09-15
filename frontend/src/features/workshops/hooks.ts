"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";

import {
  useBookWorkshopMutation,
  useCancelWorkshopBookingMutation,
  useMyWorkshopBookingsQuery,
  useRescheduleWorkshopBookingMutation,
  useWorkshopAvailabilityQuery,
  useWorkshopBookingQuery,
  useWorkshopQuery,
} from "@/graphql/generated/graphql";

import { useRequireAuth } from "@/features/auth";
import { daysInMonth, toBookingPath } from "@/features/workshops/types";

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}

export function useWorkshop(slug: string) {
  const { data, loading, error } = useWorkshopQuery({ variables: { slug } });
  return {
    workshop: data?.workshop ?? null,
    isLoading: loading && !data,
    hasError: Boolean(error) && !data,
  };
}

// One calendar month of availability, keyed on the studio's own calendar days.
export function useAvailability(
  configSlug: string,
  monthKey: string,
  isSkipped = false,
) {
  const { data, previousData, loading, error, refetch } =
    useWorkshopAvailabilityQuery({
      variables: {
        input: {
          config_slug: configSlug,
          from: `${monthKey}-01`,
          days: daysInMonth(monthKey),
        },
      },
      skip: isSkipped,
      notifyOnNetworkStatusChange: true,
    });
  const days = data?.workshopAvailability ?? previousData?.workshopAvailability;
  return {
    days: days ?? [],
    isLoading: loading && !days,
    hasError: Boolean(error) && !days,
    refetch,
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
  const [mutate, { loading }] = useBookWorkshopMutation();

  const book = useCallback(
    (input: BookSessionInput) => {
      requireAuth(() => {
        void mutate({
          variables: {
            input: {
              config_slug: input.configSlug,
              slot_starts: input.slotStarts,
              hours: input.hours,
              participants: input.participants,
              note: input.note.trim() || null,
            },
          },
        })
          .then(({ data }) => {
            if (!data) return;
            onBooked?.();
            router.push(`${toBookingPath(data.bookWorkshop.id)}?placed=1`);
          })
          .catch((error: unknown) => toast.error(toErrorMessage(error)));
      });
    },
    [mutate, onBooked, requireAuth, router],
  );

  return { book, isBooking: loading };
}

export function useMyWorkshopBookings(page: number) {
  const { isSignedIn, isLoaded } = useAuth();
  const { data, previousData, loading, error, refetch } =
    useMyWorkshopBookingsQuery({
      variables: { page, limit: 12 },
      skip: !isSignedIn,
      notifyOnNetworkStatusChange: true,
    });
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
  const { data, loading, error, refetch } = useWorkshopBookingQuery({
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

export function useCancelWorkshopBooking() {
  const [mutate, { loading }] = useCancelWorkshopBookingMutation();

  const cancel = useCallback(
    async (id: string, reason: string): Promise<boolean> => {
      try {
        // The reply is the whole booking, so Apollo's own normalisation is the new baseline.
        await mutate({ variables: { id, reason: reason.trim() || null } });
        toast.success("Session cancelled");
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

export function useRescheduleWorkshopBooking() {
  const [mutate, { loading }] = useRescheduleWorkshopBookingMutation();

  const reschedule = useCallback(
    async (id: string, slotStarts: string[]): Promise<boolean> => {
      try {
        await mutate({
          variables: { input: { booking_id: id, slot_starts: slotStarts } },
        });
        toast.success("Session moved");
        return true;
      } catch (error) {
        toast.error(toErrorMessage(error));
        return false;
      }
    },
    [mutate],
  );

  return { reschedule, isRescheduling: loading };
}
