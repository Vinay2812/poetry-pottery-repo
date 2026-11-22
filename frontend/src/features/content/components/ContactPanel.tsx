import { useId } from "react";

export interface ContactPanelProps {
  label: string;
  children: React.ReactNode;
}

// Opens on the same hairline and eyebrow as the studio details beside it.
export function ContactPanel({ label, children }: ContactPanelProps) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-4 border-t border-ash pt-4"
    >
      <h2
        id={headingId}
        className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase"
      >
        {label}
      </h2>
      {children}
    </section>
  );
}
