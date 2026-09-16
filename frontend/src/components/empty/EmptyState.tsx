import Link from "next/link";

import type { PotteryIconKind } from "@/components/icons/pottery";
import { PlaceholderImage } from "@/components/media/PlaceholderImage";
import { Button } from "@/components/ui/button";

export interface EmptyStateProps {
  kind: PotteryIconKind;
  heading: string;
  line: string;
  actionLabel: string;
  actionHref?: string;
  onAction?: () => void;
}

/**
 * One shape for every empty state on the storefront: a drawn vessel, one heading,
 * one line and exactly one way forward. The drawing carries no words of its own.
 */
export function EmptyState({
  kind,
  heading,
  line,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-start gap-6 border-t border-ash py-16 sm:flex-row sm:items-center sm:gap-10">
      <span aria-hidden className="size-32 shrink-0 sm:size-40">
        <PlaceholderImage kind={kind} />
      </span>
      <div className="flex flex-col items-start gap-4">
        <h2 className="font-heading text-2xl tracking-tight">{heading}</h2>
        <p className="max-w-sm text-[15px] text-muted-foreground">{line}</p>
        {actionHref ? (
          <Button variant="outline" asChild>
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : (
          <Button variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
