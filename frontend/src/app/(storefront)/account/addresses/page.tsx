import type { Metadata } from "next";

import { AddressBookContainer } from "@/features/addresses";

export const metadata: Metadata = {
  title: "Your addresses",
  robots: { index: false },
};

export default function AddressesPage() {
  return <AddressBookContainer />;
}
