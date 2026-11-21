import { Minus, Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WhatsAppLink } from "@/components/whatsapp/WhatsAppLink";
import { formatInr, pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";

import { TEXT_LINK } from "@/features/events/components/styles";
import {
  type ReserveState,
  SEAT_NOTE,
  toRequestSeatsLabel,
} from "@/features/events/types";

export interface ReserveBoxProps {
  state: ReserveState;
  eventId: number;
  price: number;
  seats: number;
  maxSeats: number;
  note: string;
  notePlaceholder: string;
  seatsLabel: string;
  seatPriceNote: string | null;
  isPriceShown: boolean;
  hasGallery: boolean;
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

// One box for every state of a date: open, full, under way, done, called off, or already yours.
export function ReserveBox({
  state,
  eventId,
  price,
  seats,
  maxSeats,
  note,
  notePlaceholder,
  seatsLabel,
  seatPriceNote,
  isPriceShown,
  hasGallery,
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
    <section
      aria-label="Your seat"
      className="flex flex-col gap-5 border border-ash bg-white p-5 md:p-6"
    >
      {isPriceShown && (
        <div className="flex items-baseline justify-between gap-3 text-[15px]">
          <p className="tnum">
            {formatInr(price)}{" "}
            <span className="text-[13px] text-muted-foreground">a seat</span>
          </p>
          {/* Your own seat may be the one that filled the room. */}
          {state !== "booked" && (
            <p className="text-[13px] text-muted-foreground">{seatsLabel}</p>
          )}
        </div>
      )}

      {state === "cancelled" && (
        <div className="flex flex-col gap-2">
          <p className="font-heading text-xl tracking-tight">
            This one was called off
          </p>
          <p className="text-sm text-muted-foreground">
            The studio cancelled this session. Anyone with a seat has been told,
            and nothing is owed.
          </p>
          <Link href="/events" className={TEXT_LINK}>
            See upcoming dates
          </Link>
        </div>
      )}

      {state === "past" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            This date is done.
            {hasGallery && " The photographs below are from the day."}
          </p>
          <Link href="/events" className={TEXT_LINK}>
            See upcoming dates
          </Link>
        </div>
      )}

      {state === "started" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Registration closed when this one began.
          </p>
          <Link href="/events" className={TEXT_LINK}>
            See upcoming dates
          </Link>
        </div>
      )}

      {state === "booked" && bookingHref && (
        <div
          className={cn(
            "flex flex-col gap-3",
            // The rule only separates the booking from a price line above it.
            isPriceShown && "border-t border-ash pt-4",
          )}
        >
          <p className="flex flex-col gap-0.5 text-sm">
            <span>Your booking · {pluralize(bookingSeats, "seat")}</span>
            <span className="text-muted-foreground">{bookingStatusLabel}</span>
          </p>
          <Link href={bookingHref} className={TEXT_LINK}>
            View your booking
          </Link>
        </div>
      )}

      {state === "soldOut" && (
        <div className="flex flex-col gap-3 border-t border-ash pt-4">
          <p className="text-sm text-muted-foreground">
            Every seat is taken. Write to us and we will tell you if one opens
            up.
          </p>
          {whatsappUrl && (
            <WhatsAppLink
              href={whatsappUrl}
              kind="event"
              reference={String(eventId)}
              className={TEXT_LINK}
            >
              Ask about a waiting seat
            </WhatsAppLink>
          )}
        </div>
      )}

      {state === "open" && (
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
              placeholder={notePlaceholder}
            />
          </div>

          {/* One seat is the price above; a total only earns a row once it differs. */}
          {seats > 1 && (
            <dl className="flex items-baseline justify-between gap-3 border-t border-ash pt-4 text-[15px]">
              <dt className="text-[13px] text-muted-foreground">
                Total for {seats} seats
              </dt>
              <dd className="tnum">{formatInr(price * seats)}</dd>
            </dl>
          )}

          <div className="flex flex-col gap-3">
            <Button size="lg" onClick={onReserve} disabled={isReserving}>
              {isReserving ? "Sending…" : toRequestSeatsLabel(seats)}
            </Button>
            <p className="text-[13px] text-muted-foreground">{SEAT_NOTE}</p>
          </div>
        </>
      )}

      {isPriceShown && seatPriceNote && (
        <p className="border-t border-ash pt-4 text-[13px] text-muted-foreground">
          {seatPriceNote}
        </p>
      )}
    </section>
  );
}
