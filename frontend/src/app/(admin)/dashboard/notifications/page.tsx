import type { Metadata } from "next";

import { NotificationsContainer } from "@/features/admin/notifications";

export const metadata: Metadata = { title: "Batch notifications" };

export default function AdminNotificationsPage() {
  return <NotificationsContainer />;
}
