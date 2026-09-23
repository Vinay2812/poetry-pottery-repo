"use client";

import Link from "next/link";
import { useCallback, useMemo } from "react";

import { useQuery } from "@apollo/client/react";
import { AdminOrderDocument } from "@/graphql/generated/graphql";

import { formatDate, formatInr } from "@/lib/format";

import { Button } from "@/components/ui/button";

import { toErrorMessage } from "@/features/admin/shell";

import type { PackingSlipLine } from "@/features/admin/orders/components/PackingSlip";
import { PackingSlip } from "@/features/admin/orders/components/PackingSlip";
import { toSelectionLabel } from "@/features/admin/orders/types";

const STUDIO_NAME = "Poetry & Pottery";

export interface PackingSlipContainerProps {
  orderId: string;
}

export function PackingSlipContainer({ orderId }: PackingSlipContainerProps) {
  const { data, loading, error } = useQuery(AdminOrderDocument, {
    variables: { id: orderId },
    fetchPolicy: "cache-and-network",
  });

  const order = data?.adminOrder.order ?? null;

  const lines = useMemo<PackingSlipLine[]>(
    () =>
      (order?.items ?? []).map((item) => ({
        id: item.id,
        name: item.product_name,
        selectionLabels: item.selections.map(toSelectionLabel),
        quantity: item.quantity,
        unitPriceLabel: formatInr(item.unit_price),
        lineTotalLabel: formatInr(item.line_total),
      })),
    [order],
  );

  const handlePrint = useCallback(() => window.print(), []);

  if (!order) {
    return (
      <div className="flex flex-col gap-4 p-8">
        {loading ? (
          <div aria-busy="true" className="h-64 animate-pulse bg-ash" />
        ) : (
          <p className="text-[13px]">
            {error ? toErrorMessage(error) : "No order with that id."}
          </p>
        )}
      </div>
    );
  }

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
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <Button type="button" size="sm" onClick={handlePrint}>
          Print
        </Button>
        <Button asChild type="button" variant="secondary" size="sm">
          <Link href={`/dashboard/orders/${order.id}`}>Back to the order</Link>
        </Button>
      </div>

      <PackingSlip
        orderId={order.id}
        placedLabel={formatDate(order.created_at)}
        studioName={STUDIO_NAME}
        addressLines={addressLines}
        lines={lines}
        isPricesHidden={order.hide_prices}
        subtotalLabel={formatInr(order.subtotal)}
        discountLabel={order.discount > 0 ? formatInr(order.discount) : null}
        shippingLabel={
          order.shipping_fee === 0 ? "Free" : formatInr(order.shipping_fee)
        }
        totalLabel={formatInr(order.total)}
        giftNote={order.gift_note}
        customerNote={order.customer_note}
        careNotes={order.care_notes}
      />
    </div>
  );
}
