import type { ReactNode } from "react";

export interface CommissionBriefLayoutProps {
  title: string;
  lede: ReactNode;
  children: ReactNode;
}

// Heading beside the brief on wide screens; the form and the confirmation share it so sending swaps both.
export function CommissionBriefLayout({
  title,
  lede,
  children,
}: CommissionBriefLayoutProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
      <div className="flex min-w-0 flex-col gap-2 lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
        <h2 className="font-heading text-2xl tracking-tight">{title}</h2>
        <p className="max-w-2xl text-[15px] text-muted-foreground lg:max-w-xs">
          {lede}
        </p>
      </div>
      <div className="max-w-2xl min-w-0 lg:col-span-7 lg:col-start-6 lg:max-w-none">
        {children}
      </div>
    </div>
  );
}
