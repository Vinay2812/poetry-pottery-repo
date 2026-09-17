export interface MakerNoteProps {
  note: string;
}

// The potter's own line about this piece, in the one type style reserved for it.
export function MakerNote({ note }: MakerNoteProps) {
  return (
    <p className="pt-6 font-script text-lg leading-snug whitespace-pre-line italic">
      {note}
    </p>
  );
}
