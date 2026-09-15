import type { Metadata } from "next";

import {
  ContentPagesContainer,
  SiteSettingsContainer,
} from "@/features/admin/content";

export const metadata: Metadata = { title: "Content" };

export default function AdminContentPage() {
  return (
    <div className="flex flex-col gap-10">
      <ContentPagesContainer />
      <SiteSettingsContainer />
    </div>
  );
}
