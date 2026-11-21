import { MessageCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/layout/SectionLabel";
import { PageShell } from "@/components/layout/PageShell";
import { formatInr, pluralize } from "@/lib/format";

import type { EventFact } from "@/features/events/types";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { Timeline } from "@/components/timeline/Timeline";
import type { TimelineStep } from "@/lib/timeline";

import type { StatusTone } from "@/features/orders/types";
import { WhatsAppLink } from "@/components/whatsapp/WhatsAppLink";

import { TEXT_LINK } from "@/features/events/components/styles";

export interface RegistrationDetailProps {
  registrationId: string;
  eventTitle: string;
  eventHref: string;
  statusLabel: string;
  statusTone: StatusTone;
  isRequestShown: boolean;
  steps: TimelineStep[];
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
  statusLabel,
  statusTone,
  isRequestShown,
  steps,
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
    <PageShell column="wide" className="flex flex-col gap-10 py-8 md:py-12">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
            Booking <span className="tnum">{registrationId}</span>
          </p>
          <h1 className="max-w-2xl font-heading text-3xl tracking-tight text-balance md:text-5xl">
            {eventTitle}
          </h1>
        </div>
        <OrderStatusBadge tone={statusTone} label={statusLabel} />
      </header>

      {isRequestShown && (
        <section className="flex flex-col gap-3 border border-ash bg-white p-6 md:p-8">
          <h2 className="font-heading text-2xl tracking-tight md:text-3xl">
            We have your request
          </h2>
          <p className="max-w-xl text-[15px] text-muted-foreground">
            Message us now, or we will write within a day.
          </p>
          {whatsappUrl && (
            <Button className="w-fit" asChild>
              <WhatsAppLink
                href={whatsappUrl}
                kind="event"
                reference={registrationId}
              >
                <MessageCircle className="size-4" strokeWidth={1.5} />
                Message us on WhatsApp
              </WhatsAppLink>
            </Button>
          )}
        </section>
      )}

      <div className="grid gap-10 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="flex flex-col gap-10">
          <section className="flex flex-col gap-4">
            <SectionLabel>Progress</SectionLabel>
            <Timeline steps={steps} closedLabel={closedLabel} />
          </section>

          <section className="flex flex-col gap-4">
            <SectionLabel>At the studio</SectionLabel>
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
            <Link href={eventHref} className={TEXT_LINK}>
              About this event
            </Link>
            {reviewAction}
          </section>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-24">
          <section className="flex flex-col gap-3">
            <SectionLabel>Summary</SectionLabel>
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
            {whatsappUrl && !isRequestShown && (
              <WhatsAppLink
                href={whatsappUrl}
                kind="event"
                reference={registrationId}
                className={TEXT_LINK}
              >
                Message us about this booking
              </WhatsAppLink>
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
    </PageShell>
  );
}
