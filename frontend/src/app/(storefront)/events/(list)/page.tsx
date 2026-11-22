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
  title: "Events",
  path: "/events",
  description:
    "Pottery workshops and open mic evenings at the Poetry & Pottery studio in Sangli. Small groups, clay and tools included.",
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
        heading="Events"
        description="Workshops and open mics in small groups at the studio. Most workshop seats include clay, tools and firing, and we confirm every seat on WhatsApp."
        initialEvents={firstPage}
        initialFilterKey={toEventsFilterKey(filterInput)}
        now={new Date().toISOString()}
      />
    </Suspense>
  );
}
