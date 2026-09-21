"use client";

import { useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { UserRole } from "@/graphql/generated/graphql";

import { AdminRail } from "@/features/admin/shell/components/AdminRail";
import { AdminSectionStrip } from "@/features/admin/shell/components/AdminSectionStrip";
import { AdminTopBar } from "@/features/admin/shell/components/AdminTopBar";
import { ADMIN_NAV_LINKS } from "@/features/admin/shell/types";

export interface AdminChromeContainerProps {
  children: ReactNode;
}

export function AdminChromeContainer({ children }: AdminChromeContainerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const isAdmin = user?.publicMetadata.role === UserRole.Admin;

  // The layout already refused non-admins on the server; this covers a role
  // changing under a session that is still open.
  useEffect(() => {
    if (isLoaded && !isAdmin) router.replace("/");
  }, [isAdmin, isLoaded, router]);

  if (isLoaded && !isAdmin) return null;

  return (
    <>
      <AdminTopBar
        adminName={user?.fullName ?? "Studio"}
        adminEmail={user?.primaryEmailAddress?.emailAddress ?? ""}
        adminImageUrl={user?.imageUrl ?? null}
        shopHref="/"
      />
      <AdminSectionStrip links={ADMIN_NAV_LINKS} pathname={pathname} />
      <div className="flex flex-1 items-stretch">
        <AdminRail links={ADMIN_NAV_LINKS} pathname={pathname} />
        <main className="min-w-0 flex-1 px-4 py-6 md:px-6">{children}</main>
      </div>
    </>
  );
}
