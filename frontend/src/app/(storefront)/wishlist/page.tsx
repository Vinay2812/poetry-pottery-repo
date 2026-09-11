import type { Metadata } from "next";

import { WishlistContainer } from "@/features/wishlist";

export const metadata: Metadata = {
  title: "Saved pieces",
  robots: { index: false },
};

export default function WishlistPage() {
  return <WishlistContainer />;
}
