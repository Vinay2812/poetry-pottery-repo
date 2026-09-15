interface KilnCardRow {
  label: string;
  value: string;
}

export interface KilnCardProps {
  rows: KilnCardRow[];
  colorCode: string | null;
}

// Reads like the label a potter ties to a piece coming out of the kiln.
export function KilnCard({ rows, colorCode }: KilnCardProps) {
  return (
    <section aria-label="Kiln card" className="rounded-2xl bg-cream p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-script text-lg text-clay-dark italic">
          Kiln card
        </span>
        {colorCode && (
          <span
            aria-hidden="true"
            className="size-6 rounded-full ring-2 ring-white"
            style={{ backgroundColor: colorCode }}
          />
        )}
      </div>
      <dl>
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline gap-2 py-1.5 text-sm"
          >
            <dt className="shrink-0 text-muted-foreground">{row.label}</dt>
            <dd className="flex flex-1 items-baseline gap-2 text-right font-medium">
              <span
                aria-hidden="true"
                className="flex-1 border-b border-dotted border-clay/40"
              />
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
