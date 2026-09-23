import type { Metadata } from "next";
import { Suspense } from "react";

import { getEventsPage } from "@/lib/data/catalog";
import { toUrlSearchParams } from "@/lib/search-params";
import { pageMetadata } from "@/lib/seo";

import {
  EventListContainer,
  parseEventFilters,
  toEventsFilterInput,
  toEventsFilterKey,
} from "@/features/events";
import Loading from "./loading";

export const metadata: Metadata = pageMetadata({
  title: "Workshops and open mics",
  path: "/events",
  description:
    "Wheel workshops and open mic evenings at the Poetry & Pottery studio in Sangli. Small groups, clay and tools included.",
});

export default async function EventsPage({
  searchParams,
}: PageProps<"/events">) {
  // The first page is rendered here so crawlers and the first paint get the cards, not a skeleton.
  const filterInput = toEventsFilterInput(
    parseEventFilters(toUrlSearchParams(await searchParams)),
    1,
  );
  const firstPage = await getEventsPage(filterInput);

  return (
    <Suspense fallback={<Loading />}>
      <EventListContainer
        heading="Workshops and open mics"
        description="Small groups at the studio. Clay, tools and firing are part of the seat price, and we confirm every booking on WhatsApp."
        initialEvents={firstPage}
        initialFilterKey={toEventsFilterKey(filterInput)}
      />
    </Suspense>
  );
}
