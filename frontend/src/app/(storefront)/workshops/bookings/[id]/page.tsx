import type { Metadata } from "next";

import { getSiteSettings } from "@/lib/data/site-settings";

import { BookingDetailContainer } from "@/features/workshops";

export const metadata: Metadata = {
  title: "Session details",
  robots: { index: false },
};

export default async function WorkshopBookingPage({
  params,
  searchParams,
}: PageProps<"/workshops/bookings/[id]">) {
  const [{ id }, query, settings] = await Promise.all([
    params,
    searchParams,
    getSiteSettings(),
  ]);
  return (
    <BookingDetailContainer
      bookingId={id}
      isJustPlaced={query.placed === "1"}
      whatsappNumber={settings.whatsapp_number}
    />
  );
}
