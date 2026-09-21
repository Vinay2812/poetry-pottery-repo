import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatInr, pluralize } from "@/lib/format";

import { WhatsAppLink } from "@/components/whatsapp/WhatsAppLink";

import {
  PickedSlots,
  type PickedSlot,
} from "@/features/workshops/components/PickedSlots";
import { formatHours, SESSION_NOTE } from "@/features/workshops/types";

export interface BookingSummaryProps {
  pickedSlots: PickedSlot[];
  slotsNeeded: number;
  hours: number;
  participants: number;
  pricePerPerson: number;
  total: number;
  pieces: number;
  note: string;
  emptyMessage: string;
  // A way to the studio when the month cannot hold the request.
  arrangementAskUrl: string | null;
  hint: string | null;
  canBook: boolean;
  isBooking: boolean;
  onNoteChange: (note: string) => void;
  onBook: () => void;
  onRemoveSlot: (startsAt: string) => void;
}

export function BookingSummary({
  pickedSlots,
  slotsNeeded,
  hours,
  participants,
  pricePerPerson,
  total,
  pieces,
  note,
  emptyMessage,
  arrangementAskUrl,
  hint,
  canBook,
  isBooking,
  onNoteChange,
  onBook,
  onRemoveSlot,
}: BookingSummaryProps) {
  const rows = [
    { label: "Duration", value: formatHours(hours) },
    { label: "People", value: pluralize(participants, "person", "people") },
    { label: "Per person", value: formatInr(pricePerPerson) },
    { label: "Total", value: formatInr(total) },
    { label: "You take home", value: pluralize(pieces, "piece") },
  ];

  return (
    <div className="flex flex-col gap-5 border border-ash bg-white p-5 md:p-6">
      <PickedSlots
        slots={pickedSlots}
        needed={slotsNeeded}
        emptyMessage={emptyMessage}
        onRemoveSlot={onRemoveSlot}
      />
      {hint && <p className="text-[13px] text-muted-foreground">{hint}</p>}
      {pickedSlots.length === 0 && arrangementAskUrl && (
        <WhatsAppLink
          href={arrangementAskUrl}
          kind="custom-session"
          className="w-fit border-b border-ink pb-0.5 text-[13px] hover:border-primary hover:text-primary"
        >
          Ask us to arrange it on WhatsApp
        </WhatsAppLink>
      )}

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
