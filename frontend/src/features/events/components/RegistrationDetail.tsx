import { CalendarDays, Clock, MapPin, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatInr, pluralize } from "@/lib/format";

import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import {
  OrderTimeline,
  type OrderTimelineStep,
} from "@/features/orders/components/OrderTimeline";
import type { StatusTone } from "@/features/orders/types";

export interface RegistrationDetailProps {
  registrationId: string;
  eventTitle: string;
  eventHref: string;
  imageUrl: string;
  typeLabel: string;
  bookedOn: string;
  statusLabel: string;
  statusTone: StatusTone;
  isJustPlaced: boolean;
  steps: OrderTimelineStep[];
  currentStepIndex: number;
  isClosed: boolean;
  closedLabel: string | null;
  dateLabel: string;
  timeRange: string;
  location: string;
  address: string;
  seats: number;
  unitPrice: number;
  discount: number;
  total: number;
  note: string | null;
  whatsappUrl: string | null;
  canCancel: boolean;
  isCancelling: boolean;
  onCancel: () => void;
}

export function RegistrationDetail({
  registrationId,
  eventTitle,
  eventHref,
  imageUrl,
  typeLabel,
  bookedOn,
  statusLabel,
  statusTone,
  isJustPlaced,
  steps,
  currentStepIndex,
  isClosed,
  closedLabel,
  dateLabel,
  timeRange,
  location,
  address,
  seats,
  unitPrice,
  discount,
  total,
  note,
  whatsappUrl,
  canCancel,
  isCancelling,
  onCancel,
}: RegistrationDetailProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 md:px-8 md:py-10">
      {isJustPlaced && (
        <section className="flex flex-col gap-3 rounded-3xl bg-primary p-6 text-primary-foreground md:p-8">
          <p className="font-script text-2xl italic">Seat requested</p>
          <h1 className="font-heading text-3xl md:text-4xl">
            We are holding your spot
          </h1>
          <p className="max-w-xl text-primary-foreground/90">
            Send us a WhatsApp now and we will confirm the seat and share
            payment details, or wait for our message within a day.
          </p>
          {whatsappUrl && (
            <Button
              variant="secondary"
              size="lg"
              className="w-fit rounded-full"
              asChild
            >
              <a href={whatsappUrl} target="_blank" rel="noreferrer">
                <MessageCircle className="size-4" />
                Confirm on WhatsApp
              </a>
            </Button>
          )}
        </section>
      )}

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Booked {bookedOn}</p>
          <h2 className="font-heading text-2xl md:text-4xl">
            Booking{" "}
            <span className="font-mono text-xl tracking-wide md:text-2xl">
              {registrationId}
            </span>
          </h2>
        </div>
        <OrderStatusBadge tone={statusTone} label={statusLabel} />
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="flex flex-col gap-8">
          <section className="rounded-3xl bg-card p-5 shadow-soft md:p-6">
            <h3 className="mb-4 text-xs font-semibold tracking-[0.12em] text-clay-dark uppercase">
              Progress
            </h3>
            <OrderTimeline
              steps={steps}
              currentIndex={currentStepIndex}
              isClosed={isClosed}
              closedLabel={closedLabel}
            />
          </section>

          <section className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-soft md:p-6">
            <div className="flex items-start gap-4">
              <span className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-primary-light">
                <Image
                  src={imageUrl}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-xs font-semibold tracking-wide text-clay-dark">
                  {typeLabel}
                </span>
                <Link href={eventHref} className="font-heading text-xl">
                  {eventTitle}
                </Link>
              </div>
            </div>
            <ul className="flex flex-col gap-2 text-sm">
              <li className="flex items-center gap-2.5">
                <CalendarDays
                  className="size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                {dateLabel}
              </li>
              <li className="flex items-center gap-2.5">
                <Clock
                  className="size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                {timeRange}
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span>
                  {location}
                  <span className="block text-xs text-muted-foreground">
                    {address}
                  </span>
                </span>
              </li>
            </ul>
            {note && (
              <p className="border-t border-border pt-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Your note:</span>{" "}
                {note}
              </p>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
          <section className="flex flex-col gap-3 rounded-3xl bg-cream p-5 md:p-6">
            <h3 className="font-heading text-xl">Summary</h3>
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  {pluralize(seats, "seat")} × {formatInr(unitPrice)}
                </dt>
                <dd>{formatInr(unitPrice * seats)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-primary">
                  <dt>Discount</dt>
                  <dd>−{formatInr(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                <dt>Total</dt>
                <dd>{formatInr(total)}</dd>
              </div>
            </dl>
          </section>

          <div className="flex flex-col gap-2">
            {whatsappUrl && !isJustPlaced && (
              <Button variant="outline" className="rounded-full" asChild>
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  <MessageCircle className="size-4" />
                  Message us about this booking
                </a>
              </Button>
            )}
            {canCancel && (
              <Button
                variant="ghost"
                className="rounded-full text-destructive hover:text-destructive"
                onClick={onCancel}
                disabled={isCancelling}
              >
                {isCancelling ? "Cancelling…" : "Cancel this booking"}
              </Button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
