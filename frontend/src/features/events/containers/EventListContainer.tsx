"use client";

import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/PageShell";
import { useUrlState } from "@/lib/use-url-state";
import { cn } from "@/lib/utils";
import {
  type EventLevel,
  type EventsQuery,
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
  EVENT_FILTERS_CODEC,
  toEventPath,
  toEventTypeLabel,
  toEventWhenLabel,
  toSeatsLabel,
} from "@/features/events/types";

export interface EventListContainerProps {
  heading: string;
  description: string;
  initialEvents?: EventsQuery["events"] | null;
  initialFilterKey?: string | null;
}

export function EventListContainer({
  heading,
  description,
  initialEvents = null,
  initialFilterKey = null,
}: EventListContainerProps) {
  // The chips answer on the click; the URL and the grid catch up inside the transition.
  const {
    value: filters,
    isPending: isFiltering,
    dispatch,
  } = useUrlState(EVENT_FILTERS_CODEC);
  const {
    events,
    pageInfo,
    isInitialLoading,
    isFetchingMore,
    hasError,
    loadMore,
    refetch,
  } = useEvents(filters, initialEvents, initialFilterKey);

  const handleWhenChange = useCallback(
    (when: EventWhen) => dispatch({ when }),
    [dispatch],
  );
  // Level only applies to workshops, so it clears whenever the type changes.
  const handleEventTypeChange = useCallback(
    (eventType: EventType | null) => dispatch({ eventType, level: null }),
    [dispatch],
  );
  const handleLevelChange = useCallback(
    (level: EventLevel | null) => dispatch({ level }),
    [dispatch],
  );
  const handleClearFilters = useCallback(
    () => dispatch(DEFAULT_EVENT_FILTERS),
    [dispatch],
  );

  const isPast = filters.when === EventWhen.Past;
  const hasFilters =
    filters.eventType !== null ||
    filters.level !== null ||
    filters.when !== DEFAULT_EVENT_FILTERS.when;

  return (
    <PageShell className="flex flex-col gap-8 py-8 md:py-12">
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
        <div
          aria-busy={isFiltering}
          className={cn(
            "flex flex-col gap-8 transition-opacity duration-200",
            isFiltering && "opacity-60",
          )}
        >
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
        </div>
      )}
    </PageShell>
  );
}
