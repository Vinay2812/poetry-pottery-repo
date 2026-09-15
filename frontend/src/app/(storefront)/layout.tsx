import { getSiteSettings } from "@/lib/data/site-settings";

import { SignInPromptContainer } from "@/features/auth";
import {
  AnnouncementBar,
  buildWhatsAppUrl,
  FOOTER_HELP_LINKS,
  FOOTER_SHOP_LINKS,
  FOOTER_STUDIO_LINKS,
  MobileNavContainer,
  SiteFooter,
  SiteHeaderContainer,
} from "@/features/layout";

export default async function StorefrontLayout({ children }: LayoutProps<"/">) {
  const settings = await getSiteSettings();

  return (
    <>
      {settings.announcement_text && (
        <AnnouncementBar
          text={settings.announcement_text}
          href={settings.announcement_href}
        />
      )}
      <SiteHeaderContainer />
      <main className="flex flex-1 flex-col pb-16 lg:pb-0">{children}</main>
      <SiteFooter
        shopLinks={FOOTER_SHOP_LINKS}
        studioLinks={FOOTER_STUDIO_LINKS}
        helpLinks={FOOTER_HELP_LINKS}
        address={settings.address}
        openingHours={settings.opening_hours}
        contactEmail={settings.contact_email}
        contactPhone={settings.contact_phone}
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
        youtubeUrl={settings.youtube_url}
        year={new Date().getFullYear()}
      />
      <MobileNavContainer />
      <SignInPromptContainer />
    </>
  );
}
