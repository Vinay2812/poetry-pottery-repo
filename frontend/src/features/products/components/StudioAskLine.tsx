export interface StudioAskLineProps {
  text: string;
  linkLabel: string;
  askUrl: string | null;
}

// One quiet line that hands the conversation over to WhatsApp.
export function StudioAskLine({ text, linkLabel, askUrl }: StudioAskLineProps) {
  return (
    <p className="text-[15px] text-muted-foreground">
      {text}{" "}
      {askUrl ? (
        <a
          href={askUrl}
          target="_blank"
          rel="noreferrer"
          className="border-b border-ink pb-0.5 text-foreground hover:border-primary hover:text-primary"
        >
          {linkLabel}
        </a>
      ) : (
        <span className="text-foreground">{linkLabel}</span>
      )}
    </p>
  );
}
