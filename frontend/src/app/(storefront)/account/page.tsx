import type { Metadata } from "next";

import { AccountContainer } from "@/features/account";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false },
};

export default function AccountPage() {
  return <AccountContainer />;
}
