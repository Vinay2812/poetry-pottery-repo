import Link from "next/link";

export interface AdminOrderCustomerProps {
  name: string;
  email: string;
  personHref: string;
  addressLines: string[];
  customerNote: string | null;
}

export function AdminOrderCustomer({
  name,
  email,
  personHref,
  addressLines,
  customerNote,
}: AdminOrderCustomerProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
          Customer
        </span>
        <Link
          href={personHref}
          className="text-[13px] underline-offset-4 hover:underline"
        >
          {name}
        </Link>
        <span className="text-[12px] text-muted-foreground">{email}</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
          Ships to
        </span>
        <address className="text-[13px] not-italic">
          {addressLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </address>
      </div>
      {customerNote && (
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            Their note
          </span>
          <p className="text-[13px]">{customerNote}</p>
        </div>
      )}
    </div>
  );
}
