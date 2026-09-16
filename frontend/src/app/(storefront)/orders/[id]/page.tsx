import type { Metadata } from "next";

import { getSiteSettings } from "@/lib/data/site-settings";

import { OrderDetailContainer } from "@/features/orders";

export const metadata: Metadata = {
  title: "Order details",
  robots: { index: false },
};

export default async function OrderPage({
  params,
  searchParams,
}: PageProps<"/orders/[id]">) {
  const [{ id }, query, settings] = await Promise.all([
    params,
    searchParams,
    getSiteSettings(),
  ]);
  return (
    <OrderDetailContainer
      orderId={id}
      isJustPlaced={query.placed === "1"}
      whatsappNumber={settings.whatsapp_number}
      dispatchDaysMin={settings.dispatch_days_min}
      dispatchDaysMax={settings.dispatch_days_max}
    />
  );
}
