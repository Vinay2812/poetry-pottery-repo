import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

export interface CatalogSectionProps {
  title: string;
  description: string;
  actionLabel: string;
  isActionDisabled: boolean;
  onAction: () => void;
  children: ReactNode;
}

export function CatalogSection({
  title,
  description,
  actionLabel,
  isActionDisabled,
  onAction,
  children,
}: CatalogSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-xl leading-none tracking-tight">
            {title}
          </h2>
          <p className="text-[13px] text-muted-foreground">{description}</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isActionDisabled}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      </div>
      {children}
    </section>
  );
}
