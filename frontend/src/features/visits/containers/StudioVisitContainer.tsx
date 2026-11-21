"use client";

import { useCallback, useMemo, useState } from "react";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  BookStudioVisitDocument,
  StudioVisitAvailabilityDocument,
} from "@/graphql/generated/graphql";
import { describeError } from "@/lib/apollo/errors";
import { useFocusOnShow } from "@/lib/use-focus-on-show";
import type { VisitFormValues } from "@/lib/validations/visit";

import { ConfirmationLine } from "@/features/content/components/ConfirmationLine";
import { VisitDayStrip } from "@/features/visits/components/VisitDayStrip";
import { VisitForm } from "@/features/visits/components/VisitForm";
import { VisitWindowPicker } from "@/features/visits/components/VisitWindowPicker";
import {
  firstOpenDate,
  toConfirmationLine,
  toDateKey,
  toDayOptions,
  toLongDayLabel,
  toWindowLabel,
  toWindowOptions,
  VISIT_DAYS,
  windowsFor,
} from "@/features/visits/types";

export function StudioVisitContainer() {
  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const [pickedWindow, setPickedWindow] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const confirmationRef = useFocusOnShow<HTMLDivElement>(confirmation !== null);

  const { data, previousData, loading, error, refetch } = useQuery(
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
  const dayOptions = useMemo(() => toDayOptions(days), [days]);
  const windowOptions = useMemo(() => toWindowOptions(windows), [windows]);

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
    return (
      <div
        ref={confirmationRef}
        tabIndex={-1}
        className="max-w-xl focus:outline-none"
      >
        <ConfirmationLine text={confirmation} />
      </div>
    );
  }

  if (loading && days.length === 0) {
    return (
      <p className="text-[15px] text-muted-foreground">
        Looking at the calendar…
      </p>
    );
  }

  if (error && days.length === 0) {
    return (
      <p role="alert" className="max-w-prose text-[15px] text-muted-foreground">
        We could not open the calendar just now. Write to us and we will find a
        time.
      </p>
    );
  }

  if (dayOptions.every((day) => day.openCount === 0)) {
    return (
      <p className="max-w-prose text-[15px] text-muted-foreground">
        Nothing free in the next fortnight. Write to us instead and we will find
        a time.
      </p>
    );
  }

  // Capped narrower than a wide column on purpose, so the seven day cells stay close to square.
  return (
    <div className="flex max-w-xl flex-col gap-6">
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
        isDayPicked={activeDate !== null}
        pickedLabel={pickedLabel}
        isSubmitting={isBooking}
        errorMessage={errorMessage}
        onSubmit={(values) => void handleSubmit(values)}
      />
    </div>
  );
}
