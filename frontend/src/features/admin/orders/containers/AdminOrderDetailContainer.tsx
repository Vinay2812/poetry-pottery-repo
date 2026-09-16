"use client";

import {
  useCallback,
  useMemo,
  useOptimistic,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

import {
  OrderStatus,
  useAdminOrderQuery,
  useCancelOrderAsAdminMutation,
  useMarkOrderPaidMutation,
  useSetOrderAdminNoteMutation,
  useSetOrderStatusMutation,
} from "@/graphql/generated/graphql";

import { formatDate, formatDateTime, formatInr } from "@/lib/format";

import { toProductPath } from "@/features/products/types";

import { formatEnumLabel, toErrorMessage } from "@/features/admin/shell";
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
import { AdminOrderNote } from "@/features/admin/orders/components/AdminOrderNote";
import { AdminOrderTimeline } from "@/features/admin/orders/components/AdminOrderTimeline";
import { AdminOrderTotals } from "@/features/admin/orders/components/AdminOrderTotals";
import {
  applyAdminOrderPatch,
  buildOrderTimeline,
  describeItems,
  toAdminNoteValue,
  toSelectionLabel,
  toStatusActions,
} from "@/features/admin/orders/types";

export interface AdminOrderDetailContainerProps {
  orderId: string;
}

const SECTION_TITLE =
  "text-[11px] tracking-[0.14em] text-muted-foreground uppercase";

export function AdminOrderDetailContainer({
  orderId,
}: AdminOrderDetailContainerProps) {
  const { data, previousData, loading, error, refetch } = useAdminOrderQuery({
    variables: { id: orderId },
    fetchPolicy: "cache-and-network",
  });
  const [setOrderStatus] = useSetOrderStatusMutation();
  const [markOrderPaid] = useMarkOrderPaidMutation();
  const [cancelOrderAsAdmin] = useCancelOrderAsAdminMutation();
  const [setOrderAdminNote] = useSetOrderAdminNoteMutation();

  const detail = data?.adminOrder ?? previousData?.adminOrder ?? null;
  const [optimisticDetail, applyPatch] = useOptimistic(
    detail,
    applyAdminOrderPatch,
  );
  const [, startTransition] = useTransition();

  const [busyStatus, setBusyStatus] = useState<OrderStatus | null>(null);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [dialogNote, setDialogNote] = useState("");
  const [dialogError, setDialogError] = useState<string | undefined>(undefined);
  const [noteDraft, setNoteDraft] = useState<string | null>(null);
  const [isNoteSaving, setIsNoteSaving] = useState(false);
  const [isNoteSaved, setIsNoteSaved] = useState(false);

  const order = optimisticDetail?.order ?? null;
  const savedNote = optimisticDetail?.admin_note ?? "";
  const noteValue = noteDraft ?? savedNote;

  const itemRows = useMemo<AdminOrderItemRow[]>(
    () =>
      (order?.items ?? []).map((item) => ({
        id: item.id,
        name: item.product_name,
        href: item.product ? toProductPath(item.product.slug) : null,
        imageUrl: item.product_image,
        selectionLabels: item.selections.map(toSelectionLabel),
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
  const runStatusMove = useCallback(
    (status: OrderStatus, note: string) => {
      setBusyStatus(status);
      startTransition(async () => {
        applyPatch({
          at: new Date().toISOString(),
          status,
          ...(status === OrderStatus.Shipped ? { trackingNote: note } : {}),
          ...(status === OrderStatus.Cancelled ? { cancelReason: note } : {}),
        });
        try {
          if (status === OrderStatus.Paid) {
            await markOrderPaid({ variables: { id: orderId } });
          } else if (status === OrderStatus.Cancelled) {
            await cancelOrderAsAdmin({
              variables: { id: orderId, reason: note.trim() || null },
            });
          } else {
            await setOrderStatus({
              variables: {
                id: orderId,
                status,
                tracking_note:
                  status === OrderStatus.Shipped ? note.trim() || null : null,
                cancel_reason: null,
              },
            });
          }
          await refetch();
          toast.success(
            `Order is now ${formatEnumLabel(status).toLowerCase()}`,
          );
        } catch (moveError) {
          toast.error(toErrorMessage(moveError));
        } finally {
          setBusyStatus(null);
        }
      });
    },
    [
      applyPatch,
      cancelOrderAsAdmin,
      markOrderPaid,
      orderId,
      refetch,
      setOrderStatus,
    ],
  );

  const handleAction = useCallback(
    (status: OrderStatus) => {
      if (status === OrderStatus.Shipped || status === OrderStatus.Cancelled) {
        setDialogNote("");
        setDialogError(undefined);
        setPendingStatus(status);
        return;
      }
      runStatusMove(status, "");
    },
    [runStatusMove],
  );

  const handleDialogConfirm = useCallback(() => {
    if (!pendingStatus) return;
    if (dialogNote.trim().length === 0) {
      setDialogError(
        pendingStatus === OrderStatus.Shipped
          ? "Add the courier and tracking number"
          : "Say why this order is being cancelled",
      );
      return;
    }
    const status = pendingStatus;
    const note = dialogNote;
    setPendingStatus(null);
    runStatusMove(status, note);
  }, [dialogNote, pendingStatus, runStatusMove]);

  const handleNoteSave = useCallback(() => {
    const note = toAdminNoteValue(noteValue);
    setIsNoteSaving(true);
    startTransition(async () => {
      applyPatch({ at: new Date().toISOString(), adminNote: note });
      try {
        await setOrderAdminNote({ variables: { id: orderId, note } });
        await refetch();
        setNoteDraft(null);
        setIsNoteSaved(true);
      } catch (noteError) {
        toast.error(toErrorMessage(noteError));
      } finally {
        setIsNoteSaving(false);
      }
    });
  }, [applyPatch, noteValue, orderId, refetch, setOrderAdminNote]);

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
          <AdminStatusPill
            label={formatEnumLabel(order.status)}
            tone={orderStatusTone(order.status)}
          />
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
              busyStatus={busyStatus}
              isBusy={busyStatus !== null}
              emptyMessage="This order is closed. Nothing left to move."
              onAction={handleAction}
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
            <h2 className={SECTION_TITLE}>Timeline</h2>
            <AdminOrderTimeline steps={timelineSteps} />
          </section>
        </aside>
      </div>

      <AdminReasonDialog
        isOpen={pendingStatus !== null}
        title={
          pendingStatus === OrderStatus.Cancelled
            ? "Cancel this order"
            : "Mark this order shipped"
        }
        description={
          pendingStatus === OrderStatus.Cancelled
            ? "The pieces go back on the shelf straight away."
            : "The customer sees this note on their order page."
        }
        fieldLabel={
          pendingStatus === OrderStatus.Cancelled ? "Reason" : "Tracking note"
        }
        hint={
          pendingStatus === OrderStatus.Cancelled
            ? null
            : "Courier and tracking number"
        }
        placeholder={
          pendingStatus === OrderStatus.Cancelled
            ? "The batch cracked in the kiln"
            : "Delhivery 7712445901"
        }
        value={dialogNote}
        error={dialogError}
        confirmLabel={
          pendingStatus === OrderStatus.Cancelled
            ? "Cancel order"
            : "Mark shipped"
        }
        isDestructive={pendingStatus === OrderStatus.Cancelled}
        isRequired={false}
        isBusy={busyStatus !== null}
        onValueChange={(value) => {
          setDialogNote(value);
          setDialogError(undefined);
        }}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPendingStatus(null);
        }}
        onConfirm={handleDialogConfirm}
      />
    </div>
  );
}
