import type { Metadata } from "next";

import { AddressBookContainer } from "@/features/addresses";

export const metadata: Metadata = {
  title: "Your addresses",
  robots: { index: false },
};

export default function AddressesPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 md:px-8 md:py-12">
      <h1 className="font-heading text-3xl md:text-5xl">Your addresses</h1>
      <AddressBookContainer />
    </div>
  );
}
