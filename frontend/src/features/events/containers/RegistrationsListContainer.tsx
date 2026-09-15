"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

import { EmptyRegistrations } from "@/features/events/components/EmptyRegistrations";
import { RegistrationCard } from "@/features/events/components/RegistrationCard";
import { useMyRegistrations } from "@/features/events/hooks";
import {
  toEventTypeLabel,
  toRegistrationPath,
  toRegistrationStatusLabel,
  toRegistrationStatusTone,
  toTimeRange,
} from "@/features/events/types";

export function RegistrationsListContainer() {
  const [page, setPage] = useState(1);
  const { registrations, pageInfo, isLoading, hasError, refetch } =
    useMyRegistrations(page);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <h1 className="font-heading text-3xl md:text-5xl">Your bookings</h1>
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2" aria-busy="true">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-2xl bg-primary-light/70"
            />
          ))}
        </div>
      ) : hasError ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-cream px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            We could not load your bookings just now.
          </p>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => void refetch()}
          >
            Try again
          </Button>
        </div>
      ) : registrations.length === 0 ? (
        <EmptyRegistrations />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {registrations.map((registration) => (
              <RegistrationCard
                key={registration.id}
                href={toRegistrationPath(registration.id)}
                eventTitle={registration.event.title}
                imageUrl={registration.event.image_url}
                typeLabel={toEventTypeLabel(registration.event.event_type)}
                dateLabel={formatDate(registration.event.starts_at)}
                timeRange={toTimeRange(
                  registration.event.starts_at,
                  registration.event.ends_at,
                )}
                location={registration.event.location}
                seats={registration.seats}
                total={registration.total}
                statusLabel={toRegistrationStatusLabel(registration.status)}
                statusTone={toRegistrationStatusTone(registration.status)}
              />
            ))}
          </div>
          {pageInfo && pageInfo.total > pageInfo.limit && (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                className="rounded-full"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Newer
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pageInfo.page} of{" "}
                {Math.ceil(pageInfo.total / pageInfo.limit)}
              </span>
              <Button
                variant="outline"
                className="rounded-full"
                disabled={!pageInfo.has_more}
                onClick={() => setPage((current) => current + 1)}
              >
                Older
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
