"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useCallback, useState } from "react";

import { formatDateTime, formatInr } from "@/lib/format";

import { toSelectionSummary } from "@/features/cart/types";
import { buildWhatsAppUrl } from "@/features/layout/types";
import { CancelOrderDialog } from "@/features/orders/components/CancelOrderDialog";
import { OrderDetail } from "@/features/orders/components/OrderDetail";
import { SignInWall } from "@/features/auth/components/SignInWall";
import { useCancelOrder, useOrder } from "@/features/orders/hooks";
import {
  isClosed,
  ORDER_STEPS,
  toStatusLabel,
  toStatusTone,
  toStepIndex,
  toWhatsAppOrderMessage,
} from "@/features/orders/types";
import { toProductPath } from "@/features/products/types";

export interface OrderDetailContainerProps {
  orderId: string;
  isJustPlaced: boolean;
  whatsappNumber: string;
}

export function OrderDetailContainer({
  orderId,
  isJustPlaced,
  whatsappNumber,
}: OrderDetailContainerProps) {
  const { order, isLoading, hasError, isSignedIn, refetch } = useOrder(orderId);
  const { openSignIn } = useClerk();
  const { cancel, isCancelling } = useCancelOrder();
  const { user } = useUser();
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [reason, setReason] = useState("");

  const handleConfirmCancel = useCallback(async () => {
    const done = await cancel(orderId, reason);
    if (done) setIsCancelOpen(false);
  }, [cancel, orderId, reason]);

  if (isLoading) {
    return (
      <div
        className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8"
        aria-busy="true"
      >
        <div className="h-8 w-56 animate-pulse bg-ash" />
        <div className="mt-8 h-64 animate-pulse bg-ash" />
      </div>
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
  if (hasError || !order) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-4 py-16 md:px-8">
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
      </div>
    );
  }

  const dates: Record<string, string | null> = {
    PENDING: formatDateTime(order.created_at),
    CONFIRMED: order.confirmed_at ? formatDateTime(order.confirmed_at) : null,
    PAID: order.paid_at ? formatDateTime(order.paid_at) : null,
    SHIPPED: order.shipped_at ? formatDateTime(order.shipped_at) : null,
    DELIVERED: order.delivered_at ? formatDateTime(order.delivered_at) : null,
  };
  const closed = isClosed(order.status);
  const closedLabel = closed
    ? `${toStatusLabel(order.status)}${order.cancelled_at ? ` on ${formatDateTime(order.cancelled_at)}` : ""}${order.cancel_reason ? ` · ${order.cancel_reason}` : ""}`
    : null;
  const whatsappUrl = whatsappNumber
    ? buildWhatsAppUrl(
        whatsappNumber,
        toWhatsAppOrderMessage({
          orderId: order.id,
          total: formatInr(order.total),
          items: order.items.map((item) => ({
            name: item.product_name,
            quantity: item.quantity,
          })),
          customerName: user?.fullName ?? order.shipping_address.name,
        }),
      )
    : null;
  const address = order.shipping_address;

  return (
    <>
      <OrderDetail
        orderId={order.id}
        placedOn={formatDateTime(order.created_at)}
        statusLabel={toStatusLabel(order.status)}
        statusTone={toStatusTone(order.status)}
        isJustPlaced={isJustPlaced && !closed}
        steps={ORDER_STEPS.map((step) => ({
          key: step.key,
          label: step.label,
          description: step.description,
          date: dates[step.key] ?? null,
        }))}
        currentStepIndex={toStepIndex(order.status)}
        isClosed={closed}
        closedLabel={closedLabel}
        items={order.items.map((item) => ({
          id: item.id,
          href: item.product ? toProductPath(item.product.slug) : null,
          name: item.product_name,
          imageUrl: item.product_image,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          lineTotal: item.line_total,
          selectionSummary: toSelectionSummary(item.selections),
        }))}
        subtotal={order.subtotal}
        discount={order.discount}
        couponCode={order.coupon_code}
        shippingFee={order.shipping_fee}
        total={order.total}
        addressLines={[
          address.name,
          address.phone,
          address.line1,
          address.line2 ?? "",
          address.landmark ?? "",
          `${address.city}, ${address.state} ${address.pincode}`,
        ].filter((line) => line.length > 0)}
        customerNote={order.customer_note}
        trackingNote={order.tracking_note}
        whatsappUrl={whatsappUrl}
        canCancel={order.can_cancel}
        isCancelling={isCancelling}
        onCancel={() => setIsCancelOpen(true)}
      />
      <CancelOrderDialog
        isOpen={isCancelOpen}
        reason={reason}
        isSubmitting={isCancelling}
        onReasonChange={setReason}
        onOpenChange={setIsCancelOpen}
        onConfirm={() => void handleConfirmCancel()}
      />
    </>
  );
}
