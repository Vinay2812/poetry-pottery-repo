export interface MakerNoteProps {
  note: string;
}

// The potter's own words, read with the description, in the one type style kept for them.
export function MakerNote({ note }: MakerNoteProps) {
  return (
    <p className="max-w-[46ch] pt-2 font-script text-xl leading-snug whitespace-pre-line italic">
      {note}
    </p>
  );
}
