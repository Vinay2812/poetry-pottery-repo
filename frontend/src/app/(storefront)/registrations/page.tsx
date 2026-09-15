import type { Metadata } from "next";

import { RegistrationsListContainer } from "@/features/events";

export const metadata: Metadata = {
  title: "Your bookings",
  robots: { index: false },
};

export default function RegistrationsPage() {
  return <RegistrationsListContainer />;
}
