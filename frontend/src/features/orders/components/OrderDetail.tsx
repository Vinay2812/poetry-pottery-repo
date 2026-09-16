import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/PageShell";

import { OrderCareGuide } from "@/features/orders/components/OrderCareGuide";
import { OrderPlacedBanner } from "@/features/orders/components/OrderPlacedBanner";
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
import {
  StudioNote,
  type StudioNoteProps,
} from "@/features/orders/components/StudioNote";
import type { StatusTone } from "@/features/orders/types";

export interface OrderDetailProps {
  orderId: string;
  placedOn: string;
  statusLabel: string;
  statusTone: StatusTone;
  isJustPlaced: boolean;
  firstName: string;
  arrivalLine: string;
  transitLine: string;
  emailedTo: string | null;
  steps: OrderTimelineStep[];
  currentStepIndex: number;
  isClosed: boolean;
  closedLabel: string | null;
  items: (OrderItemRowProps & { id: number })[];
  studioNotes: (StudioNoteProps & { id: number })[];
  careLines: string[];
  subtotal: number;
  discount: number;
  couponCode: string | null;
  shippingFee: number;
  total: number;
  addressLines: string[];
  customerNote: string | null;
  giftNote: string | null;
  hasHiddenPrices: boolean;
  trackingNote: string | null;
  whatsappUrl: string | null;
  canCancel: boolean;
  isCancelling: boolean;
  onCancel: () => void;
}

const SECTION_HEADING =
  "border-b border-ash pb-3 font-heading text-xl tracking-tight";

export function OrderDetail({
  orderId,
  placedOn,
  statusLabel,
  statusTone,
  isJustPlaced,
  firstName,
  arrivalLine,
  transitLine,
  emailedTo,
  steps,
  currentStepIndex,
  isClosed,
  closedLabel,
  items,
  studioNotes,
  careLines,
  subtotal,
  discount,
  couponCode,
  shippingFee,
  total,
  addressLines,
  customerNote,
  giftNote,
  hasHiddenPrices,
  trackingNote,
  whatsappUrl,
  canCancel,
  isCancelling,
  onCancel,
}: OrderDetailProps) {
  return (
    <PageShell column="wide" className="flex flex-col gap-8 py-8 md:py-12">
      {isJustPlaced && (
        <OrderPlacedBanner
          firstName={firstName}
          pieces={items.map((item) => ({
            id: item.id,
            name: item.name,
            imageUrl: item.imageUrl,
          }))}
          arrivalLine={arrivalLine}
          transitLine={transitLine}
          emailedTo={emailedTo}
          whatsappUrl={whatsappUrl}
        />
      )}

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-[13px] text-muted-foreground">Placed {placedOn}</p>
          <h2 className="font-heading text-2xl tracking-tight md:text-4xl">
            Order <span className="tnum">{orderId}</span>
          </h2>
        </div>
        <OrderStatusBadge tone={statusTone} label={statusLabel} />
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="flex flex-col gap-10">
          <section className="flex flex-col gap-5">
            <h3 className={SECTION_HEADING}>Progress</h3>
            <OrderTimeline
              steps={steps}
              currentIndex={currentStepIndex}
              isClosed={isClosed}
              closedLabel={closedLabel}
            />
            {trackingNote && (
              <p className="text-[13px] text-muted-foreground">
                {trackingNote}
              </p>
            )}
          </section>

          <section className="flex flex-col gap-4">
            <h3 className={SECTION_HEADING}>Pieces</h3>
            <ul className="flex flex-col">
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
                  referenceImageUrls={item.referenceImageUrls}
                />
              ))}
            </ul>
          </section>

          {studioNotes.length > 0 && (
            <section className="flex flex-col gap-4">
              <h3 className={SECTION_HEADING}>From the studio</h3>
              <ul className="flex flex-col">
                {studioNotes.map((note) => (
                  <StudioNote
                    key={note.id}
                    body={note.body}
                    imageUrl={note.imageUrl}
                    writtenOn={note.writtenOn}
                  />
                ))}
              </ul>
            </section>
          )}

          {careLines.length > 0 && <OrderCareGuide lines={careLines} />}
        </div>

        <aside className="flex flex-col gap-8 lg:sticky lg:top-24">
          <section className="flex flex-col gap-4">
            <h3 className={SECTION_HEADING}>Summary</h3>
            <OrderTotals
              subtotal={subtotal}
              discount={discount}
              couponCode={couponCode}
              shippingFee={shippingFee}
              total={total}
            />
          </section>
          <section className="flex flex-col gap-4">
            <h3 className={SECTION_HEADING}>Delivering to</h3>
            <address className="text-sm leading-relaxed not-italic">
              {addressLines.map((line, index) => (
                <span key={index} className="block">
                  {line}
                </span>
              ))}
            </address>
            {customerNote && (
              <p className="text-[13px] text-muted-foreground">
                Your note: {customerNote}
              </p>
            )}
          </section>
          {(giftNote || hasHiddenPrices) && (
            <section className="flex flex-col gap-4">
              <h3 className={SECTION_HEADING}>Sent as a gift</h3>
              {giftNote && (
                <p className="font-script text-lg leading-relaxed italic">
                  “{giftNote}”
                </p>
              )}
              <p className="text-[13px] text-muted-foreground">
                {hasHiddenPrices
                  ? "The packing slip goes in without prices."
                  : "The packing slip goes in as usual."}
              </p>
            </section>
          )}
          <div className="flex flex-col items-start gap-3">
            {whatsappUrl && !isJustPlaced && (
              <Button variant="outline" asChild>
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  <MessageCircle className="size-4" strokeWidth={1.5} />
                  Message us about this order
                </a>
              </Button>
            )}
            {canCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isCancelling}
                className="text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50"
              >
                {isCancelling ? "Cancelling…" : "Cancel this order"}
              </button>
            )}
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
