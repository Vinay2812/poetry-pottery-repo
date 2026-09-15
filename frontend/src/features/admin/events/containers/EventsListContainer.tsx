"use client";

import Link from "next/link";
import { useCallback, useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  EventStatus,
  EventType,
  useAdminEventsQuery,
} from "@/graphql/generated/graphql";

import { formatInr } from "@/lib/format";

import {
  formatEnumLabel,
  useAdminQueryState,
  useSearchDraft,
} from "@/features/admin/shell";
import {
  AdminPageHeader,
  AdminPagination,
  AdminSearchField,
  AdminSelectFilter,
  AdminToolbar,
  enumOptions,
  eventStatusTone,
} from "@/features/admin/ui";

import {
  EventsTable,
  type EventTableRow,
} from "@/features/admin/events/components/EventsTable";
import {
  describeSeats,
  describeWhen,
  toEventStatus,
  toEventType,
} from "@/features/admin/events/types";

const PAGE_SIZE = 20;
const STATUS_OPTIONS = enumOptions(EventStatus);
const TYPE_OPTIONS = enumOptions(EventType);

export function EventsListContainer() {
  const { values, page, isPending, patch } = useAdminQueryState();
  const search = values.search ?? "";
  const status = values.status ?? "";
  const eventType = values.event_type ?? "";

  const commitSearch = useCallback(
    (value: string) => patch({ search: value || null }),
    [patch],
  );
  const [searchDraft, handleSearchChange] = useSearchDraft(
    search,
    commitSearch,
  );

  const { data, previousData, loading } = useAdminEventsQuery({
    variables: {
      filter: {
        search: search || null,
        status: toEventStatus(status),
        event_type: toEventType(eventType),
        page,
        limit: PAGE_SIZE,
      },
    },
    fetchPolicy: "cache-and-network",
  });

  const result = data?.adminEvents ?? previousData?.adminEvents;

  const rows = useMemo<EventTableRow[]>(
    () =>
      (result?.items ?? []).map((event) => ({
        id: event.id,
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
    [result],
  );

  const pageInfo = result?.page_info;

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
          onChange={(value) => patch({ status: value || null })}
        />
        <AdminSelectFilter
          id="events-type"
          label="Type"
          anyLabel="Any type"
          options={TYPE_OPTIONS}
          value={eventType}
          onChange={(value) => patch({ event_type: value || null })}
        />
      </AdminToolbar>
      <EventsTable rows={rows} isBusy={isPending || loading} />
      <AdminPagination
        page={pageInfo?.page ?? page}
        limit={pageInfo?.limit ?? PAGE_SIZE}
        total={pageInfo?.total ?? 0}
        hasMore={pageInfo?.has_more ?? false}
        onPageChange={(next) => patch({ page: String(next) })}
      />
    </div>
  );
}
