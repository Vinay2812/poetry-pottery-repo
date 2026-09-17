export interface StudioNoteRow {
  id: number;
  body: string;
  imageUrl: string | null;
  sentLabel: string;
}

export interface StudioNotesListProps {
  rows: StudioNoteRow[];
}

export function StudioNotesList({ rows }: StudioNotesListProps) {
  if (rows.length === 0) {
    return (
      <p className="text-[13px] text-muted-foreground">
        Nothing sent from the studio yet.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-4">
      {rows.map((row) => (
        <li
          key={row.id}
          className="flex flex-col gap-2 border-t border-ash pt-3 first:border-t-0 first:pt-0"
        >
          <p className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            {row.sentLabel}
          </p>
          <p className="text-[13px] whitespace-pre-line">{row.body}</p>
          {row.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.imageUrl}
              alt=""
              className="aspect-4/3 w-48 border border-ash object-cover"
            />
          )}
        </li>
      ))}
    </ol>
  );
}
