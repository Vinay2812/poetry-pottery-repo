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
    <div role="status" className="flex flex-col gap-4 border-t border-ash pt-6">
      <h3 className="font-heading text-2xl tracking-tight">
        Your brief is with us
      </h3>
      <p className="max-w-md text-[15px] text-muted-foreground">
        A sketch and a price come back to {email} within two days. Nothing is
        owed until you say yes.
      </p>
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
        <a
          href={askUrl}
          target="_blank"
          rel="noreferrer"
          className="w-fit border-b border-ink pb-0.5 text-sm hover:border-primary hover:text-primary"
        >
          Add something on WhatsApp
        </a>
      )}
    </div>
  );
}
