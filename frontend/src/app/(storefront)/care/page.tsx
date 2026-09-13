import type { Metadata } from "next";

import { ContentPageContainer, contentMetadata } from "@/features/content";

export function generateMetadata(): Promise<Metadata> {
  return contentMetadata("care");
}

export default function CarePage() {
  return <ContentPageContainer slug="care" />;
}
