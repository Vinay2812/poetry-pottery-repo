import type { Metadata } from "next";

import { EventsListContainer } from "@/features/admin/events";

export const metadata: Metadata = { title: "Events" };

export default function AdminEventsPage() {
  return <EventsListContainer />;
}
