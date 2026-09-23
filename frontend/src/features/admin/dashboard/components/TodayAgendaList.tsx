import Link from "next/link";

interface TodayAgendaRow {
  id: string;
  href: string;
  kindLabel: string;
  timeLabel: string;
  title: string;
  detail: string;
}

export interface TodayAgendaListProps {
  rows: TodayAgendaRow[];
}

export function TodayAgendaList({ rows }: TodayAgendaListProps) {
  if (rows.length === 0) {
    return (
      <p className="text-[13px] text-muted-foreground">
        Nothing booked for today. A quiet day at the wheel.
      </p>
    );
  }
  return (
    <ol className="border-t border-ash">
      {rows.map((row) => (
        <li
          key={`${row.kindLabel}-${row.id}`}
          className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-ash py-3 text-sm"
        >
          <span className="w-20 shrink-0 text-muted-foreground tnum">
            {row.timeLabel}
          </span>
          <span className="w-16 shrink-0 text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
            {row.kindLabel}
          </span>
          <Link href={row.href} className="underline-offset-4 hover:underline">
            {row.title}
          </Link>
          <span className="text-muted-foreground">{row.detail}</span>
        </li>
      ))}
    </ol>
  );
}
