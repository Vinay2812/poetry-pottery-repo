"use client";

import { useClerk } from "@clerk/nextjs";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { SignInWall } from "@/features/auth";
import { BookingCard } from "@/features/workshops/components/BookingCard";
import { BookingCardSkeleton } from "@/features/workshops/components/BookingCardSkeleton";
import { EmptyBookings } from "@/features/workshops/components/EmptyBookings";
import { useMyWorkshopBookings } from "@/features/workshops/hooks";
import {
  formatSessionDate,
  formatSlotRange,
  toBookingPath,
  toBookingStatusLabel,
} from "@/features/workshops/types";

export function BookingsListContainer() {
  const [page, setPage] = useState(1);
  const { bookings, pageInfo, isLoading, hasError, isSignedIn, refetch } =
    useMyWorkshopBookings(page);
  const { openSignIn } = useClerk();

  if (!isLoading && !isSignedIn) {
    return (
      <SignInWall
        message="Sign in to see your wheel sessions"
        onSignIn={() => openSignIn()}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 md:px-6 md:py-12">
      <h1 className="font-heading text-4xl leading-tight tracking-tight md:text-6xl">
        Your wheel sessions
      </h1>

      {isLoading ? (
        <div className="flex flex-col border-t border-ash" aria-busy="true">
          {[0, 1, 2, 3].map((index) => (
            <BookingCardSkeleton key={index} />
          ))}
        </div>
      ) : hasError ? (
        <div className="flex flex-col items-start gap-4 border-t border-ash py-16">
          <h2 className="font-heading text-2xl tracking-tight">
            Your sessions did not load
          </h2>
          <Button variant="outline" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      ) : bookings.length === 0 ? (
        <EmptyBookings />
      ) : (
        <>
          <div className="flex flex-col border-t border-ash">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                href={toBookingPath(booking.id)}
                dateLabel={formatSessionDate(
                  booking.starts_at,
                  booking.config.timezone,
                )}
                timeLabel={formatSlotRange(
                  booking.starts_at,
                  booking.ends_at,
                  booking.config.timezone,
                )}
                hours={booking.hours}
                participants={booking.participants}
                total={booking.total}
                statusLabel={toBookingStatusLabel(booking.status)}
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
              <span className="text-[13px] text-muted-foreground tnum">
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
