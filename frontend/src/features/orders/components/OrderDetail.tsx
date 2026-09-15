import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  OrderItemRow,
  type OrderItemRowProps,
} from "@/features/orders/components/OrderItemRow";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import {
  OrderTimeline,
  type OrderTimelineStep,
} from "@/features/orders/components/OrderTimeline";
import { OrderTotals } from "@/features/orders/components/OrderTotals";
import type { StatusTone } from "@/features/orders/types";

export interface OrderDetailProps {
  orderId: string;
  placedOn: string;
  statusLabel: string;
  statusTone: StatusTone;
  isJustPlaced: boolean;
  steps: OrderTimelineStep[];
  currentStepIndex: number;
  isClosed: boolean;
  closedLabel: string | null;
  items: (OrderItemRowProps & { id: number })[];
  subtotal: number;
  discount: number;
  couponCode: string | null;
  shippingFee: number;
  total: number;
  addressLines: string[];
  customerNote: string | null;
  trackingNote: string | null;
  whatsappUrl: string | null;
  canCancel: boolean;
  isCancelling: boolean;
  onCancel: () => void;
}

export function OrderDetail({
  orderId,
  placedOn,
  statusLabel,
  statusTone,
  isJustPlaced,
  steps,
  currentStepIndex,
  isClosed,
  closedLabel,
  items,
  subtotal,
  discount,
  couponCode,
  shippingFee,
  total,
  addressLines,
  customerNote,
  trackingNote,
  whatsappUrl,
  canCancel,
  isCancelling,
  onCancel,
}: OrderDetailProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 md:px-8 md:py-10">
      {isJustPlaced && (
        <section className="flex flex-col gap-3 rounded-3xl bg-primary p-6 text-primary-foreground md:p-8">
          <p className="font-script text-2xl italic">Thank you</p>
          <h1 className="font-heading text-3xl md:text-4xl">
            Your order is in
          </h1>
          <p className="max-w-xl text-primary-foreground/90">
            We confirm every order personally. Send us a WhatsApp now and we
            will reply with payment details, or wait for our message within a
            day.
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
          <p className="text-xs text-muted-foreground">Placed {placedOn}</p>
          <h2 className="font-heading text-2xl md:text-4xl">
            Order{" "}
            <span className="font-mono text-xl tracking-wide md:text-2xl">
              {orderId}
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
            {trackingNote && (
              <p className="mt-2 rounded-2xl bg-primary-light p-3 text-sm">
                {trackingNote}
              </p>
            )}
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold tracking-[0.12em] text-clay-dark uppercase">
              Pieces
            </h3>
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <OrderItemRow
                  key={item.id}
                  href={item.href}
                  name={item.name}
                  imageUrl={item.imageUrl}
                  quantity={item.quantity}
                  unitPrice={item.unitPrice}
                  lineTotal={item.lineTotal}
                  selectionSummary={item.selectionSummary}
                />
              ))}
            </ul>
          </section>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
          <section className="flex flex-col gap-4 rounded-3xl bg-cream p-5 md:p-6">
            <h3 className="font-heading text-xl">Summary</h3>
            <OrderTotals
              subtotal={subtotal}
              discount={discount}
              couponCode={couponCode}
              shippingFee={shippingFee}
              total={total}
            />
          </section>
          <section className="rounded-3xl bg-card p-5 shadow-soft md:p-6">
            <h3 className="mb-2 text-xs font-semibold tracking-[0.12em] text-clay-dark uppercase">
              Delivering to
            </h3>
            <address className="text-sm leading-relaxed not-italic">
              {addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            {customerNote && (
              <p className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Your note:</span>{" "}
                {customerNote}
              </p>
            )}
          </section>
          <div className="flex flex-col gap-2">
            {whatsappUrl && !isJustPlaced && (
              <Button variant="outline" className="rounded-full" asChild>
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  <MessageCircle className="size-4" />
                  Message us about this order
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
                {isCancelling ? "Cancelling…" : "Cancel this order"}
              </Button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
