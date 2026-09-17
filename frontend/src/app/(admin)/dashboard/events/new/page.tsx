import type { Metadata } from "next";

import { EMPTY_EVENT_FORM, EventFormContainer } from "@/features/admin/events";
import { AdminPageHeader } from "@/features/admin/ui";

export const metadata: Metadata = { title: "New event" };

export default function AdminNewEventPage() {
  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Events"
        title="New event"
        description="Save it as a draft, then publish once the date is set."
      />
      <EventFormContainer
        eventId={null}
        defaultValues={EMPTY_EVENT_FORM}
        submitLabel="Create event"
      />
    </div>
  );
}
