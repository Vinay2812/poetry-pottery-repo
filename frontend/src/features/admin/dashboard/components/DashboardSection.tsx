import type { ReactNode } from "react";

import Link from "next/link";

export interface DashboardSectionProps {
  title: string;
  moreHref: string | null;
  moreLabel: string;
  children: ReactNode;
}

export function DashboardSection({
  title,
  moreHref,
  moreLabel,
  children,
}: DashboardSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl leading-none tracking-tight">
          {title}
        </h2>
        {moreHref && (
          <Link
            href={moreHref}
            className="text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {moreLabel}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
