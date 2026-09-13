import type { ReactNode } from "react";

export interface AdminPageHeaderProps {
  eyebrow: string | null;
  title: string;
  description: string | null;
  actions?: ReactNode;
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-ash pb-4">
      <div className="flex min-w-0 flex-col gap-1">
        {eyebrow && (
          <span className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
            {eyebrow}
          </span>
        )}
        <h1 className="font-display text-2xl leading-none tracking-tight md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="text-[13px] text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
