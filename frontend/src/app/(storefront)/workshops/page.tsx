import type { Metadata } from "next";
import Link from "next/link";

import { getWorkshops } from "@/lib/data/catalog";
import { getSiteSettings } from "@/lib/data/site-settings";

import { PageShell } from "@/components/layout/PageShell";

import {
  toWorkshopPath,
  WorkshopBookingContainer,
  WorkshopIntro,
} from "@/features/workshops";

export const metadata: Metadata = {
  title: "Book a wheel session",
  description:
    "Book an hour or more at the wheel in our Sangli studio. Clay, tools and firing are part of the price.",
};

export default async function WorkshopsPage() {
  const [workshops, settings] = await Promise.all([
    getWorkshops(),
    getSiteSettings(),
  ]);
  const only = workshops.length === 1 ? workshops[0] : null;

  if (only) {
    return (
      <WorkshopBookingContainer
        workshop={only}
        whatsappNumber={settings.whatsapp_number}
      />
    );
  }

  return (
    <PageShell className="flex flex-col gap-16 py-8 md:py-12">
      {workshops.length === 0 ? (
        <div className="flex flex-col items-start gap-4 border-t border-ash py-16">
          <h1 className="font-heading text-3xl tracking-tight">
            No wheel sessions just now
          </h1>
          <p className="max-w-sm text-[15px] text-muted-foreground">
            The studio is between batches. Write to us and we will find a day.
          </p>
          <Link
            href="/events"
            className="w-fit border-b border-ink pb-0.5 text-[13px] hover:border-primary hover:text-primary"
          >
            See workshops and open mics
          </Link>
        </div>
      ) : (
        workshops.map((workshop) => (
          <WorkshopIntro
            key={workshop.id}
            name={workshop.name}
            description={workshop.description}
            imageUrl={workshop.image_url}
            tiers={workshop.tiers}
            href={toWorkshopPath(workshop.slug)}
          />
        ))
      )}
    </PageShell>
  );
}
