import { Reveal } from "@/components/motion/Reveal";
import { PageShell } from "@/components/layout/PageShell";
import { getSiteSettings } from "@/lib/data/site-settings";

import { ContactDetails } from "@/features/content/components/ContactDetails";
import { ContactPanel } from "@/features/content/components/ContactPanel";
import { ContentHeader } from "@/features/content/components/ContentHeader";
import { ContactFormContainer } from "@/features/content/containers/ContactFormContainer";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { StudioVisitContainer, VisitIntro } from "@/features/visits";

// Both rows share one grid, so the visit picker starts where the form starts; the picker caps its own width.
const CONTACT_ROW =
  "grid gap-10 border-t border-ash py-10 md:grid-cols-[minmax(0,20rem)_1fr] md:gap-16 md:py-12";

export async function ContactPageContainer() {
  const settings = await getSiteSettings();
  const whatsappUrl = settings.whatsapp_number
    ? buildWhatsAppUrl(
        settings.whatsapp_number,
        "Hi, I have a question about Poetry & Pottery.",
      )
    : null;

  return (
    <PageShell>
      <Reveal>
        <ContentHeader
          title="Come by, or write to us"
          subtitle="We are at the studio most days and answer messages within a day."
        />
      </Reveal>
      <Reveal>
        <div className={CONTACT_ROW}>
          <ContactDetails
            address={settings.address}
            openingHours={settings.opening_hours}
            contactPhone={settings.contact_phone}
            contactEmail={settings.contact_email}
            whatsappUrl={whatsappUrl}
            instagramUrl={settings.instagram_url}
            facebookUrl={settings.facebook_url}
          />
          <ContactPanel label="Write to us">
            <ContactFormContainer />
          </ContactPanel>
        </div>
      </Reveal>
      <Reveal>
        <div className={CONTACT_ROW}>
          <VisitIntro />
          <StudioVisitContainer />
        </div>
      </Reveal>
    </PageShell>
  );
}
