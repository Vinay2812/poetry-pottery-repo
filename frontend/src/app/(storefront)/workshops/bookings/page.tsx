import type { Metadata } from "next";
import { Suspense } from "react";

import { BookingsListContainer } from "@/features/workshops";

import Loading from "./loading";

export const metadata: Metadata = {
  title: "Your wheel sessions",
  robots: { index: false },
};

// The page number lives in the query string, which is only known in the browser.
export default function WorkshopBookingsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <BookingsListContainer />
    </Suspense>
  );
}
