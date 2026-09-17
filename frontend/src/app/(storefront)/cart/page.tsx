import type { Metadata } from "next";

import { CartContainer } from "@/features/cart";

export const metadata: Metadata = { title: "Cart", robots: { index: false } };

export default function CartPage() {
  return <CartContainer />;
}
