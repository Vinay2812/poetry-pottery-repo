"use client";

import { useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useState } from "react";

import { UserRole } from "@/graphql/generated/graphql";

import { AdminRail } from "@/features/admin/shell/components/AdminRail";
import { AdminSectionStrip } from "@/features/admin/shell/components/AdminSectionStrip";
import { AdminTopBar } from "@/features/admin/shell/components/AdminTopBar";
import {
  type AdminLeaveGuard,
  AdminLeaveGuardContext,
} from "@/features/admin/shell/hooks";
import { ADMIN_NAV_LINKS } from "@/features/admin/shell/types";

export interface AdminChromeContainerProps {
  children: ReactNode;
}

export function AdminChromeContainer({ children }: AdminChromeContainerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const isAdmin = user?.publicMetadata.role === UserRole.Admin;
  const [leaveGuard, setLeaveGuard] = useState<AdminLeaveGuard | null>(null);
  const isLeaveGuarded = leaveGuard !== null;

  const handleGuardedLeave = useCallback(
    (href: string) => leaveGuard?.onLeaveAttempt(href),
    [leaveGuard],
  );

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
        isLeaveGuarded={isLeaveGuarded}
        onGuardedLeave={handleGuardedLeave}
      />
      <AdminSectionStrip
        links={ADMIN_NAV_LINKS}
        pathname={pathname}
        isLeaveGuarded={isLeaveGuarded}
        onGuardedLeave={handleGuardedLeave}
      />
      <div className="flex flex-1 items-stretch">
        <AdminRail
          links={ADMIN_NAV_LINKS}
          pathname={pathname}
          isLeaveGuarded={isLeaveGuarded}
          onGuardedLeave={handleGuardedLeave}
        />
        <main className="min-w-0 flex-1 px-4 py-6 md:px-6">
          <AdminLeaveGuardContext value={setLeaveGuard}>
            {children}
          </AdminLeaveGuardContext>
        </main>
      </div>
    </>
  );
}
