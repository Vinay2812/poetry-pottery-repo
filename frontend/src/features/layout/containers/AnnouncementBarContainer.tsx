"use client";

import { usePathname } from "next/navigation";

import { AnnouncementBar } from "@/features/layout/components/AnnouncementBar";
import { isFocusedPath } from "@/features/layout/types";

export interface AnnouncementBarContainerProps {
  text: string;
  href: string | null;
}

// Checkout is about finishing the order, so a studio notice above it steps aside like the nav does.
export function AnnouncementBarContainer({
  text,
  href,
}: AnnouncementBarContainerProps) {
  const pathname = usePathname();
  if (isFocusedPath(pathname)) return null;
  return <AnnouncementBar text={text} href={href} />;
}
