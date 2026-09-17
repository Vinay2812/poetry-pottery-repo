import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getEvent } from "@/lib/data/catalog";
import { getSiteSettings } from "@/lib/data/site-settings";

import { EventDetailContainer } from "@/features/events";

export async function generateMetadata({
  params,
}: PageProps<"/events/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return { title: "Session not found" };
  return {
    title: event.title,
    description: event.description.slice(0, 160),
    openGraph: { images: [event.image_url] },
  };
}

export default async function EventPage({
  params,
}: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const [event, settings] = await Promise.all([
    getEvent(slug),
    getSiteSettings(),
  ]);
  if (!event) notFound();

  return (
    <EventDetailContainer
      event={event}
      whatsappNumber={settings.whatsapp_number}
    />
  );
}
