"use client";

import { useCallback, useMemo } from "react";

import { toast } from "sonner";

import { useLazyQuery, useQuery } from "@apollo/client/react";
import {
  AdminOrdersDocument,
  ExportOrdersDocument,
  OrderStatus,
} from "@/graphql/generated/graphql";
import { describeError } from "@/lib/apollo/errors";
import { downloadCsv } from "@/lib/download";

import { formatDate, formatInr } from "@/lib/format";

import {
  formatEnumLabel,
  useAdminQueryState,
  useSearchDraft,
} from "@/features/admin/shell";
import {
  AdminPageHeader,
  AdminPagination,
  enumOptions,
  orderStatusTone,
  toPersonName,
} from "@/features/admin/ui";
import {
  AdminPersonFilterNotice,
  usePersonFilter,
} from "@/features/admin/people";

import {
  AdminOrdersTable,
  type AdminOrdersTableRow,
} from "@/features/admin/orders/components/AdminOrdersTable";
import { AdminOrdersToolbar } from "@/features/admin/orders/components/AdminOrdersToolbar";
import {
  describeItems,
  ORDERS_PAGE_SIZE,
  toDayEndIso,
  toDayStartIso,
  toOrderStatus,
} from "@/features/admin/orders/types";

const STATUS_OPTIONS = enumOptions(OrderStatus);

export function AdminOrdersContainer() {
  const { values, page, isPending, patch } = useAdminQueryState();
  const search = values.q ?? "";
  const status = toOrderStatus(values.status);
  const { personId, personName } = usePersonFilter(values.user);
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

  const { data, previousData, loading, error } = useQuery(AdminOrdersDocument, {
    variables: {
      filter: {
        page,
        limit: ORDERS_PAGE_SIZE,
        search: search || null,
        status,
        user_id: personId,
        from: toDayStartIso(from),
        to: toDayEndIso(to),
      },
    },
    fetchPolicy: "cache-and-network",
  });

  const result = data?.adminOrders ?? previousData?.adminOrders;

  // The same filters as the table, minus the page, so the sheet holds every matching order.
  const [exportOrders, { loading: isExporting }] = useLazyQuery(
    ExportOrdersDocument,
    { fetchPolicy: "network-only" },
  );
  const handleExport = useCallback(async () => {
    try {
      const exported = await exportOrders({
        variables: {
          filter: {
            search: search || null,
            status,
            user_id: personId,
            from: toDayStartIso(from),
            to: toDayEndIso(to),
          },
        },
      });
      const csv = exported.data?.exportOrders;
      if (csv === undefined) throw new Error("The export came back empty");
      downloadCsv(`orders-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    } catch (exportError) {
      toast.error(describeError(exportError, "The export could not be made"));
    }
  }, [exportOrders, from, personId, search, status, to]);

  const rows = useMemo<AdminOrdersTableRow[]>(
    () =>
      (result?.items ?? []).map((item) => ({
        id: item.order.id,
        customerLabel: toPersonName(item.customer.name, item.customer.email),
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
        isExporting={isExporting}
        onExport={() => void handleExport()}
      />
      {personId !== null && (
        <AdminPersonFilterNotice
          line={personName ? `Orders by ${personName}` : "Orders by one person"}
          onClear={() => patch({ user: null })}
        />
      )}
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
