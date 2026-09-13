import type { Metadata } from "next";

import { CouponsContainer } from "@/features/admin/coupons";

export const metadata: Metadata = { title: "Coupons" };

export default function AdminCouponsPage() {
  return <CouponsContainer />;
}
