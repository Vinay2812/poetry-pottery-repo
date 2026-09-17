import type { ReactNode } from "react";

export interface ContentPanelProps {
  title: string;
  description: string | null;
  note: string | null;
  children: ReactNode;
}

/** A quiet heading over a block of the content section. */
export function ContentPanel({
  title,
  description,
  note,
  children,
}: ContentPanelProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-ash pb-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-display text-xl leading-none tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="text-[13px] text-muted-foreground">{description}</p>
          )}
        </div>
        {note && <p className="text-[12px] text-muted-foreground">{note}</p>}
      </div>
      {children}
    </section>
  );
}
