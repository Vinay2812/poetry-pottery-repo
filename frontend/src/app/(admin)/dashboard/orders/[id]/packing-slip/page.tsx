import type { Metadata } from "next";

import { PackingSlipContainer } from "@/features/admin/orders";

export const metadata: Metadata = { title: "Packing slip" };

export default async function AdminPackingSlipPage({
  params,
}: PageProps<"/dashboard/orders/[id]/packing-slip">) {
  const { id } = await params;
  return <PackingSlipContainer orderId={id} />;
}
