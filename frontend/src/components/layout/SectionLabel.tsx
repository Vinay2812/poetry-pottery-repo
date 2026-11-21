export interface SectionLabelProps {
  children: React.ReactNode;
  // Nested labels, such as the times under a calendar week, sit one level down.
  level?: 2 | 3;
  id?: string;
}

// The small uppercase name a section carries on every wheel session page.
export function SectionLabel({ children, level = 2, id }: SectionLabelProps) {
  const Heading = level === 3 ? "h3" : "h2";
  return (
    <Heading
      id={id}
      className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase"
    >
      {children}
    </Heading>
  );
}
