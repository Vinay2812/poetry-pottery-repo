import type { Metadata } from "next";
import { Suspense } from "react";

import { EventListContainer } from "@/features/events";
import Loading from "./loading";

export const metadata: Metadata = {
  title: "Workshops and open mics",
  description:
    "Wheel workshops and open mic evenings at the Poetry & Pottery studio in Sangli. Small groups, clay and tools included.",
};

export default function EventsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <EventListContainer
        heading="Workshops and open mics"
        description="Small groups at the studio. Clay, tools and firing are part of the seat price, and we confirm every booking on WhatsApp."
      />
    </Suspense>
  );
}
