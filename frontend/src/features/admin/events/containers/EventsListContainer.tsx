"use client";

import Link from "next/link";
import { useCallback, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { useQuery } from "@apollo/client/react";
import {
  AdminEventsDocument,
  EventStatus,
  EventType,
} from "@/graphql/generated/graphql";

import { describeError } from "@/lib/apollo/errors";
import { formatInr } from "@/lib/format";

import {
  formatEnumLabel,
  useAdminQueryState,
  useSearchDraft,
} from "@/features/admin/shell";
import {
  AdminLoadError,
  AdminPageHeader,
  AdminPagination,
  AdminSearchField,
  AdminSelectFilter,
  AdminToolbar,
  enumOptions,
  eventStatusTone,
  retryQuery,
} from "@/features/admin/ui";
import {
  AdminPersonFilterNotice,
  usePersonFilter,
} from "@/features/admin/people";

import {
  EventsTable,
  type EventTableRow,
} from "@/features/admin/events/components/EventsTable";
import {
  describeSeats,
  describeWhen,
  toEventAwaitingFilterPatch,
  toEventHref,
  toEventStatus,
  toEventStatusFilterPatch,
  toEventType,
} from "@/features/admin/events/types";

const PAGE_SIZE = 20;
const STATUS_OPTIONS = enumOptions(EventStatus);
const TYPE_OPTIONS = enumOptions(EventType);
const REQUEST_OPTIONS = [{ value: "1", label: "Waiting on you" }];

export function EventsListContainer() {
  const { values, page, isPending, patch } = useAdminQueryState();
  const search = values.search ?? "";
  const status = values.status ?? "";
  const eventType = values.event_type ?? "";
  const isAwaitingFilter = values.awaiting === "1";
  const { personId, personName } = usePersonFilter(values.user);

  const commitSearch = useCallback(
    (value: string) => patch({ search: value || null }),
    [patch],
  );
  const [searchDraft, handleSearchChange] = useSearchDraft(
    search,
    commitSearch,
  );

  const { data, previousData, loading, error, refetch } = useQuery(
    AdminEventsDocument,
    {
      variables: {
        filter: {
          search: search || null,
          status: toEventStatus(status),
          event_type: toEventType(eventType),
          user_id: personId,
          awaiting_approval: isAwaitingFilter || null,
          page,
          limit: PAGE_SIZE,
        },
      },
      fetchPolicy: "cache-and-network",
    },
  );

  const result = data?.adminEvents ?? previousData?.adminEvents;

  const rows = useMemo<EventTableRow[]>(
    () =>
      (result?.items ?? []).map((event) => ({
        id: event.id,
        href: toEventHref(event.id, isAwaitingFilter),
        title: event.title,
        imageUrl: event.image_url,
        typeLabel: formatEnumLabel(event.event_type),
        statusLabel: formatEnumLabel(event.status),
        statusTone: eventStatusTone(event.status),
        whenLabel: describeWhen(event.starts_at, event.ends_at),
        location: event.location,
        priceLabel: formatInr(event.price),
        seatsLabel: describeSeats(event.available_seats, event.total_seats),
      })),
    [isAwaitingFilter, result],
  );

  const pageInfo = result?.page_info;

  // Only a successful answer earns the empty row.
  const loadError =
    error && !data
      ? describeError(error, "The events could not be loaded.")
      : null;

  return (
    <div className="flex flex-col gap-2">
      <AdminPageHeader
        eyebrow="Studio"
        title="Events"
        description="Workshops and open mics, and who has a seat."
        actions={
          <Button asChild size="sm">
            <Link href="/dashboard/events/new">New event</Link>
          </Button>
        }
      />
      <AdminToolbar>
        <AdminSearchField
          id="events-search"
          label="Search"
          placeholder="Title or location"
          value={searchDraft}
          onChange={handleSearchChange}
        />
        <AdminSelectFilter
          id="events-status"
          label="Status"
          anyLabel="Any status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(value) => patch(toEventStatusFilterPatch(value))}
        />
        <AdminSelectFilter
          id="events-type"
          label="Type"
          anyLabel="Any type"
          options={TYPE_OPTIONS}
          value={eventType}
          onChange={(value) => patch({ event_type: value || null })}
        />
        <AdminSelectFilter
          id="events-requests"
          label="Requests"
          anyLabel="All events"
          options={REQUEST_OPTIONS}
          value={isAwaitingFilter ? "1" : ""}
          onChange={(value) => patch(toEventAwaitingFilterPatch(value, status))}
        />
      </AdminToolbar>
      {personId !== null && (
        <AdminPersonFilterNotice
          line={
            personName
              ? `Events ${personName} registered for`
              : "Events one person registered for"
          }
          onClear={() => patch({ user: null })}
        />
      )}
      {loadError ? (
        <AdminLoadError
          message={loadError}
          isRetrying={loading}
          onRetry={retryQuery(refetch)}
        />
      ) : result === undefined ? (
        <div aria-busy="true" className="h-64 animate-pulse bg-ash" />
      ) : (
        <>
          <EventsTable rows={rows} isBusy={isPending || loading} />
          <AdminPagination
            page={pageInfo?.page ?? page}
            limit={pageInfo?.limit ?? PAGE_SIZE}
            total={pageInfo?.total ?? 0}
            hasMore={pageInfo?.has_more ?? false}
            onPageChange={(next) => patch({ page: String(next) })}
          />
        </>
      )}
    </div>
  );
}
