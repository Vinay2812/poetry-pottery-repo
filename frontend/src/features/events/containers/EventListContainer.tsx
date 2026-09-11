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
  isLowSeats,
  parseEventFilters,
  toDateBadge,
  toEventPath,
  toEventSearchParams,
  toEventTypeLabel,
  toLevelLabel,
  toSeatsLabel,
  toTimeRange,
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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl md:text-5xl">{heading}</h1>
        <p className="max-w-2xl text-muted-foreground">{description}</p>
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
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-cream px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            We could not load the calendar just now.
          </p>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => void refetch()}
          >
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
            {events.map((event, index) => {
              const badge = toDateBadge(event.starts_at);
              return (
                <EventCard
                  key={event.id}
                  href={toEventPath(event.slug)}
                  title={event.title}
                  imageUrl={event.image_url}
                  day={badge.day}
                  month={badge.month}
                  weekday={badge.weekday}
                  typeLabel={toEventTypeLabel(event.event_type)}
                  levelLabel={toLevelLabel(event.level)}
                  timeRange={toTimeRange(event.starts_at, event.ends_at)}
                  location={event.location}
                  price={event.price}
                  seatsLabel={toSeatsLabel(
                    event.available_seats,
                    event.total_seats,
                  )}
                  isSeatsLow={isLowSeats(event.available_seats)}
                  isSoldOut={event.available_seats <= 0}
                  isPast={event.is_past}
                  isPriority={index < 3}
                />
              );
            })}
          </EventGrid>
          {pageInfo && (
            <div className="flex flex-col items-center gap-3 py-4">
              <p className="text-xs text-muted-foreground">
                Showing {events.length} of {pageInfo.total}
              </p>
              {pageInfo.has_more && (
                <Button
                  variant="outline"
                  className="rounded-full"
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
