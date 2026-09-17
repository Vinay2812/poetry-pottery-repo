import type { Metadata } from "next";

import { ContentPageContainer, contentMetadata } from "@/features/content";

export function generateMetadata(): Promise<Metadata> {
  return contentMetadata("terms");
}

export default function TermsPage() {
  return <ContentPageContainer slug="terms" />;
}
