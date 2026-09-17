import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getWorkshop } from "@/lib/data/catalog";

import { WorkshopBookingContainer } from "@/features/workshops";

export async function generateMetadata({
  params,
}: PageProps<"/workshops/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const workshop = await getWorkshop(slug);
  if (!workshop) return { title: "Session not found" };
  return {
    title: workshop.name,
    description: workshop.description?.slice(0, 160),
  };
}

export default async function WorkshopPage({
  params,
}: PageProps<"/workshops/[slug]">) {
  const { slug } = await params;
  const workshop = await getWorkshop(slug);
  if (!workshop) notFound();

  return <WorkshopBookingContainer workshop={workshop} />;
}
