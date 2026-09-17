import type { Metadata } from "next";

import { getSiteSettings } from "@/lib/data/site-settings";

import { RegistrationDetailContainer } from "@/features/events";

export const metadata: Metadata = {
  title: "Booking details",
  robots: { index: false },
};

export default async function RegistrationPage({
  params,
  searchParams,
}: PageProps<"/registrations/[id]">) {
  const [{ id }, query, settings] = await Promise.all([
    params,
    searchParams,
    getSiteSettings(),
  ]);
  return (
    <RegistrationDetailContainer
      registrationId={id}
      isJustPlaced={query.placed === "1"}
      whatsappNumber={settings.whatsapp_number}
    />
  );
}
