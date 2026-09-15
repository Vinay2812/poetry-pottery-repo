import type { Metadata } from "next";

import { AboutPageContainer, contentMetadata } from "@/features/content";

export function generateMetadata(): Promise<Metadata> {
  return contentMetadata("about");
}

export default function AboutPage() {
  return <AboutPageContainer />;
}
