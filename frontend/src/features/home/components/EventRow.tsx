import Link from "next/link";

export interface EventRowProps {
  href: string;
  dateLabel: string;
  title: string;
  seatsLabel: string;
  isSoldOut: boolean;
}

export function EventRow({
  href,
  dateLabel,
  title,
  seatsLabel,
  isSoldOut,
}: EventRowProps) {
  return (
    <div className="grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-1 border-b border-ash py-4 md:grid-cols-[10rem_1fr_8rem_auto] md:gap-6">
      <span className="text-[13px] text-muted-foreground tnum">
        {dateLabel}
      </span>
      <span className="text-[15px]">{title}</span>
      <span className="col-start-2 text-[13px] text-muted-foreground md:col-start-auto">
        {seatsLabel}
      </span>
      <Link
        href={href}
        className="col-start-2 w-fit border-b border-ink pb-0.5 text-[13px] hover:border-primary hover:text-primary md:col-start-auto"
      >
        {isSoldOut ? "Join the list" : "Reserve"}
      </Link>
    </div>
  );
}
