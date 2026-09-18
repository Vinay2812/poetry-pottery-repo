import Link from "next/link";

export interface AdminStatTileProps {
  label: string;
  value: string;
  hint: string | null;
  // Given a destination the whole tile is the link, so the number reads as a way in.
  href?: string | null;
}

export function AdminStatTile({
  label,
  value,
  hint,
  href = null,
}: AdminStatTileProps) {
  const body = (
    <>
      <span className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </span>
      <span className="font-display text-3xl leading-none tracking-tight tnum">
        {value}
      </span>
      {hint && (
        <span className="text-[13px] text-muted-foreground">{hint}</span>
      )}
    </>
  );
  if (href) {
    return (
      <Link
        href={href}
        className="flex flex-col gap-1 border border-ash p-4 transition-colors hover:border-ink"
      >
        {body}
      </Link>
    );
  }
  return (
    <div className="flex flex-col gap-1 border border-ash p-4">{body}</div>
  );
}
