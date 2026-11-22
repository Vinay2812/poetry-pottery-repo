"use client";

import { useClerk } from "@clerk/nextjs";
import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/PageShell";
import { cn } from "@/lib/utils";

import { SignInWall } from "@/features/auth";
import { BookingCard } from "@/features/workshops/components/BookingCard";
import { BookingCardSkeleton } from "@/features/workshops/components/BookingCardSkeleton";
import { EmptyBookings } from "@/features/workshops/components/EmptyBookings";
import { NoUpcomingBookings } from "@/features/workshops/components/NoUpcomingBookings";
import { useMyWorkshopBookings } from "@/features/workshops/hooks";
import {
  formatDayRange,
  isBookingClosed,
  toBookingGroup,
  toBookingWhenLines,
  toBookingPath,
  toBookingStatusLabel,
} from "@/features/workshops/types";
import { SectionLabel } from "@/features/workshops/components/SectionLabel";

const GROUPS: { key: ReturnType<typeof toBookingGroup>; heading: string }[] = [
  { key: "upcoming", heading: "Upcoming" },
  { key: "past", heading: "Past and cancelled" },
];

export function BookingsListContainer() {
  const [page, setPage] = useState(1);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // The old page stays on screen while the next loads, so jumping to the top at once is safe.
  const handlePageChange = useCallback((next: number) => {
    setPage(next);
    headingRef.current?.scrollIntoView({ block: "start" });
  }, []);
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
    <PageShell column="wide" className="flex flex-col gap-8 py-8 md:py-12">
      <h1
        ref={headingRef}
        className="font-heading text-4xl leading-tight tracking-tight md:text-6xl"
      >
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
              // The API sends sessions still ahead first, soonest first, then the record, latest first,
              // so each group already arrives in reading order and holds across pages.
              const group = bookings.filter(
                (booking) =>
                  toBookingGroup(booking.slots, booking.status) === key,
              );
              if (group.length === 0) {
                // Sessions ahead lead page one, so a first page without one means there are none.
                return key === "upcoming" && page === 1 ? (
                  <NoUpcomingBookings key={key} />
                ) : null;
              }
              return (
                <section key={key} className="flex flex-col gap-3">
                  <SectionLabel>{heading}</SectionLabel>
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
                onClick={() => handlePageChange(page - 1)}
              >
                Previous
              </Button>
              <span className="text-[13px] text-muted-foreground tnum">
                Page {page} of {pageCount}
              </span>
              <Button
                variant="outline"
                disabled={page >= pageCount}
                onClick={() => handlePageChange(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}
