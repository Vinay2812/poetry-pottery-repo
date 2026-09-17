import type { Metadata } from "next";

import { OrdersListContainer } from "@/features/orders";

export const metadata: Metadata = {
  title: "Your orders",
  robots: { index: false },
};

export default function OrdersPage() {
  return <OrdersListContainer />;
}
