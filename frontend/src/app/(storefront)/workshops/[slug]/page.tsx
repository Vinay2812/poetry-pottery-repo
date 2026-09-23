import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getWorkshop } from "@/lib/data/catalog";
import { getSiteSettings } from "@/lib/data/site-settings";
import { pageMetadata } from "@/lib/seo";

import { toWorkshopPath, WorkshopBookingContainer } from "@/features/workshops";

export async function generateMetadata({
  params,
}: PageProps<"/workshops/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const workshop = await getWorkshop(slug);
  if (!workshop) return { title: "Session not found" };
  return pageMetadata({
    title: workshop.name,
    path: toWorkshopPath(slug),
    description: workshop.description,
    imageUrl: workshop.image_url,
  });
}

export default async function WorkshopPage({
  params,
}: PageProps<"/workshops/[slug]">) {
  const { slug } = await params;
  const [workshop, settings] = await Promise.all([
    getWorkshop(slug),
    getSiteSettings(),
  ]);
  if (!workshop) notFound();

  return (
    <WorkshopBookingContainer
      workshop={workshop}
      whatsappNumber={settings.whatsapp_number}
    />
  );
}
