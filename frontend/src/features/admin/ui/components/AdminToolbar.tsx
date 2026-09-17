import type { ReactNode } from "react";

export interface AdminToolbarProps {
  children: ReactNode;
}

export function AdminToolbar({ children }: AdminToolbarProps) {
  return <div className="flex flex-wrap items-end gap-3 py-4">{children}</div>;
}
