import { WhatsAppLink } from "@/components/whatsapp/WhatsAppLink";

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
        <WhatsAppLink
          href={askUrl}
          kind="glaze-ask"
          className="border-b border-ink pb-0.5 text-foreground hover:border-primary hover:text-primary"
        >
          {linkLabel}
        </WhatsAppLink>
      ) : (
        <span className="text-foreground">{linkLabel}</span>
      )}
    </p>
  );
}
