"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  type EventLevel,
  EventType,
  EventWhen,
} from "@/graphql/generated/graphql";

import { EmptyEvents } from "@/features/events/components/EmptyEvents";
import { EventCard } from "@/features/events/components/EventCard";
import { EventCardSkeleton } from "@/features/events/components/EventCardSkeleton";
import { EventFilters } from "@/features/events/components/EventFilters";
import { EventGrid } from "@/features/events/components/EventGrid";
import { useEvents } from "@/features/events/hooks";
import {
  DEFAULT_EVENT_FILTERS,
  type EventFilters as Filters,
  parseEventFilters,
  toEventPath,
  toEventSearchParams,
  toEventTypeLabel,
  toEventWhenLabel,
  toSeatsLabel,
} from "@/features/events/types";

export interface EventListContainerProps {
  heading: string;
  description: string;
}

export function EventListContainer({
  heading,
  description,
}: EventListContainerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => parseEventFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const {
    events,
    pageInfo,
    isInitialLoading,
    isFetchingMore,
    hasError,
    loadMore,
    refetch,
  } = useEvents(filters);

  const applyFilters = useCallback(
    (next: Filters) => {
      const query = toEventSearchParams(next).toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router],
  );

  const handleWhenChange = useCallback(
    (when: EventWhen) => applyFilters({ ...filters, when }),
    [applyFilters, filters],
  );
  // Level only applies to workshops, so it clears whenever the type changes.
  const handleEventTypeChange = useCallback(
    (eventType: EventType | null) =>
      applyFilters({ ...filters, eventType, level: null }),
    [applyFilters, filters],
  );
  const handleLevelChange = useCallback(
    (level: EventLevel | null) => applyFilters({ ...filters, level }),
    [applyFilters, filters],
  );
  const handleClearFilters = useCallback(
    () => applyFilters(DEFAULT_EVENT_FILTERS),
    [applyFilters],
  );

  const isPast = filters.when === EventWhen.Past;
  const hasFilters =
    filters.eventType !== null ||
    filters.level !== null ||
    filters.when !== DEFAULT_EVENT_FILTERS.when;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-6 md:py-12">
      <header className="flex flex-col gap-3">
        <h1 className="font-heading text-4xl leading-tight tracking-tight md:text-6xl">
          {heading}
        </h1>
        <p className="max-w-xl text-[15px] text-muted-foreground">
          {description}
        </p>
      </header>

      <EventFilters
        when={filters.when}
        eventType={filters.eventType}
        level={filters.level}
        isLevelShown={filters.eventType === EventType.PotteryWorkshop}
        onWhenChange={handleWhenChange}
        onEventTypeChange={handleEventTypeChange}
        onLevelChange={handleLevelChange}
      />

      {isInitialLoading ? (
        <EventGrid>
          {Array.from({ length: 6 }, (_, index) => (
            <EventCardSkeleton key={index} />
          ))}
        </EventGrid>
      ) : hasError ? (
        <div className="flex flex-col items-start gap-4 border-t border-ash py-16">
          <h2 className="font-heading text-2xl tracking-tight">
            The calendar did not load
          </h2>
          <p className="max-w-sm text-[15px] text-muted-foreground">
            Something went wrong on our side.
          </p>
          <Button variant="outline" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      ) : events.length === 0 ? (
        <EmptyEvents
          isPast={isPast}
          hasFilters={hasFilters}
          onClearFilters={handleClearFilters}
        />
      ) : (
        <>
          <EventGrid>
            {events.map((event, index) => (
              <EventCard
                key={event.id}
                href={toEventPath(event.slug)}
                title={event.title}
                imageUrl={event.image_url}
                dateLabel={toEventWhenLabel(event.starts_at)}
                typeLabel={toEventTypeLabel(event.event_type)}
                seatsLabel={
                  event.is_past
                    ? "Wrapped up"
                    : toSeatsLabel(event.available_seats, event.total_seats)
                }
                price={event.price}
                isPast={event.is_past}
                isPriority={index < 3}
              />
            ))}
          </EventGrid>
          {pageInfo && (
            <div className="flex flex-col items-center gap-4 border-t border-ash py-10">
              <p className="text-[13px] text-muted-foreground tnum">
                Showing {events.length} of {pageInfo.total}
              </p>
              {pageInfo.has_more && (
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={isFetchingMore}
                >
                  {isFetchingMore ? "Loading…" : "Show more dates"}
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
