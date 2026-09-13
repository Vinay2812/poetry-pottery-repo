import type { Metadata } from "next";

import { ContentPageContainer, contentMetadata } from "@/features/content";

export function generateMetadata(): Promise<Metadata> {
  return contentMetadata("shipping");
}

export default function ShippingPage() {
  return <ContentPageContainer slug="shipping" />;
}
