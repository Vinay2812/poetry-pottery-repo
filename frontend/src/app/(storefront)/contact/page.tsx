import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";

import { ContactPageContainer } from "@/features/content";

export const metadata: Metadata = pageMetadata({
  title: "Contact the studio",
  path: "/contact",
  description:
    "Studio address, opening hours and a note to us about an order, a piece or a session.",
});

export default function ContactPage() {
  return <ContactPageContainer />;
}
