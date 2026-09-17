interface KilnCardRow {
  label: string;
  value: string;
  isLinked?: boolean;
}

export interface KilnCardProps {
  rows: KilnCardRow[];
  activeLabel?: string | null;
  onActivate?: (label: string | null) => void;
}

// The label a potter ties to a piece coming out of the kiln, as a plain fact list.
// Rows that the drawing also names light up with it, in either direction.
export function KilnCard({
  rows,
  activeLabel = null,
  onActivate,
}: KilnCardProps) {
  return (
    <section aria-label="Kiln card" className="border-t border-ash">
      <dl>
        {rows.map((row) => {
          const isLinked = Boolean(onActivate && row.isLinked);
          return (
            <div
              key={row.label}
              data-on={row.label === activeLabel ? "" : undefined}
              tabIndex={isLinked ? 0 : undefined}
              onPointerEnter={
                isLinked ? () => onActivate?.(row.label) : undefined
              }
              onPointerLeave={isLinked ? () => onActivate?.(null) : undefined}
              onFocus={isLinked ? () => onActivate?.(row.label) : undefined}
              onBlur={isLinked ? () => onActivate?.(null) : undefined}
              className="fact-row grid min-h-12 grid-cols-[9rem_1fr] items-center gap-4 border-b border-ash text-sm"
            >
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
