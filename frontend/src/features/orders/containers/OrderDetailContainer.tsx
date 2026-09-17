"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useCallback, useOptimistic, useState, useTransition } from "react";

import { OrderStatus } from "@/graphql/generated/graphql";

import { formatDateTime, formatInr } from "@/lib/format";

import { PageShell } from "@/components/layout/PageShell";

import { toSelectionSummary } from "@/features/cart/types";
import { buildWhatsAppUrl } from "@/features/layout/types";
import { CancelOrderDialog } from "@/features/orders/components/CancelOrderDialog";
import { OrderDetail } from "@/features/orders/components/OrderDetail";
import { SignInWall } from "@/features/auth/components/SignInWall";
import { useCancelOrder, useOrder } from "@/features/orders/hooks";
import {
  applyOrderCancellation,
  isClosed,
  ORDER_STEPS,
  toArrivalWindow,
  toDeliveredCareLines,
  toFirstName,
  toStatusLabel,
  toStatusTone,
  toStepIndex,
  toWhatsAppOrderMessage,
} from "@/features/orders/types";
import { toProductPath } from "@/features/products/types";
import { ReviewActionContainer } from "@/features/reviews";

export interface OrderDetailContainerProps {
  orderId: string;
  isJustPlaced: boolean;
  whatsappNumber: string;
  dispatchDaysMin: number;
  dispatchDaysMax: number;
}

const TRANSIT_LINE =
  "Everything is packed by hand and goes by courier, so a day either way is normal.";

