import type { Metadata } from "next";

import { BookingsListContainer } from "@/features/workshops";

export const metadata: Metadata = {
  title: "Your wheel sessions",
  robots: { index: false },
};

export default function WorkshopBookingsPage() {
  return <BookingsListContainer />;
}
