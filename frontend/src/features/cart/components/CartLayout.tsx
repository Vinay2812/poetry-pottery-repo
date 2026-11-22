import type { ReactNode } from "react";

export interface CartLayoutProps {
  lines: ReactNode;
  summary: ReactNode;
}

// The cart page and its skeleton share these columns, so loading never shifts the page.
export function CartLayout({ lines, summary }: CartLayoutProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
      <div className="min-w-0">{lines}</div>
      <div className="lg:sticky lg:top-24">{summary}</div>
    </div>
  );
}
