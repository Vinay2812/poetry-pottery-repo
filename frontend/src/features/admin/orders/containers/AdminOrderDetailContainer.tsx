"use client";

import { useCallback, useMemo, useOptimistic, useState } from "react";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  AddOrderNoteDocument,
  AdminOrderDocument,
  CancelOrderAsAdminDocument,
  MarkOrderPaidDocument,
  OrderStatus,
  SetOrderAdminNoteDocument,
  SetOrderStatusDocument,
  UploadPurpose,
} from "@/graphql/generated/graphql";

import { formatDate, formatDateTime, formatInr } from "@/lib/format";
import { useOptimisticAction } from "@/lib/use-optimistic-action";
import { useReasonAction } from "@/lib/use-reason-action";

import type { StudioNoteFormValues } from "@/lib/validations/admin/order";

import Link from "next/link";

import { Button } from "@/components/ui/button";

import { toProductPath } from "@/features/products/types";

import { formatEnumLabel } from "@/features/admin/shell";
import {
  AdminPageHeader,
  AdminReasonDialog,
  AdminStatusPill,
  orderStatusTone,
  toPersonName,
} from "@/features/admin/ui";

import { AdminOrderActions } from "@/features/admin/orders/components/AdminOrderActions";
import { AdminOrderCustomer } from "@/features/admin/orders/components/AdminOrderCustomer";
import {
  AdminOrderItems,
  type AdminOrderItemRow,
} from "@/features/admin/orders/components/AdminOrderItems";
import { AdminOrderGift } from "@/features/admin/orders/components/AdminOrderGift";
import { AdminOrderNote } from "@/features/admin/orders/components/AdminOrderNote";
import { AdminOrderTimeline } from "@/features/admin/orders/components/AdminOrderTimeline";
import { AdminOrderTotals } from "@/features/admin/orders/components/AdminOrderTotals";
import { StudioNoteForm } from "@/features/admin/orders/components/StudioNoteForm";
import {
  type StudioNoteRow,
  StudioNotesList,
} from "@/features/admin/orders/components/StudioNotesList";
import {
  applyAdminOrderPatch,
  buildOrderTimeline,
  describeItems,
  describeGiftHandling,
  toAdminNoteValue,
  toPackingSlipHref,
  toSelectionLabel,
  toStatusActions,
} from "@/features/admin/orders/types";

import { ImageUploaderContainer } from "@/features/admin/uploads";

export interface AdminOrderDetailContainerProps {
  orderId: string;
}

const SECTION_TITLE =
  "text-[11px] tracking-[0.14em] text-muted-foreground uppercase";

