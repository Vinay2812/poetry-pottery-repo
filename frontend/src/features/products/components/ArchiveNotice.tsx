export interface ArchiveNoticeProps {
  name: string;
  priceLabel: string;
  collectionName: string | null;
  provenance: string;
  note: string;
  askUrl: string | null;
}

// Stands in for the buy box on an archived piece: one line, then a way to ask for another.
export function ArchiveNotice({
  name,
  priceLabel,
  collectionName,
  provenance,
  note,
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
        {askUrl && (
          <a
            href={askUrl}
            target="_blank"
            rel="noreferrer"
            className="w-fit border-b border-ink pb-0.5 text-sm hover:border-primary hover:text-primary"
          >
            Ask for one like it
          </a>
        )}
      </div>
    </div>
  );
}
