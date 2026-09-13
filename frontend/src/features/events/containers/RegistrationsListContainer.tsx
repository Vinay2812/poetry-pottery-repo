"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { toEventWhenLabel } from "@/features/events/types";

import { EmptyRegistrations } from "@/features/events/components/EmptyRegistrations";
import { RegistrationCard } from "@/features/events/components/RegistrationCard";
import { useMyRegistrations } from "@/features/events/hooks";
import {
  toEventTypeLabel,
  toRegistrationPath,
  toRegistrationStatusLabel,
} from "@/features/events/types";

export function RegistrationsListContainer() {
  const [page, setPage] = useState(1);
  const { registrations, pageInfo, isLoading, hasError, refetch } =
    useMyRegistrations(page);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 md:px-6 md:py-12">
      <h1 className="font-heading text-4xl leading-tight tracking-tight md:text-6xl">
        Your bookings
      </h1>
      {isLoading ? (
        <div className="flex flex-col" aria-busy="true">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className="h-24 animate-pulse border-b border-ash bg-ash/40"
            />
          ))}
        </div>
      ) : hasError ? (
        <div className="flex flex-col items-start gap-4 border-t border-ash py-16">
          <h2 className="font-heading text-2xl tracking-tight">
            Your bookings did not load
          </h2>
          <Button variant="outline" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      ) : registrations.length === 0 ? (
        <EmptyRegistrations />
      ) : (
        <>
          <div className="flex flex-col border-t border-ash">
            {registrations.map((registration) => (
              <RegistrationCard
                key={registration.id}
                href={toRegistrationPath(registration.id)}
                eventTitle={registration.event.title}
                imageUrl={registration.event.image_url}
                typeLabel={toEventTypeLabel(registration.event.event_type)}
                dateLabel={toEventWhenLabel(registration.event.starts_at)}
                seats={registration.seats}
                total={registration.total}
                statusLabel={toRegistrationStatusLabel(registration.status)}
              />
            ))}
          </div>
          {pageInfo && pageInfo.total > pageInfo.limit && (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
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
