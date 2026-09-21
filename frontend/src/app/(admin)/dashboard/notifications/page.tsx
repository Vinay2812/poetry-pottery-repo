import type { Metadata } from "next";

import { NotificationsContainer } from "@/features/admin/notifications";

export const metadata: Metadata = { title: "Waiting list" };

export default function AdminNotificationsPage() {
  return <NotificationsContainer />;
}
