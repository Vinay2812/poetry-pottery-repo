export interface ContactDetailsProps {
  address: string;
  openingHours: string;
  contactPhone: string;
  contactEmail: string;
  whatsappUrl: string | null;
  instagramUrl: string;
  facebookUrl: string;
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 border-t border-ash py-4">
      <h2 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </h2>
      {children}
    </div>
  );
}

export function ContactDetails({
  address,
  openingHours,
  contactPhone,
  contactEmail,
  whatsappUrl,
  instagramUrl,
  facebookUrl,
}: ContactDetailsProps) {
  return (
    <div className="flex flex-col">
      <DetailRow label="Studio">
        <address className="text-[15px] leading-relaxed not-italic">
          {address}
        </address>
      </DetailRow>
      <DetailRow label="Open">
        <p className="text-[15px] leading-relaxed">{openingHours}</p>
      </DetailRow>
      <DetailRow label="Talk to us">
        <a
          href={`tel:${contactPhone}`}
          className="text-[15px] underline-offset-4 hover:underline"
        >
          {contactPhone}
        </a>
        <a
          href={`mailto:${contactEmail}`}
          className="text-[15px] underline-offset-4 hover:underline"
        >
          {contactEmail}
        </a>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[15px] text-primary underline-offset-4 hover:underline"
          >
            Message us on WhatsApp
          </a>
        )}
      </DetailRow>
      {(instagramUrl.length > 0 || facebookUrl.length > 0) && (
        <DetailRow label="Follow">
          {instagramUrl.length > 0 && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[15px] underline-offset-4 hover:underline"
            >
              Instagram
            </a>
          )}
          {facebookUrl.length > 0 && (
            <a
              href={facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[15px] underline-offset-4 hover:underline"
            >
              Facebook
            </a>
          )}
        </DetailRow>
      )}
    </div>
  );
}
