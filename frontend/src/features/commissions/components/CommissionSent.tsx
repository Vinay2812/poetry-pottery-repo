import { WhatsAppLink } from "@/components/whatsapp/WhatsAppLink";

import { CommissionBriefLayout } from "@/features/commissions/components/CommissionBriefLayout";

export interface CommissionSentProps {
  reference: string;
  summary: string;
  email: string;
  askUrl: string | null;
}

// What happens next, in the order it happens, with the reference to quote back.
export function CommissionSent({
  reference,
  summary,
  email,
  askUrl,
}: CommissionSentProps) {
  return (
    <div role="status">
      <CommissionBriefLayout
        title="Your brief is with us"
        lede={
          <>
            A sketch and a price come back to{" "}
            <span className="wrap-anywhere text-ink">{email}</span> within two
            days. Nothing is owed until you say yes.
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <dl className="flex flex-col gap-2 text-[15px]">
            <div className="flex gap-3">
              <dt className="w-24 shrink-0 text-muted-foreground">Piece</dt>
              <dd>{summary}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-24 shrink-0 text-muted-foreground">Reference</dt>
              <dd className="tnum">{reference}</dd>
            </div>
          </dl>
          {askUrl && (
            <WhatsAppLink
              href={askUrl}
              kind="commission"
              reference={reference}
              className="w-fit border-b border-ink pb-0.5 text-sm hover:border-primary hover:text-primary"
            >
              Add something on WhatsApp
            </WhatsAppLink>
          )}
        </div>
      </CommissionBriefLayout>
    </div>
  );
}
