"use client";

import { useClerk } from "@clerk/nextjs";
import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/PageShell";
import { PageTurnFailed } from "@/components/layout/PageTurnFailed";
import { cn } from "@/lib/utils";
import {
  isRegistrationClosed,
  toRegistrationStatusLabel,
} from "@/lib/registration-status";

import { SignInWall } from "@/features/auth/components/SignInWall";
import { EmptyRegistrations } from "@/features/events/components/EmptyRegistrations";
import { RegistrationCard } from "@/features/events/components/RegistrationCard";
import { useMyRegistrations } from "@/features/events/hooks";
import {
  toEventTypeLabel,
  toEventWhenLabel,
  toRegistrationGroups,
  toRegistrationPath,
} from "@/features/events/types";

export interface RegistrationsListContainerProps {
  // ISO time the server rendered at. Fixed on purpose: a list does not need to regroup itself live.
  now: string;
}

export function RegistrationsListContainer({
  now: renderedAt,
}: RegistrationsListContainerProps) {
  const now = new Date(renderedAt);
  const [page, setPage] = useState(1);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const {
    registrations,
    pageInfo,
    shownPage,
    failedPage,
    isLoading,
    isPaging,
    hasError,
    isSignedIn,
    refetch,
  } = useMyRegistrations(page);
  // The old page stays on screen while the next loads, so jumping to the top at once is safe.
  // Asking again for the page that failed reads it again rather than doing nothing.
  const handlePageChange = useCallback(
    (next: number) => {
      if (next === page) void refetch();
      else setPage(next);
      headingRef.current?.scrollIntoView({ block: "start" });
    },
    [page, refetch],
  );
  const pageCount = pageInfo ? Math.ceil(pageInfo.total / pageInfo.limit) : 1;
  const { openSignIn } = useClerk();

  // The wall is the whole page when it shows, so it carries the h1 rather than
  // sitting under a heading for a list that is not there.
  if (!isLoading && !isSignedIn) {
    return (
      <SignInWall
        message="Sign in to see your events"
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
        Your events
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
            Your events did not load
          </h2>
          <Button variant="outline" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      ) : registrations.length === 0 ? (
        <EmptyRegistrations />
      ) : (
        <>
          <div
            aria-busy={isPaging}
            className={cn(
              "flex flex-col gap-10 transition-opacity duration-200",
              isPaging && "opacity-60",
            )}
          >
            {toRegistrationGroups(registrations, now).map((group) => (
              <section key={group.key} className="flex flex-col gap-3">
                <h2 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                  {group.heading}
                </h2>
                <div className="flex flex-col border-t border-ash">
                  {group.registrations.map((registration) => (
                    <RegistrationCard
                      key={registration.id}
                      href={toRegistrationPath(registration.id)}
                      eventTitle={registration.event.title}
                      imageUrl={registration.event.image_url}
                      typeLabel={toEventTypeLabel(
                        registration.event.event_type,
                      )}
                      dateLabel={toEventWhenLabel(registration.event.starts_at)}
                      seats={registration.seats}
                      total={registration.total}
                      statusLabel={toRegistrationStatusLabel(
                        registration.status,
                      )}
                      isClosed={isRegistrationClosed(registration.status)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
          {/* The API sends bookings still ahead first, soonest first, then the record, so page one holds what is next. */}
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
          {failedPage !== null && (
            <PageTurnFailed
              page={failedPage}
              onRetry={() => handlePageChange(failedPage)}
            />
          )}
        </>
      )}
    </PageShell>
  );
}
