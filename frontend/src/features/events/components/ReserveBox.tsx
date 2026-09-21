import { Minus, Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatInr, pluralize } from "@/lib/format";

import { SEAT_NOTE } from "@/features/events/types";

export interface ReserveBoxProps {
  price: number;
  seats: number;
  maxSeats: number;
  note: string;
  seatsLabel: string;
  isSoldOut: boolean;
  isPast: boolean;
  isReserving: boolean;
  bookingHref: string | null;
  bookingStatusLabel: string;
  bookingSeats: number;
  whatsappUrl: string | null;
  onSeatsChange: (seats: number) => void;
  onNoteChange: (note: string) => void;
  onReserve: () => void;
}

const STEPPER_BUTTON =
  "flex size-11 items-center justify-center transition-colors hover:text-primary disabled:opacity-40";
const TEXT_LINK =
  "w-fit border-b border-ink pb-0.5 text-[13px] hover:border-primary hover:text-primary";

export function ReserveBox({
  price,
  seats,
  maxSeats,
  note,
  seatsLabel,
  isSoldOut,
  isPast,
  isReserving,
  bookingHref,
  bookingStatusLabel,
  bookingSeats,
  whatsappUrl,
  onSeatsChange,
  onNoteChange,
  onReserve,
}: ReserveBoxProps) {
  return (
    <div className="flex flex-col gap-5 border border-ash bg-white p-5 md:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="flex items-baseline gap-2">
          <span className="font-heading text-3xl tnum">{formatInr(price)}</span>
          <span className="text-[13px] text-muted-foreground">per seat</span>
        </p>
        <span className="text-[13px] text-muted-foreground">
          {isPast ? "Wrapped up" : seatsLabel}
        </span>
      </div>

      {bookingHref ? (
        <div className="flex flex-col gap-3 border-t border-ash pt-4">
          <p className="text-sm">
            You have {pluralize(bookingSeats, "seat")} here.{" "}
            <span className="text-muted-foreground">{bookingStatusLabel}</span>
          </p>
          <Link href={bookingHref} className={TEXT_LINK}>
            View your booking
          </Link>
        </div>
      ) : isPast ? (
        <div className="flex flex-col gap-3 border-t border-ash pt-4">
          <p className="text-sm text-muted-foreground">
            This date is done. The photographs below are from the evening.
          </p>
          <Link href="/events" className={TEXT_LINK}>
            See upcoming dates
          </Link>
        </div>
      ) : isSoldOut ? (
        <div className="flex flex-col gap-3 border-t border-ash pt-4">
          <p className="text-sm text-muted-foreground">
            Every seat is taken. Write to us and we will tell you if one opens
            up.
          </p>
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className={TEXT_LINK}
            >
              Ask about a waiting seat
            </a>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 border-t border-ash pt-4">
            <span className="text-sm">Seats</span>
            <div
              role="group"
              aria-label="Seats"
              className="inline-flex items-center border border-ash"
            >
              <button
                type="button"
                onClick={() => onSeatsChange(Math.max(1, seats - 1))}
                disabled={seats <= 1}
                aria-label="Fewer seats"
                className={STEPPER_BUTTON}
              >
                <Minus className="size-4" strokeWidth={1.5} />
              </button>
              <span
                className="min-w-6 text-center text-sm tnum"
                aria-live="polite"
              >
                {seats}
              </span>
              <button
                type="button"
                onClick={() => onSeatsChange(Math.min(maxSeats, seats + 1))}
                disabled={seats >= maxSeats}
                aria-label="More seats"
                className={STEPPER_BUTTON}
              >
                <Plus className="size-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="reserve-note" className="font-normal">
              Anything we should know? (optional)
            </Label>
            <Textarea
              id="reserve-note"
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
              maxLength={300}
              rows={3}
              placeholder="Left-handed, coming with a friend, first time on the wheel…"
            />
          </div>

          <div className="flex items-baseline justify-between border-t border-ash pt-4 text-sm">
            <span className="text-muted-foreground">
              {pluralize(seats, "seat")} × {formatInr(price)}
            </span>
            <span className="font-heading text-2xl tnum">
              {formatInr(price * seats)}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <Button size="lg" onClick={onReserve} disabled={isReserving}>
              {isReserving ? "Reserving…" : "Reserve a seat"}
            </Button>
            <p className="text-[13px] text-muted-foreground">{SEAT_NOTE}</p>
          </div>
        </>
      )}

      <p className="border-t border-ash pt-4 text-[13px] text-muted-foreground">
        Clay, tools and firing are part of the seat price.
      </p>
    </div>
  );
}
