"use client";

import { useClerk } from "@clerk/nextjs";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/PageShell";
import { cn } from "@/lib/utils";

import { SignInWall } from "@/features/auth/components/SignInWall";
import { EmptyRegistrations } from "@/features/events/components/EmptyRegistrations";
import { RegistrationCard } from "@/features/events/components/RegistrationCard";
import { useMyRegistrations } from "@/features/events/hooks";
import {
  isRegistrationClosed,
  type RegistrationGroup,
  toEventTypeLabel,
  toEventWhenLabel,
  toRegistrationGroup,
  toRegistrationPath,
  toRegistrationStatusLabel,
} from "@/features/events/types";

const GROUPS: { key: RegistrationGroup; heading: string }[] = [
  { key: "upcoming", heading: "Upcoming" },
  { key: "past", heading: "Past and cancelled" },
];

export function RegistrationsListContainer() {
  const [page, setPage] = useState(1);
  const {
    registrations,
    pageInfo,
    isLoading,
    isPaging,
    hasError,
    isSignedIn,
    refetch,
  } = useMyRegistrations(page);
  const pageCount = pageInfo ? Math.ceil(pageInfo.total / pageInfo.limit) : 1;
  const { openSignIn } = useClerk();

  // The wall is the whole page when it shows, so it carries the h1 rather than
  // sitting under a heading for a list that is not there.
  if (!isLoading && !isSignedIn) {
    return (
      <SignInWall
        message="Sign in to see your bookings"
        onSignIn={() => openSignIn()}
      />
    );
  }

  return (
    <PageShell column="wide" className="flex flex-col gap-8 py-8 md:py-12">
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
          <div
            aria-busy={isPaging}
            className={cn(
              "flex flex-col gap-10 transition-opacity duration-200",
              isPaging && "opacity-60",
            )}
          >
            {GROUPS.map(({ key, heading }) => {
              const group = registrations.filter(
                (registration) => toRegistrationGroup(registration) === key,
              );
              if (group.length === 0) return null;
              return (
                <section key={key} className="flex flex-col gap-3">
                  <h2 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                    {heading}
                  </h2>
                  <div className="flex flex-col border-t border-ash">
                    {group.map((registration) => (
                      <RegistrationCard
                        key={registration.id}
                        href={toRegistrationPath(registration.id)}
                        eventTitle={registration.event.title}
                        imageUrl={registration.event.image_url}
                        typeLabel={toEventTypeLabel(
                          registration.event.event_type,
                        )}
                        dateLabel={toEventWhenLabel(
                          registration.event.starts_at,
                        )}
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
    </PageShell>
  );
}
