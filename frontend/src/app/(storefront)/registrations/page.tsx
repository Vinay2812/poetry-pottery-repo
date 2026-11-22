import type { Metadata } from "next";
import { connection } from "next/server";

import { RegistrationsListContainer } from "@/features/events";

export const metadata: Metadata = {
  title: "Your events",
  robots: { index: false },
};

export default async function RegistrationsPage() {
  // Rendered per request, so the time that groups bookings is now and not the build's.
  await connection();
  return <RegistrationsListContainer now={new Date().toISOString()} />;
}
