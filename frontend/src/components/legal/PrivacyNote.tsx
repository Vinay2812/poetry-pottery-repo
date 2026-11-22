import Link from "next/link";

export interface PrivacyNoteProps {
  // What happens to the details, said before the link.
  lead: string;
}

// Opens in a new tab so a half-typed form is still there on return.
export function PrivacyNote({ lead }: PrivacyNoteProps) {
  return (
    <p className="text-[13px] text-muted-foreground">
      {lead}{" "}
      <Link
        href="/privacy"
        target="_blank"
        rel="noopener"
        className="border-b border-ink/40 text-ink hover:border-primary hover:text-primary"
      >
        Privacy policy
        <span className="sr-only"> (opens in a new tab)</span>
      </Link>
    </p>
  );
}
