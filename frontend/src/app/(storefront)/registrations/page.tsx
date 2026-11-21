import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

import { RegistrationsListContainer } from "@/features/events";

import Loading from "./loading";

export const metadata: Metadata = {
  title: "Your events",
  robots: { index: false },
};

export default async function RegistrationsPage() {
  // Rendered per request, so the time that groups bookings is now and not the build's.
  await connection();
  // The page number lives in the query string, which is only known in the browser.
  return (
    <Suspense fallback={<Loading />}>
      <RegistrationsListContainer now={new Date().toISOString()} />
    </Suspense>
  );
}