export function OrderDetailContainer({
  orderId,
  isJustPlaced,
  whatsappNumber,
  dispatchDaysMin,
  dispatchDaysMax,
}: OrderDetailContainerProps) {
  const { order, isLoading, hasError, isSignedIn, refetch } = useOrder(orderId);
  const [optimisticOrder, applyCancellation] = useOptimistic(
    order,
    applyOrderCancellation,
  );
  const [, startTransition] = useTransition();
  const { openSignIn } = useClerk();
  const { cancel, isCancelling } = useCancelOrder();
  const { user } = useUser();
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [reason, setReason] = useState("");

  // The dialog closes and the badge turns at once; a refusal rolls both back with a toast.
  const handleConfirmCancel = useCallback(() => {
    setIsCancelOpen(false);
    startTransition(async () => {
      applyCancellation({ reason, at: new Date().toISOString() });
      await cancel(orderId, reason);
    });
  }, [applyCancellation, cancel, orderId, reason]);

  if (isLoading) {
    return (
      <PageShell column="wide" className="py-8 md:py-12" isBusy>
        <div className="h-8 w-56 animate-pulse bg-ash" />
        <div className="mt-8 h-64 animate-pulse bg-ash" />
      </PageShell>
    );
  }
  if (!isSignedIn) {
    return (
      <SignInWall
        message="Sign in to see this order"
        onSignIn={() => openSignIn()}
      />
    );
  }
  if (hasError || !optimisticOrder) {
    return (
      <PageShell
        column="wide"
        className="flex flex-col items-start gap-4 py-16"
      >
        <h1 className="font-heading text-2xl tracking-tight">
          We could not find that order
        </h1>
        <button
          type="button"
          onClick={() => void refetch()}
          className="text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Try again
        </button>
      </PageShell>
    );
  }

  const dates: Record<string, string | null> = {
    PENDING: formatDateTime(optimisticOrder.created_at),
    CONFIRMED: optimisticOrder.confirmed_at
      ? formatDateTime(optimisticOrder.confirmed_at)
      : null,
    PAID: optimisticOrder.paid_at
      ? formatDateTime(optimisticOrder.paid_at)
      : null,
    SHIPPED: optimisticOrder.shipped_at
      ? formatDateTime(optimisticOrder.shipped_at)
      : null,
    DELIVERED: optimisticOrder.delivered_at
      ? formatDateTime(optimisticOrder.delivered_at)
      : null,
  };
  const closed = isClosed(optimisticOrder.status);
  const isDelivered = optimisticOrder.status === OrderStatus.Delivered;
  const closedLabel = closed
    ? `${toStatusLabel(optimisticOrder.status)}${optimisticOrder.cancelled_at ? ` on ${formatDateTime(optimisticOrder.cancelled_at)}` : ""}${optimisticOrder.cancel_reason ? ` · ${optimisticOrder.cancel_reason}` : ""}`
    : null;
  const whatsappUrl = whatsappNumber
    ? buildWhatsAppUrl(
        whatsappNumber,
        toWhatsAppOrderMessage({
          orderId: optimisticOrder.id,
          total: formatInr(optimisticOrder.total),
          items: optimisticOrder.items.map((item) => ({
            name: item.product_name,
            quantity: item.quantity,
          })),
          customerName: user?.fullName ?? optimisticOrder.shipping_address.name,
        }),
      )
    : null;
  const address = optimisticOrder.shipping_address;

  return (
    <>
      <OrderDetail
        orderId={optimisticOrder.id}
        placedOn={formatDateTime(optimisticOrder.created_at)}
        statusLabel={toStatusLabel(optimisticOrder.status)}
        statusTone={toStatusTone(optimisticOrder.status)}
        isJustPlaced={isJustPlaced && !closed}
        firstName={toFirstName(user?.firstName, address.name)}
        arrivalLine={toArrivalWindow(
          optimisticOrder.created_at,
          dispatchDaysMin,
          dispatchDaysMax,
        )}
        transitLine={TRANSIT_LINE}
        emailedTo={user?.primaryEmailAddress?.emailAddress ?? null}
        steps={ORDER_STEPS.map((step) => ({
          key: step.key,
          label: step.label,
          description: step.description,
          date: dates[step.key] ?? null,
        }))}
        currentStepIndex={toStepIndex(optimisticOrder.status, dates)}
        isClosed={closed}
        closedLabel={closedLabel}
        items={optimisticOrder.items.map((item) => ({
          id: item.id,
          href: item.product ? toProductPath(item.product.slug) : null,
          name: item.product_name,
          imageUrl: item.product_image,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          lineTotal: item.line_total,
          selectionSummary: toSelectionSummary(item.selections),
          referenceImageUrls: item.reference_image_urls,
          action:
            isDelivered && item.product ? (
              <ReviewActionContainer
                kind="product"
                subjectId={item.product.id}
                slug={item.product.slug}
                subjectName={item.product_name}
              />
            ) : null,
        }))}
        studioNotes={optimisticOrder.studio_notes.map((note) => ({
          id: note.id,
          body: note.body,
          imageUrl: note.image_url,
          writtenOn: formatDateTime(note.created_at),
        }))}
        careLines={toDeliveredCareLines(
          optimisticOrder.status,
          optimisticOrder.care_notes,
        )}
        subtotal={optimisticOrder.subtotal}
        discount={optimisticOrder.discount}
        couponCode={optimisticOrder.coupon_code}
        shippingFee={optimisticOrder.shipping_fee}
        total={optimisticOrder.total}
        addressLines={[
          address.name,
          address.phone,
          address.line1,
          address.line2 ?? "",
          address.landmark ?? "",
          `${address.city}, ${address.state} ${address.pincode}`,
        ].filter((line) => line.length > 0)}
        customerNote={optimisticOrder.customer_note}
        giftNote={optimisticOrder.gift_note}
        hasHiddenPrices={optimisticOrder.hide_prices}
        trackingNote={optimisticOrder.tracking_note}
        whatsappUrl={whatsappUrl}
        canCancel={optimisticOrder.can_cancel}
        isCancelling={isCancelling}
        onCancel={() => setIsCancelOpen(true)}
      />
      <CancelOrderDialog
        isOpen={isCancelOpen}
        reason={reason}
        isSubmitting={isCancelling}
        onReasonChange={setReason}
        onOpenChange={setIsCancelOpen}
        onConfirm={handleConfirmCancel}
      />
    </>
  );
}
