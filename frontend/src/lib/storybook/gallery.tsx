import type { ReactNode } from "react";

// Layout primitives for component gallery pages. Responsive on purpose:
// mobile stacks specimens full-width with a tighter type scale, tablet and up
// wraps them into rows — so each breakpoint story renders a genuinely
// different layout, not the same page in a narrower frame.

export function Gallery({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full flex-col gap-8 px-1 sm:gap-10 lg:max-w-3xl">
      {children}
    </div>
  );
}

export function GallerySection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 sm:gap-4">
      <h3 className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase sm:text-xs">
        {title}
      </h3>
      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:gap-6">
        {children}
      </div>
    </section>
  );
}

export function Specimen({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <figure className="flex w-full min-w-0 flex-col items-start gap-1.5 sm:w-auto sm:gap-2">
      {children}
      <figcaption className="text-[11px] text-muted-foreground sm:text-xs">
        {label}
      </figcaption>
    </figure>
  );
}
