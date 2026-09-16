import type { Metadata } from "next";

import { Reveal } from "@/components/motion/Reveal";
import { PageShell } from "@/components/layout/PageShell";
import { getSiteSettings } from "@/lib/data/site-settings";

import {
  ContactDetails,
  ContactFormContainer,
  ContentHeader,
} from "@/features/content";
import { buildWhatsAppUrl } from "@/features/layout";
import { StudioVisitContainer } from "@/features/visits";

export const metadata: Metadata = {
  title: "Contact the studio",
  description:
    "Studio address, opening hours and a note to us about an order, a piece or a session.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <PageShell>
      <Reveal>
        <ContentHeader
          title="Come by, or write to us"
          subtitle="We are at the studio most days and answer messages within a day."
        />
      </Reveal>
      <Reveal>
        <div className="grid gap-10 border-t border-ash py-10 md:grid-cols-[minmax(0,320px)_1fr] md:gap-16 md:py-12">
          <ContactDetails
            address={settings.address}
            openingHours={settings.opening_hours}
            contactPhone={settings.contact_phone}
            contactEmail={settings.contact_email}
            whatsappUrl={
              settings.whatsapp_number
                ? buildWhatsAppUrl(
                    settings.whatsapp_number,
                    "Hi, I have a question about Poetry & Pottery.",
                  )
                : null
            }
            instagramUrl={settings.instagram_url}
            facebookUrl={settings.facebook_url}
          />
          <ContactFormContainer />
        </div>
      </Reveal>
      <Reveal>
        <div className="border-t border-ash py-10 md:py-12">
          <div className="max-w-xl">
            <StudioVisitContainer />
          </div>
        </div>
      </Reveal>
    </PageShell>
  );
}
