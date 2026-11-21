import type { Metadata } from "next";
import { Suspense } from "react";

import { OrdersListContainer } from "@/features/orders";

import Loading from "./loading";

export const metadata: Metadata = {
  title: "Your orders",
  robots: { index: false },
};

// The page number lives in the query string, which is only known in the browser.
export default function OrdersPage() {
  return (
    <Suspense fallback={<Loading />}>
      <OrdersListContainer />
    </Suspense>
  );
}
