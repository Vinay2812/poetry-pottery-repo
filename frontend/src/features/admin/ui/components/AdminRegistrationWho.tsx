export interface AdminRegistrationWhoProps {
  name: string;
  email: string;
  // The id the guest sees on their page and quotes on WhatsApp, e.g. WS-HJN2NGS3UP.
  reference: string;
  requestedLabel: string;
}

export function AdminRegistrationWho({
  name,
  email,
  reference,
  requestedLabel,
}: AdminRegistrationWhoProps) {
  return (
    <div className="flex flex-col">
      <span>{name}</span>
      <span className="text-[12px] wrap-anywhere text-muted-foreground">
        {email}
      </span>
      <span className="text-[12px] text-muted-foreground tnum">
        {reference}
      </span>
      <span className="text-[12px] text-muted-foreground tnum">
        Requested {requestedLabel}
      </span>
    </div>
  );
}
