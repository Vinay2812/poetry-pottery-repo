import { notFound } from "next/navigation";

import { EventDetailContainer } from "@/features/admin/events";

export default async function AdminEventPage({
  params,
}: PageProps<"/dashboard/events/[id]">) {
  const { id } = await params;
  const eventId = Number.parseInt(id, 10);

  if (!Number.isInteger(eventId) || eventId <= 0) {
    notFound();
  }

  return <EventDetailContainer eventId={eventId} />;
}
