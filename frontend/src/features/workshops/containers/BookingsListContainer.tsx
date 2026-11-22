"use client";

import { useClerk } from "@clerk/nextjs";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/PageShell";
import { PageTurnFailed } from "@/components/layout/PageTurnFailed";
import { PAGE_CODEC } from "@/lib/page-turn";
import { useFocusAfterTurn } from "@/lib/use-focus-after-turn";
import { useUrlState } from "@/lib/use-url-state";
import { cn } from "@/lib/utils";
import {
  isRegistrationClosed,
  toRegistrationStatusLabel,
} from "@/lib/registration-status";

import { SignInWall } from "@/features/auth";
import { BookingCard } from "@/features/workshops/components/BookingCard";
import { BookingCardSkeleton } from "@/features/workshops/components/BookingCardSkeleton";
import { EmptyBookings } from "@/features/workshops/components/EmptyBookings";
import { NoUpcomingBookings } from "@/features/workshops/components/NoUpcomingBookings";
import { useMyWorkshopBookings } from "@/features/workshops/hooks";
import {
  formatDayRange,
  toBookingGroup,
  toBookingWhenLines,
  toBookingPath,
} from "@/features/workshops/types";
import { SectionLabel } from "@/components/layout/SectionLabel";

const GROUPS: { key: ReturnType<typeof toBookingGroup>; heading: string }[] = [
  { key: "upcoming", heading: "Upcoming" },
  { key: "past", heading: "Past and cancelled" },
];

export function BookingsListContainer() {
  const {
    value: page,
    isPending: isTurning,
    dispatch: goToPage,
  } = useUrlState(PAGE_CODEC);

  const {
    bookings,
    pageInfo,
    shownPage,
    failedPage,
    isLoading,
    isPaging,
    hasError,
    isSignedIn,
    refetch,
  } = useMyWorkshopBookings(page);
  const { headingRef, startTurn } = useFocusAfterTurn<HTMLHeadingElement>(
    !isPaging && !isTurning,
    shownPage,
    failedPage,
  );
  // The old page stays on screen while the next loads, so jumping to the top at once is safe.
  // Asking again for the page that failed reads it again rather than doing nothing.
  const handlePageChange = useCallback(
    (next: number) => {
      if (next === page) void refetch();
      else goToPage(next);
      startTurn();
    },
    [goToPage, page, refetch, startTurn],
  );
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
        tabIndex={-1}
        className="font-heading text-3xl tracking-tight focus:outline-none md:text-5xl"
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
          {/* A page turn scrolls back to the heading, so the notice sits right under it. */}
          {failedPage !== null && (
            <PageTurnFailed
              page={failedPage}
              onRetry={() => handlePageChange(failedPage)}
            />
          )}
          <div
            aria-busy={isPaging || isTurning}
            className={cn(
              "flex flex-col gap-10 transition-opacity duration-200",
              (isPaging || isTurning) && "opacity-60",
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
                return key === "upcoming" && shownPage === 1 ? (
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
                        statusLabel={toRegistrationStatusLabel(
                          booking.status,
                          booking.total === 0,
                        )}
                        isClosed={isRegistrationClosed(booking.status)}
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
                disabled={shownPage <= 1}
                onClick={() => handlePageChange(shownPage - 1)}
              >
                Previous
              </Button>
              <span className="text-[13px] text-muted-foreground tnum">
                Page {shownPage} of {pageCount}
              </span>
              <Button
                variant="outline"
                disabled={shownPage >= pageCount}
                onClick={() => handlePageChange(shownPage + 1)}
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
