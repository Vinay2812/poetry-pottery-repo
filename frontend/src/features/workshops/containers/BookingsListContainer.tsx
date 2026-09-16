"use client";

import { useClerk } from "@clerk/nextjs";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { SignInWall } from "@/features/auth";
import { BookingCard } from "@/features/workshops/components/BookingCard";
import { BookingCardSkeleton } from "@/features/workshops/components/BookingCardSkeleton";
import { EmptyBookings } from "@/features/workshops/components/EmptyBookings";
import { useMyWorkshopBookings } from "@/features/workshops/hooks";
import {
  formatDayRange,
  isBookingClosed,
  toBookingGroup,
  toBookingWhenLines,
  toBookingPath,
  toBookingStatusLabel,
} from "@/features/workshops/types";

const GROUPS: { key: ReturnType<typeof toBookingGroup>; heading: string }[] = [
  { key: "upcoming", heading: "Upcoming" },
  { key: "past", heading: "Past" },
];

export function BookingsListContainer() {
  const [page, setPage] = useState(1);
  const {
    bookings,
    pageInfo,
    isLoading,
    isPaging,
    hasError,
    isSignedIn,
    refetch,
  } = useMyWorkshopBookings(page);
  const pageCount = pageInfo ? Math.ceil(pageInfo.total / pageInfo.limit) : 1;
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
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
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
          <div
            aria-busy={isPaging}
            className={cn(
              "flex flex-col gap-10 transition-opacity duration-200",
              isPaging && "opacity-60",
            )}
          >
            {GROUPS.map(({ key, heading }) => {
              const group = bookings.filter(
                (booking) =>
                  toBookingGroup(booking.slots, booking.status) === key,
              );
              if (group.length === 0) return null;
              return (
                <section key={key} className="flex flex-col gap-3">
                  <h2 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                    {heading}
                  </h2>
                  <div className="flex flex-col border-t border-ash">
                    {group.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        href={toBookingPath(booking.id)}
                        dateLabel={formatDayRange(
                          booking.slots,
                          booking.config.timezone,
                        )}
                        whenLines={toBookingWhenLines(
                          booking.slots,
                          booking.config.timezone,
                        )}
                        hours={booking.hours}
                        participants={booking.participants}
                        total={booking.total}
                        statusLabel={toBookingStatusLabel(booking.status)}
                        isCancelled={isBookingClosed(booking.status)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
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
                Page {page} of {pageCount}
              </span>
              <Button
                variant="outline"
                disabled={page >= pageCount}
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
