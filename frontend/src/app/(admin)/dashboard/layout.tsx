import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { UserRole } from "@/graphql/generated/graphql";

import { AdminChromeContainer } from "@/features/admin/shell";

export const metadata: Metadata = {
  title: { default: "Studio admin", template: "%s · Studio admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const user = await currentUser();

  if (user?.publicMetadata.role !== UserRole.Admin) {
    redirect("/");
  }

  return (
    <AdminChromeContainer studioName="Poetry & Pottery">
      {children}
    </AdminChromeContainer>
  );
}
