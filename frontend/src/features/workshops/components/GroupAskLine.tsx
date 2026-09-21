import Link from "next/link";

import { WhatsAppLink } from "@/components/whatsapp/WhatsAppLink";

export interface GroupAskLineProps {
  line: string;
  askUrl: string | null;
  contactHref: string;
}

// Shown once the stepper reaches the wheel count: the bigger party goes to the studio by hand.
export function GroupAskLine({ line, askUrl, contactHref }: GroupAskLineProps) {
  const linkClass =
    "w-fit border-b border-ink pb-0.5 text-[13px] hover:border-primary hover:text-primary";
  return (
    <div className="flex flex-col gap-2">
      <p className="max-w-md text-[13px] text-muted-foreground">{line}</p>
      {askUrl ? (
        <WhatsAppLink href={askUrl} kind="group-session" className={linkClass}>
          Ask about a group session on WhatsApp
        </WhatsAppLink>
      ) : (
        <Link href={contactHref} className={linkClass}>
          Ask about a group session
        </Link>
      )}
    </div>
  );
}
