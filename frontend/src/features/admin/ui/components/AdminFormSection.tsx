import type { ReactNode } from "react";

export interface AdminFormSectionProps {
  title: string;
  description: string | null;
  children: ReactNode;
}

/** One titled group of a long form, divided from the next by a hairline. */
export function AdminFormSection({
  title,
  description,
  children,
}: AdminFormSectionProps) {
  return (
    <section className="grid gap-4 border-t border-ash pt-6 lg:grid-cols-[14rem_1fr] lg:gap-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl leading-tight tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-[13px] text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-4">{children}</div>
    </section>
  );
}
