import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatInr, pluralize } from "@/lib/format";

import { formatHours, SESSION_NOTE } from "@/features/workshops/types";

export interface BookingSummaryProps {
  dateLabel: string | null;
  timeLabel: string | null;
  hours: number;
  participants: number;
  pricePerPerson: number;
  total: number;
  pieces: number;
  note: string;
  canBook: boolean;
  isBooking: boolean;
  onNoteChange: (note: string) => void;
  onBook: () => void;
}

export function BookingSummary({
  dateLabel,
  timeLabel,
  hours,
  participants,
  pricePerPerson,
  total,
  pieces,
  note,
  canBook,
  isBooking,
  onNoteChange,
  onBook,
}: BookingSummaryProps) {
  const rows = [
    { label: "Date", value: dateLabel ?? "Pick a day" },
    { label: "Time", value: timeLabel ?? "Pick a start time" },
    { label: "Duration", value: formatHours(hours) },
    { label: "People", value: pluralize(participants, "person", "people") },
    { label: "Per person", value: formatInr(pricePerPerson) },
    { label: "Total", value: formatInr(total) },
    { label: "You take home", value: pluralize(pieces, "piece") },
  ];

  return (
    <div className="flex flex-col gap-5 border border-ash bg-white p-5 md:p-6">
      <dl className="border-t border-ash text-sm">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-4 border-b border-ash py-3"
          >
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="text-right tnum">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col gap-2">
        <Label htmlFor="session-note" className="font-normal">
          Anything we should know? (optional)
        </Label>
        <Textarea
          id="session-note"
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          maxLength={300}
          rows={3}
          placeholder="First time on the wheel, coming with a friend…"
        />
      </div>

      <div className="flex flex-col gap-3">
        <Button size="lg" onClick={onBook} disabled={!canBook || isBooking}>
          {isBooking ? "Booking…" : "Book this session"}
        </Button>
        <p className="text-[13px] text-muted-foreground">
          We confirm the wheel by hand on WhatsApp, usually within a day.
        </p>
        <p className="border-t border-ash pt-4 text-[13px] text-muted-foreground">
          {SESSION_NOTE}
        </p>
      </div>
    </div>
  );
}
