import Link from "next/link";
import { WhatsAppLink } from "@/components/whatsapp/WhatsAppLink";

export interface ArchiveNoticeProps {
  name: string;
  priceLabel: string;
  collectionName: string | null;
  provenance: string;
  note: string;
  commissionHref: string;
  askUrl: string | null;
}

// Stands in for the buy box on an archived piece: one line, then a way to ask for another.
export function ArchiveNotice({
  name,
  priceLabel,
  collectionName,
  provenance,
  note,
  commissionHref,
  askUrl,
}: ArchiveNoticeProps) {
  return (
    <div className="flex flex-col gap-5">
      {collectionName && (
        <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
          {collectionName}
        </p>
      )}
      <h1 className="font-heading text-3xl leading-tight tracking-tight text-balance md:text-4xl">
        {name}
      </h1>
      <p className="text-lg text-muted-foreground tnum">{priceLabel}</p>
      <p className="text-[13px] text-muted-foreground">{provenance}</p>
      <div className="flex flex-col gap-3 border-y border-ash py-6">
        <p className="text-[15px]">{note}</p>
        {/* The form files the request where the studio reads it; WhatsApp stays for those who prefer it. */}
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <Link
            href={commissionHref}
            className="w-fit border-b border-ink pb-0.5 text-sm hover:border-primary hover:text-primary"
          >
            Ask for one like it
          </Link>
          {askUrl && (
            <WhatsAppLink
              href={askUrl}
              kind="archive-ask"
              className="text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              or ask on WhatsApp
            </WhatsAppLink>
          )}
        </div>
      </div>
    </div>
  );
}
