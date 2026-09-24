"use client";

import { useCallback, useMemo, useState } from "react";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  BookStudioVisitDocument,
  StudioVisitAvailabilityDocument,
} from "@/graphql/generated/graphql";
import { describeError } from "@/lib/apollo/errors";
import type { VisitFormValues } from "@/lib/validations/visit";

import { ConfirmationLine } from "@/features/content/components/ConfirmationLine";
import { VisitDayStrip } from "@/features/visits/components/VisitDayStrip";
import { VisitForm } from "@/features/visits/components/VisitForm";
import { VisitWindowPicker } from "@/features/visits/components/VisitWindowPicker";
import {
  countOpen,
  firstOpenDate,
  toDateKey,
  toDayLabel,
  toDayNumber,
  toLongDayLabel,
  toConfirmationLine,
  toWindowLabel,
  VISIT_DAYS,
  windowsFor,
} from "@/features/visits/types";

export function StudioVisitContainer() {
  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const [pickedWindow, setPickedWindow] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data, previousData, loading, refetch } = useQuery(
    StudioVisitAvailabilityDocument,
    {
      variables: { from: null, days: VISIT_DAYS },
    },
  );
  // Memoised so the empty fallback is not a new array on every render.
  const days = useMemo(
    () =>
      data?.studioVisitAvailability ??
      previousData?.studioVisitAvailability ??
      [],
    [data, previousData],
  );

  // Before anyone picks, the first day with a window free is the one on show.
  const activeDate = pickedDate ?? firstOpenDate(days);
  const windows = useMemo(
    () => windowsFor(days, activeDate),
    [activeDate, days],
  );
  const dayOptions = useMemo(
    () =>
      days.map((day) => ({
        date: day.date,
        dayLabel: toDayLabel(day.date),
        dayNumber: toDayNumber(day.date),
        openCount: countOpen(day),
      })),
    [days],
  );
  const windowOptions = useMemo(
    () =>
      windows.map((window) => ({
        startsAt: window.starts_at,
        label: toWindowLabel(window.starts_at, window.ends_at),
        isAvailable: window.is_available,
        reason: window.reason,
      })),
    [windows],
  );

  const picked = windows.find(
    (window) => window.starts_at === pickedWindow && window.is_available,
  );
  const pickedLabel = picked
    ? `${toWindowLabel(picked.starts_at, picked.ends_at)} on ${toLongDayLabel(toDateKey(picked.starts_at))}`
    : null;

  const [book, { loading: isBooking }] = useMutation(BookStudioVisitDocument);

  const handleSelectDate = useCallback((date: string) => {
    setPickedDate(date);
    setPickedWindow(null);
    setErrorMessage(null);
  }, []);

  const handleSelectWindow = useCallback((startsAt: string) => {
    setPickedWindow(startsAt);
    setErrorMessage(null);
  }, []);

  const handleSubmit = useCallback(
    async (values: VisitFormValues) => {
      if (!picked) return;
      setErrorMessage(null);
      try {
        const result = await book({
          variables: {
            input: {
              starts_at: picked.starts_at,
              name: values.name,
              phone: values.phone,
              note: values.note.length > 0 ? values.note : null,
            },
          },
        });
        const visit = result.data?.bookStudioVisit;
        if (!visit) throw new Error("The studio did not take that window");
        setConfirmation(
          toConfirmationLine(visit.name, visit.starts_at, visit.ends_at),
        );
      } catch (error) {
        setErrorMessage(
          describeError(error, "We could not take that window. Try another."),
        );
        // A lost race means the calendar on screen is stale; the refetch is the new baseline, and a
        // window someone else took stops matching `picked`, while one still free stays chosen.
        await refetch();
      }
    },
    [book, picked, refetch],
  );

  if (confirmation) {
    return <ConfirmationLine text={confirmation} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-2xl tracking-tight">Come by</h2>
        <p className="max-w-md text-[15px] text-muted-foreground">
          Pick a half hour in the next fortnight and we will keep the wheel
          quiet for it.
        </p>
      </div>

      {loading && days.length === 0 ? (
        <p className="text-[15px] text-muted-foreground">
          Looking at the calendar…
        </p>
      ) : dayOptions.every((day) => day.openCount === 0) ? (
        <p className="text-[15px] text-muted-foreground">
          Nothing free in the next fortnight. Write to us instead and we will
          find a time.
        </p>
      ) : (
        <>
          <VisitDayStrip
            days={dayOptions}
            selectedDate={activeDate}
            onSelectDate={handleSelectDate}
          />
          <VisitWindowPicker
            dayLabel={activeDate ? toLongDayLabel(activeDate) : ""}
            windows={windowOptions}
            selectedStartsAt={pickedWindow}
            onSelectWindow={handleSelectWindow}
          />
          <VisitForm
            pickedLabel={pickedLabel}
            isSubmitting={isBooking}
            errorMessage={errorMessage}
            onSubmit={(values) => void handleSubmit(values)}
          />
        </>
      )}
    </div>
  );
}
