interface ContentIndexEntry {
  id: string;
  heading: string;
}

export interface ContentIndexProps {
  label: string;
  entries: ContentIndexEntry[];
}

// Sits above the text on mobile and stays beside it on desktop.
export function ContentIndex({ label, entries }: ContentIndexProps) {
  return (
    <nav
      aria-label={label}
      className="md:sticky md:top-24 md:self-start md:border-r md:border-ash md:pr-6"
    >
      <h2 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </h2>
      <ul className="mt-4 flex flex-col gap-2.5">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className="text-[13px] underline-offset-4 hover:text-primary hover:underline"
            >
              {entry.heading}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
