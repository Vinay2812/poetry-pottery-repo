import { Minus, Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatInr, pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";

import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import type { StatusTone } from "@/features/orders/types";

export interface ReserveBoxProps {
  price: number;
  seats: number;
  maxSeats: number;
  note: string;
  seatsLabel: string;
  isSeatsLow: boolean;
  isSoldOut: boolean;
  isPast: boolean;
  isReserving: boolean;
  bookingHref: string | null;
  bookingStatusLabel: string;
  bookingStatusTone: StatusTone;
  bookingSeats: number;
  whatsappUrl: string | null;
  onSeatsChange: (seats: number) => void;
  onNoteChange: (note: string) => void;
  onReserve: () => void;
}

export function ReserveBox({
  price,
  seats,
  maxSeats,
  note,
  seatsLabel,
  isSeatsLow,
  isSoldOut,
  isPast,
  isReserving,
  bookingHref,
  bookingStatusLabel,
  bookingStatusTone,
  bookingSeats,
  whatsappUrl,
  onSeatsChange,
  onNoteChange,
  onReserve,
}: ReserveBoxProps) {
  const stepperClass =
    "flex size-11 items-center justify-center rounded-full transition-colors hover:bg-primary-light disabled:opacity-40";

  return (
    <div className="flex flex-col gap-5 rounded-3xl bg-cream p-5 md:p-6">
      <div className="flex items-end justify-between gap-3">
        <p className="flex flex-col">
          <span className="font-heading text-3xl">{formatInr(price)}</span>
          <span className="text-xs text-muted-foreground">per seat</span>
        </p>
        <span
          className={cn(
            "text-sm font-medium",
            isSeatsLow ? "text-terracotta-dark" : "text-muted-foreground",
          )}
        >
          {isPast ? "Wrapped up" : seatsLabel}
        </span>
      </div>

      {bookingHref ? (
        <div className="flex flex-col gap-3 rounded-2xl bg-background p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium">
              You have {pluralize(bookingSeats, "seat")} here
            </span>
            <OrderStatusBadge
              tone={bookingStatusTone}
              label={bookingStatusLabel}
            />
          </div>
          <Button className="rounded-full" asChild>
            <Link href={bookingHref}>View your booking</Link>
          </Button>
        </div>
      ) : isPast ? (
        <div className="flex flex-col gap-3 rounded-2xl bg-background p-4">
          <p className="text-sm text-muted-foreground">
            This date is done. The gallery below is from the evening.
          </p>
          <Button variant="outline" className="rounded-full" asChild>
            <Link href="/events">See upcoming dates</Link>
          </Button>
        </div>
      ) : isSoldOut ? (
        <div className="flex flex-col gap-3 rounded-2xl bg-background p-4">
          <p className="text-sm text-muted-foreground">
            Every seat is taken. Message us and we will tell you the moment
            someone drops out or we add a second batch.
          </p>
          {whatsappUrl && (
            <Button variant="outline" className="rounded-full" asChild>
              <a href={whatsappUrl} target="_blank" rel="noreferrer">
                Ask about a waitlist seat
              </a>
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">Seats</span>
            <div
              role="group"
              aria-label="Seats"
              className="inline-flex items-center rounded-full border border-border bg-background"
            >
              <button
                type="button"
                onClick={() => onSeatsChange(Math.max(1, seats - 1))}
                disabled={seats <= 1}
                aria-label="Fewer seats"
                className={stepperClass}
              >
                <Minus className="size-4" />
              </button>
              <span
                className="min-w-8 text-center text-sm font-semibold tabular-nums"
                aria-live="polite"
              >
                {seats}
              </span>
              <button
                type="button"
                onClick={() => onSeatsChange(Math.min(maxSeats, seats + 1))}
                disabled={seats >= maxSeats}
                aria-label="More seats"
                className={stepperClass}
              >
                <Plus className="size-4" />
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
              className="bg-background"
            />
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
            <span className="text-muted-foreground">
              {pluralize(seats, "seat")} × {formatInr(price)}
            </span>
            <span className="font-heading text-2xl">
              {formatInr(price * seats)}
            </span>
          </div>

          <Button
            size="lg"
            className="h-12 rounded-full"
            onClick={onReserve}
            disabled={isReserving}
          >
            {isReserving ? "Reserving…" : "Reserve a seat"}
          </Button>
        </>
      )}

      <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
        <li>Clay, tools and firing are part of the seat price</li>
        <li>We confirm on WhatsApp, then you pay by UPI or bank transfer</li>
        <li>Cancel free up to 48 hours before the session</li>
      </ul>
    </div>
  );
}
