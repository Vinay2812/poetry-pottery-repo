import Link from "next/link";

import { formatInr, pluralize } from "@/lib/format";

import { formatHours } from "@/features/workshops/types";

export interface BookingCardProps {
  href: string;
  dateLabel: string;
  whenLines: string[];
  hours: number;
  participants: number;
  total: number;
  statusLabel: string;
}

export function BookingCard({
  href,
  dateLabel,
  whenLines,
  hours,
  participants,
  total,
  statusLabel,
}: BookingCardProps) {
  return (
    <Link
      href={href}
      className="group grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1 border-b border-ash py-4"
    >
      <span className="text-[13px] text-muted-foreground tnum">
        {dateLabel}
      </span>
      <span className="text-[13px] tnum">{formatInr(total)}</span>
      <span className="col-span-2 flex flex-col text-[15px] leading-snug">
        {whenLines.map((line) => (
          <span key={line} className="underline-offset-4 group-hover:underline">
            {line}
          </span>
        ))}
      </span>
      <span className="col-span-2 text-[13px] text-muted-foreground">
        {formatHours(hours)} · {pluralize(participants, "person", "people")} ·{" "}
        {statusLabel}
      </span>
    </Link>
  );
}
