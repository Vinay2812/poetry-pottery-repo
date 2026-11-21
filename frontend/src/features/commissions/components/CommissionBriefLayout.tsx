import type { ReactNode } from "react";

export interface CommissionBriefLayoutProps {
  title: string;
  lede: ReactNode;
  children: ReactNode;
}

// The heading sits beside the brief on wide screens, so it reads as a letter rather than a settings page.
// The form and the confirmation share it, so sending swaps the heading along with the body.
export function CommissionBriefLayout({
  title,
  lede,
  children,
}: CommissionBriefLayoutProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
      <div className="flex flex-col gap-2 lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
        <h2 className="font-heading text-2xl tracking-tight">{title}</h2>
        <p className="max-w-2xl text-[15px] text-muted-foreground lg:max-w-xs">
          {lede}
        </p>
      </div>
      <div className="max-w-2xl lg:col-span-7 lg:col-start-6">{children}</div>
    </div>
  );
}
