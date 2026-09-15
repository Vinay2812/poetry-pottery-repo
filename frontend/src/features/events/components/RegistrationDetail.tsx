import { MessageCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatInr, pluralize } from "@/lib/format";

import type { EventFact } from "@/features/events/types";
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
  bookedOn: string;
  statusLabel: string;
  statusTone: StatusTone;
  isJustPlaced: boolean;
  steps: OrderTimelineStep[];
  currentStepIndex: number;
  isClosed: boolean;
  closedLabel: string | null;
  facts: EventFact[];
  seats: number;
  unitPrice: number;
  discount: number;
  total: number;
  note: string | null;
  whatsappUrl: string | null;
  canCancel: boolean;
  isCancelling: boolean;
  reviewAction: React.ReactNode;
  onCancel: () => void;
}

export function RegistrationDetail({
  registrationId,
  eventTitle,
  eventHref,
  bookedOn,
  statusLabel,
  statusTone,
  isJustPlaced,
  steps,
  currentStepIndex,
  isClosed,
  closedLabel,
  facts,
  seats,
  unitPrice,
  discount,
  total,
  note,
  whatsappUrl,
  canCancel,
  isCancelling,
  reviewAction,
  onCancel,
}: RegistrationDetailProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 md:px-6 md:py-12">
      {isJustPlaced && (
        <section className="flex flex-col gap-3 border border-ash bg-white p-6 md:p-8">
          <h1 className="font-heading text-3xl tracking-tight md:text-4xl">
            We are holding your seat
          </h1>
          <p className="max-w-xl text-[15px] text-muted-foreground">
            Send us a message and we will confirm the seat and share payment
            details, or wait for ours within a day.
          </p>
          {whatsappUrl && (
            <Button className="w-fit" asChild>
              <a href={whatsappUrl} target="_blank" rel="noreferrer">
                <MessageCircle className="size-4" strokeWidth={1.5} />
                Confirm on WhatsApp
              </a>
            </Button>
          )}
        </section>
      )}

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-[13px] text-muted-foreground">Booked {bookedOn}</p>
          <h2 className="font-heading text-2xl tracking-tight md:text-3xl">
            Booking <span className="tnum">{registrationId}</span>
          </h2>
        </div>
        <OrderStatusBadge tone={statusTone} label={statusLabel} />
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="flex flex-col gap-10">
          <section className="flex flex-col gap-4">
            <h3 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
              Progress
            </h3>
            <OrderTimeline
              steps={steps}
              currentIndex={currentStepIndex}
              isClosed={isClosed}
              closedLabel={closedLabel}
            />
          </section>

          <section className="flex flex-col gap-4">
            <Link
              href={eventHref}
              className="font-heading text-2xl tracking-tight underline-offset-4 hover:underline"
            >
              {eventTitle}
            </Link>
            <dl className="border-t border-ash">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="grid grid-cols-[7rem_1fr] gap-4 border-b border-ash py-3 text-sm md:grid-cols-[9rem_1fr]"
                >
                  <dt className="text-muted-foreground">{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
            {note && (
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground">Your note:</span> {note}
              </p>
            )}
            {reviewAction}
          </section>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-24">
          <section className="flex flex-col gap-3">
            <h3 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
              Summary
            </h3>
            <dl className="border-t border-ash text-sm">
              <div className="flex justify-between border-b border-ash py-3">
                <dt className="text-muted-foreground">
                  {pluralize(seats, "seat")} × {formatInr(unitPrice)}
                </dt>
                <dd className="tnum">{formatInr(unitPrice * seats)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between border-b border-ash py-3">
                  <dt className="text-muted-foreground">Discount</dt>
                  <dd className="text-primary tnum">−{formatInr(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between border-b border-ash py-3">
                <dt>Total</dt>
                <dd className="tnum">{formatInr(total)}</dd>
              </div>
            </dl>
          </section>

          <div className="flex flex-col items-start gap-3">
            {whatsappUrl && !isJustPlaced && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-fit border-b border-ink pb-0.5 text-[13px] hover:border-primary hover:text-primary"
              >
                Message us about this booking
              </a>
            )}
            {canCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isCancelling}
                className="w-fit border-b border-transparent pb-0.5 text-[13px] text-muted-foreground hover:border-ink hover:text-ink disabled:opacity-50"
              >
                {isCancelling ? "Cancelling…" : "Cancel this booking"}
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
