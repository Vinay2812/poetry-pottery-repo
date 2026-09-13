interface KilnCardRow {
  label: string;
  value: string;
}

export interface KilnCardProps {
  rows: KilnCardRow[];
  colorCode: string | null;
}

// The label a potter ties to a piece coming out of the kiln, as a plain fact list.
export function KilnCard({ rows }: KilnCardProps) {
  return (
    <section aria-label="Kiln card" className="border-t border-ash">
      <dl>
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[9rem_1fr] gap-4 border-b border-ash py-3 text-sm"
          >
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
