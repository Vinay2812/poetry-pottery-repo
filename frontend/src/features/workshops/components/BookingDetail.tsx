import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatInr, pluralize } from "@/lib/format";

import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import {
  OrderTimeline,
  type OrderTimelineStep,
} from "@/features/orders/components/OrderTimeline";
import type { StatusTone } from "@/features/orders/types";
import type { SessionFact } from "@/features/workshops/types";

export interface BookingDetailProps {
  bookingId: string;
  bookedOn: string;
  statusLabel: string;
  statusTone: StatusTone;
  isJustPlaced: boolean;
  steps: OrderTimelineStep[];
  currentStepIndex: number;
  isClosed: boolean;
  closedLabel: string | null;
  facts: SessionFact[];
  participants: number;
  pricePerPerson: number;
  discount: number;
  total: number;
  note: string | null;
  whatsappUrl: string | null;
  canCancel: boolean;
  canReschedule: boolean;
  isCancelling: boolean;
  onCancel: () => void;
  onReschedule: () => void;
}

const TEXT_BUTTON =
  "w-fit border-b border-transparent pb-0.5 text-[13px] text-muted-foreground transition-colors hover:border-ink hover:text-ink disabled:opacity-50";

export function BookingDetail({
  bookingId,
  bookedOn,
  statusLabel,
  statusTone,
  isJustPlaced,
  steps,
  currentStepIndex,
  isClosed,
  closedLabel,
  facts,
  participants,
  pricePerPerson,
  discount,
  total,
  note,
  whatsappUrl,
  canCancel,
  canReschedule,
  isCancelling,
  onCancel,
  onReschedule,
}: BookingDetailProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 md:px-6 md:py-12">
      {isJustPlaced && (
        <section className="flex flex-col gap-3 border border-ash bg-white p-6 md:p-8">
          <h1 className="font-heading text-3xl tracking-tight md:text-4xl">
            We are holding the wheel
          </h1>
          <p className="max-w-xl text-[15px] text-muted-foreground">
            Send us a message and we will confirm the session and share payment
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
            Session <span className="tnum">{bookingId}</span>
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
            <h3 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
              At the studio
            </h3>
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
                  {pluralize(participants, "person", "people")} ×{" "}
                  {formatInr(pricePerPerson)}
                </dt>
                <dd className="tnum">
                  {formatInr(pricePerPerson * participants)}
                </dd>
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
                Message us about this session
              </a>
            )}
            {canReschedule && (
              <button
                type="button"
                onClick={onReschedule}
                className={TEXT_BUTTON}
              >
                Move to another day
              </button>
            )}
            {canCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isCancelling}
                className={TEXT_BUTTON}
              >
                {isCancelling ? "Cancelling…" : "Cancel this session"}
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
