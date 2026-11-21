export interface CareNotesProps {
  notes: string[];
}

// How to look after the piece, kept with the facts rather than the story.
export function CareNotes({ notes }: CareNotesProps) {
  return (
    <section aria-labelledby="care-notes" className="flex flex-col gap-2 pt-8">
      <h3
        id="care-notes"
        className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase"
      >
        Care
      </h3>
      <ul className="flex flex-col gap-1 text-[13px] leading-relaxed text-muted-foreground">
        {notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </section>
  );
}
