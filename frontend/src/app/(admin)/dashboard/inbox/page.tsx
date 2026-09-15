import type { Metadata } from "next";
import { Suspense } from "react";

import { InboxContainer } from "@/features/admin/inbox";

export const metadata: Metadata = {
  title: "Inbox",
};

export default function AdminInboxPage() {
  return (
    <Suspense>
      <InboxContainer />
    </Suspense>
  );
}
