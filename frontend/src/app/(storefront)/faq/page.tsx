import type { Metadata } from "next";

import { ContentPageContainer, contentMetadata } from "@/features/content";

export function generateMetadata(): Promise<Metadata> {
  return contentMetadata("faq");
}

export default function FaqPage() {
  return <ContentPageContainer slug="faq" isAccordion />;
}
