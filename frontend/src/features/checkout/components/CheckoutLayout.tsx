import type { ReactNode } from "react";

export interface CheckoutLayoutProps {
  details: ReactNode;
  summary: ReactNode;
}

// Checkout and its skeleton share these columns, so loading never shifts the page.
export function CheckoutLayout({ details, summary }: CheckoutLayoutProps) {
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
      <div className="flex min-w-0 flex-col gap-10">{details}</div>
      <div className="lg:sticky lg:top-24">{summary}</div>
    </div>
  );
}
