import type { Metadata } from "next";

import { AdminOrdersContainer } from "@/features/admin/orders";

export const metadata: Metadata = {
  title: "Orders",
};

export default function AdminOrdersPage() {
  return <AdminOrdersContainer />;
}
