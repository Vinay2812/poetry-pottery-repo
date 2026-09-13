"use client";

import { useCallback, useMemo } from "react";

import { OrderStatus, useAdminOrdersQuery } from "@/graphql/generated/graphql";

import { formatDate, formatInr } from "@/lib/format";

import { formatEnumLabel, useAdminQueryState } from "@/features/admin/shell";
// useSearchDraft is not re-exported by the shell barrel yet.
import { useSearchDraft } from "@/features/admin/shell/hooks";
import {
  AdminPageHeader,
  AdminPagination,
  enumOptions,
  orderStatusTone,
} from "@/features/admin/ui";

import {
  AdminOrdersTable,
  type AdminOrdersTableRow,
} from "@/features/admin/orders/components/AdminOrdersTable";
import { AdminOrdersToolbar } from "@/features/admin/orders/components/AdminOrdersToolbar";
import {
  describeItems,
  ORDERS_PAGE_SIZE,
  toCustomerLabel,
  toDayEndIso,
  toDayStartIso,
  toOrderStatus,
} from "@/features/admin/orders/types";

const STATUS_OPTIONS = enumOptions(OrderStatus);

export function AdminOrdersContainer() {
  const { values, page, isPending, patch } = useAdminQueryState();
  const search = values.q ?? "";
  const status = toOrderStatus(values.status);
  const from = values.from ?? "";
  const to = values.to ?? "";

  const handleSearchCommit = useCallback(
    (value: string) => patch({ q: value.trim() || null }),
    [patch],
  );
  const [searchDraft, handleSearchChange] = useSearchDraft(
    search,
    handleSearchCommit,
  );

  const { data, previousData, loading, error } = useAdminOrdersQuery({
    variables: {
      filter: {
        page,
        limit: ORDERS_PAGE_SIZE,
        search: search || null,
        status,
        from: toDayStartIso(from),
        to: toDayEndIso(to),
      },
    },
    fetchPolicy: "cache-and-network",
  });

  const result = data?.adminOrders ?? previousData?.adminOrders;

  const rows = useMemo<AdminOrdersTableRow[]>(
    () =>
      (result?.items ?? []).map((item) => ({
        id: item.order.id,
        customerLabel: toCustomerLabel(item.customer.name, item.customer.email),
        customerEmail: item.customer.email,
        statusLabel: formatEnumLabel(item.order.status),
        statusTone: orderStatusTone(item.order.status),
        itemsLabel: describeItems(item.order.item_count),
        totalLabel: formatInr(item.order.total),
        placedLabel: formatDate(item.order.created_at),
      })),
    [result],
  );

  const handlePageChange = useCallback(
    (next: number) => patch({ page: next > 1 ? String(next) : null }),
    [patch],
  );

  if (!result && error) {
    return (
      <div className="flex flex-col gap-8">
        <AdminPageHeader eyebrow="Studio" title="Orders" description={null} />
        <p className="text-[13px]">The orders could not be loaded.</p>
      </div>
    );
  }

  const pageInfo = result?.page_info;

  return (
    <div className="flex flex-col gap-2">
      <AdminPageHeader
        eyebrow="Studio"
        title="Orders"
        description="Everything the shelf has sent out."
      />
      <AdminOrdersToolbar
        search={searchDraft}
        status={status ?? ""}
        from={from}
        to={to}
        statusOptions={STATUS_OPTIONS}
        onSearchChange={handleSearchChange}
        onStatusChange={(value) => patch({ status: value || null })}
        onFromChange={(value) => patch({ from: value || null })}
        onToChange={(value) => patch({ to: value || null })}
      />
      <AdminOrdersTable
        rows={rows}
        isBusy={isPending || (loading && rows.length > 0)}
        emptyMessage={
          loading ? "Looking for orders" : "No orders match those filters"
        }
      />
      <AdminPagination
        page={pageInfo?.page ?? page}
        limit={pageInfo?.limit ?? ORDERS_PAGE_SIZE}
        total={pageInfo?.total ?? 0}
        hasMore={pageInfo?.has_more ?? false}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
