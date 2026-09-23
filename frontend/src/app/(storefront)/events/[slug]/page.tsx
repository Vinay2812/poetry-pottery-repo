import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getEvent } from "@/lib/data/catalog";
import { getSiteSettings } from "@/lib/data/site-settings";
import { pageMetadata } from "@/lib/seo";
import { serializeJsonLd, toEventJsonLd } from "@/lib/structured-data";

import { JsonLd } from "@/components/seo/JsonLd";

import { EventDetailContainer, toEventPath } from "@/features/events";

export async function generateMetadata({
  params,
}: PageProps<"/events/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return { title: "Session not found" };
  return pageMetadata({
    title: event.title,
    path: toEventPath(slug),
    description: event.description,
    imageUrl: event.image_url,
  });
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
    <>
      <JsonLd json={serializeJsonLd(toEventJsonLd(event, toEventPath(slug)))} />
      <EventDetailContainer
        event={event}
        whatsappNumber={settings.whatsapp_number}
      />
    </>
  );
}
