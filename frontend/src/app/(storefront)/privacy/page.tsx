import type { Metadata } from "next";

import { ContentPageContainer, contentMetadata } from "@/features/content";

export function generateMetadata(): Promise<Metadata> {
  return contentMetadata("privacy");
}

export default function PrivacyPage() {
  return <ContentPageContainer slug="privacy" />;
}
