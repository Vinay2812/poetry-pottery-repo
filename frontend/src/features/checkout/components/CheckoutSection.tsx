import type { ReactNode } from "react";

export interface CheckoutSectionProps {
  title: string;
  aside?: string;
  children: ReactNode;
}

// Every checkout block opens the same way, so the two columns' headings sit on one line.
export function CheckoutSection({
  title,
  aside,
  children,
}: CheckoutSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4 border-b border-ash pb-3">
        <h2 className="font-heading text-xl tracking-tight">{title}</h2>
        {aside && (
          <p className="text-[13px] text-muted-foreground tnum">{aside}</p>
        )}
      </div>
      {children}
    </section>
  );
}
