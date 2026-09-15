import type { Metadata } from "next";

import { AdminOrderDetailContainer } from "@/features/admin/orders";

export const metadata: Metadata = {
  title: "Order",
};

export default async function AdminOrderPage({
  params,
}: PageProps<"/dashboard/orders/[id]">) {
  const { id } = await params;
  return <AdminOrderDetailContainer orderId={id} />;
}
