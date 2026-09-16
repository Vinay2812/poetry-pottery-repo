import type { Metadata } from "next";

import { PageShell } from "@/components/layout/PageShell";

import { AddressBookContainer } from "@/features/addresses";

export const metadata: Metadata = {
  title: "Your addresses",
  robots: { index: false },
};

export default function AddressesPage() {
  return (
    <PageShell column="wide" className="flex flex-col gap-6 py-8 md:py-12">
      <h1 className="font-heading text-3xl md:text-5xl">Your addresses</h1>
      <AddressBookContainer />
    </PageShell>
  );
}