export function AdminOrderDetailContainer({
  orderId,
}: AdminOrderDetailContainerProps) {
  const { data, previousData, loading, error, refetch } = useQuery(
    AdminOrderDocument,
    {
      variables: { id: orderId },
      fetchPolicy: "cache-and-network",
    },
  );
  const [setOrderStatus] = useMutation(SetOrderStatusDocument);
  const [markOrderPaid] = useMutation(MarkOrderPaidDocument);
  const [cancelOrderAsAdmin] = useMutation(CancelOrderAsAdminDocument);
  const [setOrderAdminNote] = useMutation(SetOrderAdminNoteDocument);
  const [addOrderNote] = useMutation(AddOrderNoteDocument);

  const detail = data?.adminOrder ?? previousData?.adminOrder ?? null;
  const [optimisticDetail, applyPatch] = useOptimistic(
    detail,
    applyAdminOrderPatch,
  );

  const [noteDraft, setNoteDraft] = useState<string | null>(null);
  const [isNoteSaved, setIsNoteSaved] = useState(false);
  const [studioPhotoUrl, setStudioPhotoUrl] = useState<string | null>(null);
  const [studioFormKey, setStudioFormKey] = useState(0);

  const order = optimisticDetail?.order ?? null;
  const savedNote = optimisticDetail?.admin_note ?? "";
  const noteValue = noteDraft ?? savedNote;

  const studioNoteRows = useMemo<StudioNoteRow[]>(
    () =>
      (order?.studio_notes ?? []).map((note) => ({
        id: note.id,
        body: note.body,
        imageUrl: note.image_url,
        sentLabel: formatDateTime(note.created_at),
      })),
    [order],
  );

  const itemRows = useMemo<AdminOrderItemRow[]>(
    () =>
      (order?.items ?? []).map((item) => ({
        id: item.id,
        name: item.product_name,
        href: item.product ? toProductPath(item.product.slug) : null,
        imageUrl: item.product_image,
        selectionLabels: item.selections.map(toSelectionLabel),
        referenceImageUrls: item.reference_image_urls,
        unitPriceLabel: formatInr(item.unit_price),
        quantity: item.quantity,
        lineTotalLabel: formatInr(item.line_total),
      })),
    [order],
  );

  const timelineSteps = useMemo(
    () =>
      order
        ? buildOrderTimeline(order).map((entry) => ({
            key: entry.key,
            label: entry.label,
            atLabel: formatDateTime(entry.at),
            note: entry.note,
          }))
        : [],
    [order],
  );

  const statusActions = useMemo(
    () => toStatusActions(optimisticDetail?.next_statuses ?? []),
    [optimisticDetail],
  );

  // Every move finishes with a refetch, so the fresh payload is the baseline the
  // optimistic layer falls back to.
  const move = useReasonAction({
    patch: ({ target, reason }) =>
      applyPatch({
        at: new Date().toISOString(),
        status: target,
        ...(target === OrderStatus.Shipped
          ? { trackingNote: reason ?? "" }
          : {}),
        ...(target === OrderStatus.Cancelled
          ? { cancelReason: reason ?? "" }
          : {}),
      }),
    run: ({ target, reason }) => {
      if (target === OrderStatus.Paid) {
        return markOrderPaid({ variables: { id: orderId } });
      }
      if (target === OrderStatus.Cancelled) {
        return cancelOrderAsAdmin({ variables: { id: orderId, reason } });
      }
      return setOrderStatus({
        variables: {
          id: orderId,
          status: target,
          tracking_note: target === OrderStatus.Shipped ? reason : null,
          cancel_reason: null,
        },
      });
    },
    refresh: refetch,
    // A cancellation always tells the customer why; a tracking note can wait.
    policy: (target: OrderStatus) => {
      if (target === OrderStatus.Cancelled) return "required";
      return target === OrderStatus.Shipped ? "optional" : "none";
    },
    requiredMessage: "Say why this order is being cancelled",
    messages: {
      success: ({ target }) =>
        `Order is now ${formatEnumLabel(target).toLowerCase()}`,
      failure: "The order could not be moved",
    },
  });

  const { execute: saveNote, isPending: isNoteSaving } = useOptimisticAction({
    patch: (note: string | null) =>
      applyPatch({ at: new Date().toISOString(), adminNote: note }),
    run: (note) => setOrderAdminNote({ variables: { id: orderId, note } }),
    refresh: refetch,
    messages: { success: null, failure: "The note could not be saved" },
    onSuccess: () => {
      setNoteDraft(null);
      setIsNoteSaved(true);
    },
  });

  const handleNoteSave = useCallback(
    () => saveNote(toAdminNoteValue(noteValue)),
    [noteValue, saveNote],
  );

  // A studio note is mailed the moment it is sent, so there is nothing to roll back.
  const { execute: sendStudioNote, isPending: isStudioNoteSending } =
    useOptimisticAction({
      run: (values: StudioNoteFormValues) =>
        addOrderNote({
          variables: {
            input: {
              order_id: orderId,
              body: values.body,
              image_url: studioPhotoUrl,
            },
          },
        }),
      refresh: refetch,
      messages: {
        success: "Note sent to the customer",
        failure: "The note could not be sent",
      },
      onSuccess: () => {
        setStudioPhotoUrl(null);
        setStudioFormKey((key) => key + 1);
      },
    });

  const handleNoteChange = useCallback((value: string) => {
    setNoteDraft(value);
    setIsNoteSaved(false);
  }, []);

  if (!optimisticDetail && loading) {
    return (
      <div aria-busy="true" className="flex flex-col gap-3">
        <div className="h-16 animate-pulse bg-ash" />
        <div className="h-64 animate-pulse bg-ash" />
      </div>
    );
  }

  if (!optimisticDetail || !order) {
    return (
      <div className="flex flex-col gap-4">
        <AdminPageHeader eyebrow="Studio" title="Order" description={null} />
        <p className="text-[13px]">
          {error ? "That order could not be loaded." : "No order with that id."}
        </p>
      </div>
    );
  }

  const customer = optimisticDetail.customer;
  const address = order.shipping_address;
  const addressLines = [
    address.name,
    address.phone,
    address.line1,
    address.line2 ?? "",
    address.landmark ?? "",
    `${address.city}, ${address.state} ${address.pincode}`,
  ].filter((line) => line.length > 0);

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Order"
        title={order.id}
        description={`${formatDate(order.created_at)} · ${describeItems(order.item_count)} · ${formatInr(order.total)}`}
        actions={
          <>
            <AdminStatusPill
              label={formatEnumLabel(order.status)}
              tone={orderStatusTone(order.status)}
            />
            <Button asChild type="button" variant="secondary" size="sm">
              <Link href={toPackingSlipHref(order.id)}>Packing slip</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-8">
          <AdminOrderItems rows={itemRows} />
          <div className="max-w-sm">
            <AdminOrderTotals
              subtotalLabel={formatInr(order.subtotal)}
              discountLabel={
                order.discount > 0 ? formatInr(order.discount) : null
              }
              couponCode={order.coupon_code}
              shippingLabel={
                order.shipping_fee === 0
                  ? "Free"
                  : formatInr(order.shipping_fee)
              }
              totalLabel={formatInr(order.total)}
            />
          </div>
          <section className="flex flex-col gap-3 border-t border-ash pt-6">
            <h2 className={SECTION_TITLE}>What happens next</h2>
            <AdminOrderActions
              actions={statusActions}
              busyStatus={move.pending}
              isBusy={move.isPending}
              emptyMessage="This order is closed. Nothing left to move."
              onAction={move.start}
            />
          </section>
          <section className="flex flex-col gap-3 border-t border-ash pt-6">
            <h2 className={SECTION_TITLE}>Notes from the studio</h2>
            <StudioNotesList rows={studioNoteRows} />
            <StudioNoteForm
              key={studioFormKey}
              isSending={isStudioNoteSending}
              photoField={
                <ImageUploaderContainer
                  id="studio-note-photo"
                  label="Photo"
                  purpose={UploadPurpose.OrderNote}
                  value={studioPhotoUrl}
                  onChange={setStudioPhotoUrl}
                />
              }
              onSubmit={sendStudioNote}
            />
          </section>
          <section className="border-t border-ash pt-6">
            <AdminOrderNote
              value={noteValue}
              isDirty={noteValue !== savedNote}
              isSaving={isNoteSaving}
              isSaved={isNoteSaved}
              onChange={handleNoteChange}
              onSave={handleNoteSave}
            />
          </section>
        </div>

        <aside className="flex flex-col gap-8">
          <AdminOrderCustomer
            name={toPersonName(customer.name, customer.email)}
            email={customer.email}
            personHref={`/dashboard/people/${customer.id}`}
            addressLines={addressLines}
            customerNote={order.customer_note}
          />
          <section className="flex flex-col gap-3 border-t border-ash pt-6">
            <h2 className={SECTION_TITLE}>
              {describeGiftHandling(order.gift_note, order.hide_prices)}
            </h2>
            <AdminOrderGift
              giftNote={order.gift_note}
              isPricesHidden={order.hide_prices}
            />
          </section>
          <section className="flex flex-col gap-3 border-t border-ash pt-6">
            <h2 className={SECTION_TITLE}>Timeline</h2>
            <AdminOrderTimeline steps={timelineSteps} />
          </section>
        </aside>
      </div>

      <AdminReasonDialog
        isOpen={move.target !== null}
        title={
          move.target === OrderStatus.Cancelled
            ? "Cancel this order"
            : "Mark this order shipped"
        }
        description={
          move.target === OrderStatus.Cancelled
            ? "The pieces go back on the shelf straight away."
            : "The customer sees this note on their order page."
        }
        fieldLabel={
          move.target === OrderStatus.Cancelled ? "Reason" : "Tracking note"
        }
        hint={
          move.target === OrderStatus.Cancelled
            ? "The customer reads this, so keep it kind"
            : "Courier and tracking number"
        }
        placeholder={
          move.target === OrderStatus.Cancelled
            ? "The batch cracked in the kiln"
            : "Delhivery 7712445901"
        }
        value={move.reason}
        error={move.error}
        confirmLabel={
          move.target === OrderStatus.Cancelled
            ? "Cancel order"
            : "Mark shipped"
        }
        isDestructive={move.target === OrderStatus.Cancelled}
        isRequired={move.target === OrderStatus.Cancelled}
        isBusy={move.isPending}
        onValueChange={move.setReason}
        onConfirm={move.confirm}
        onOpenChange={(isOpen) => {
          if (!isOpen) move.close();
        }}
      />
    </div>
  );
}
