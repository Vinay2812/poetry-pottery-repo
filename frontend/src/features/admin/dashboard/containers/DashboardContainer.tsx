"use client";

import {
  useCallback,
  useMemo,
  useOptimistic,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  AdjustProductStockDocument,
  AdminDashboardDocument,
} from "@/graphql/generated/graphql";

import {
  formatDate,
  formatDateTime,
  formatInr,
  formatTime,
} from "@/lib/format";

import { formatEnumLabel, toErrorMessage } from "@/features/admin/shell";
import { AdminPageHeader } from "@/features/admin/ui";
import { orderStatusTone, registrationStatusTone } from "@/features/admin/ui";

import { DashboardSection } from "@/features/admin/dashboard/components/DashboardSection";
import { DashboardStats } from "@/features/admin/dashboard/components/DashboardStats";
import {
  LowStockList,
  type LowStockRow,
} from "@/features/admin/dashboard/components/LowStockList";
import { RecentBookingsTable } from "@/features/admin/dashboard/components/RecentBookingsTable";
import { TodayAgendaList } from "@/features/admin/dashboard/components/TodayAgendaList";
import { RecentOrdersTable } from "@/features/admin/dashboard/components/RecentOrdersTable";
import {
  clampDelta,
  describeBooking,
  describeItems,
  describeStock,
  formatCount,
  stockTone,
  toAgendaHref,
  toAgendaKindLabel,
} from "@/features/admin/dashboard/types";

interface StockPatch {
  id: number;
  delta: number;
}

function applyStockPatch(
  rows: LowStockRow[],
  patch: StockPatch,
): LowStockRow[] {
  return rows.map((row) => {
    if (row.id !== patch.id) return row;
    const stock = Math.max(0, row.stock + patch.delta);
    return {
      ...row,
      stock,
      stockLabel: describeStock(stock),
      stockTone: stockTone(stock),
    };
  });
}

export function DashboardContainer() {
  const { data, previousData, loading, refetch } = useQuery(
    AdminDashboardDocument,
    {
      fetchPolicy: "cache-and-network",
    },
  );
  const [adjustStock] = useMutation(AdjustProductStockDocument);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const dashboard = data?.adminDashboard ?? previousData?.adminDashboard;

  const lowStockRows = useMemo<LowStockRow[]>(
    () =>
      (dashboard?.low_stock ?? []).map((piece) => ({
        id: piece.id,
        name: piece.name,
        slug: piece.slug,
        stock: piece.stock,
        stockLabel: describeStock(piece.stock),
        stockTone: stockTone(piece.stock),
      })),
    [dashboard],
  );

  const [optimisticRows, patchStock] = useOptimistic(
    lowStockRows,
    applyStockPatch,
  );

  const orderRows = useMemo(
    () =>
      (dashboard?.recent_orders ?? []).map((order) => ({
        id: order.id,
        customerName: order.customer.name ?? order.customer.email,
        statusLabel: formatEnumLabel(order.status),
        statusTone: orderStatusTone(order.status),
        itemsLabel: describeItems(order.item_count),
        totalLabel: formatInr(order.total),
        placedLabel: formatDate(order.created_at),
      })),
    [dashboard],
  );

  const agendaRows = useMemo(
    () =>
      (dashboard?.today ?? []).map((item) => ({
        id: item.id,
        href: toAgendaHref(item.kind, item.id),
        kindLabel: toAgendaKindLabel(item.kind),
        timeLabel: formatTime(item.starts_at),
        title: item.title,
        detail: item.detail,
      })),
    [dashboard],
  );

  const bookingRows = useMemo(
    () =>
      (dashboard?.recent_bookings ?? []).map((booking) => ({
        id: booking.id,
        customerName: booking.customer.name ?? booking.customer.email,
        statusLabel: formatEnumLabel(booking.status),
        statusTone: registrationStatusTone(booking.status),
        shapeLabel: describeBooking(booking.hours, booking.participants),
        totalLabel: formatInr(booking.total),
        startsLabel: formatDateTime(booking.starts_at),
      })),
    [dashboard],
  );

  const handleAdjust = useCallback(
    (id: number, delta: number) => {
      const row = optimisticRows.find((item) => item.id === id);
      if (!row) return;
      const applied = clampDelta(delta, row.stock);
      if (applied === 0) return;
      setBusyId(id);
      startTransition(async () => {
        patchStock({ id, delta: applied });
        try {
          await adjustStock({
            variables: { id, delta: applied, reason: "Quick adjust" },
          });
          await refetch();
          toast.success(`${row.name} stock updated`);
        } catch (error) {
          toast.error(toErrorMessage(error));
        } finally {
          setBusyId(null);
        }
      });
    },
    [adjustStock, optimisticRows, patchStock, refetch],
  );

  if (!dashboard && loading) {
    return (
      <div aria-busy="true" className="flex flex-col gap-3">
        <div className="h-20 animate-pulse bg-ash" />
        <div className="h-64 animate-pulse bg-ash" />
      </div>
    );
  }

  if (!dashboard) {
    return <p className="text-[13px]">The dashboard could not be loaded.</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Studio"
        title="Dashboard"
        description="What the shelf and the wheel have been doing."
      />
      <DashboardStats
        orders={formatCount(dashboard.orders_last_30_days)}
        revenue={formatInr(dashboard.revenue_last_30_days)}
        pendingRegistrations={formatCount(dashboard.pending_registrations)}
        pendingBookings={formatCount(dashboard.pending_bookings)}
        unreadMessages={formatCount(dashboard.unread_messages)}
        newCommissions={formatCount(dashboard.new_commission_requests)}
        upcomingVisits={formatCount(dashboard.upcoming_visits)}
      />
      <DashboardSection
        title="Today at the studio"
        moreHref={null}
        moreLabel=""
      >
        <TodayAgendaList rows={agendaRows} />
      </DashboardSection>
      <DashboardSection
        title="Recent orders"
        moreHref="/dashboard/orders"
        moreLabel="All orders"
      >
        <RecentOrdersTable rows={orderRows} />
      </DashboardSection>
      <DashboardSection
        title="Recent bookings"
        moreHref="/dashboard/workshops"
        moreLabel="All bookings"
      >
        <RecentBookingsTable rows={bookingRows} />
      </DashboardSection>
      <DashboardSection
        title="Running low"
        moreHref="/dashboard/pieces?low_stock=1"
        moreLabel="All pieces"
      >
        <LowStockList
          rows={optimisticRows}
          busyId={busyId}
          onAdjust={handleAdjust}
        />
      </DashboardSection>
    </div>
  );
}
