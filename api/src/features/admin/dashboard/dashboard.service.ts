import { Injectable } from "@nestjs/common";
import {
  CommissionStatus,
  OrderStatus,
  RegistrationStatus,
} from "@prisma/client";

import { PrismaService } from "@/prisma/prisma.service";
import { toUserRef } from "../admin.type";
import {
  type AdminDashboard,
  type AdminOrderStatusCount,
} from "./dashboard.type";

export const LOW_STOCK_THRESHOLD = 2;
export const RECENT_LIMIT = 5;
const REVENUE_WINDOW_DAYS = 30;

// Money is only counted once the studio has recorded payment.
export const PAID_STATUSES: readonly OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

export function windowStart(now: Date, days = REVENUE_WINDOW_DAYS): Date {
  return new Date(now.getTime() - days * 86_400_000);
}

// Every status shows, zero included, so the tiles never reflow as the shop fills up.
export function fillStatusCounts(
  counts: { status: OrderStatus; count: number }[],
): AdminOrderStatusCount[] {
  const seen = new Map(counts.map((row) => [row.status, row.count]));
  return Object.values(OrderStatus).map((status) => ({
    status,
    count: seen.get(status) ?? 0,
  }));
}

const customerSelect = {
  select: { id: true, name: true, email: true, image: true },
} as const;

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(now = new Date()): Promise<AdminDashboard> {
    const since = windowStart(now);
    const [
      statusGroups,
      window,
      pendingBookings,
      pendingRegistrations,
      unreadMessages,
      newCommissions,
      upcomingVisits,
      lowStock,
      recentOrders,
      recentBookings,
    ] = await Promise.all([
      this.prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
      this.prisma.order.aggregate({
        where: {
          created_at: { gte: since },
          status: { in: [...PAID_STATUSES] },
        },
        _sum: { total: true },
        _count: { _all: true },
      }),
      this.prisma.workshopBooking.count({
        where: { status: RegistrationStatus.PENDING },
      }),
      this.prisma.eventRegistration.count({
        where: { status: RegistrationStatus.PENDING },
      }),
      this.prisma.contactMessage.count({ where: { is_read: false } }),
      this.prisma.commissionRequest.count({
        where: { status: CommissionStatus.NEW },
      }),
      this.prisma.studioVisit.count({
        where: { starts_at: { gte: now }, cancelled_at: null },
      }),
      this.prisma.product.findMany({
        where: {
          is_active: true,
          is_customizable: false,
          stock: { lte: LOW_STOCK_THRESHOLD },
        },
        select: { id: true, slug: true, name: true, stock: true },
        orderBy: [{ stock: "asc" }, { name: "asc" }],
        take: 12,
      }),
      this.prisma.order.findMany({
        orderBy: { created_at: "desc" },
        take: RECENT_LIMIT,
        select: {
          id: true,
          status: true,
          total: true,
          created_at: true,
          user: customerSelect,
          items: { select: { quantity: true } },
        },
      }),
      this.prisma.workshopBooking.findMany({
        orderBy: { created_at: "desc" },
        take: RECENT_LIMIT,
        select: {
          id: true,
          status: true,
          starts_at: true,
          hours: true,
          participants: true,
          total: true,
          created_at: true,
          user: customerSelect,
        },
      }),
    ]);

    return {
      orders_by_status: fillStatusCounts(
        statusGroups.map((row) => ({
          status: row.status,
          count: row._count._all,
        })),
      ),
      orders_last_30_days: window._count._all,
      revenue_last_30_days: window._sum.total ?? 0,
      pending_bookings: pendingBookings,
      pending_registrations: pendingRegistrations,
      unread_messages: unreadMessages,
      new_commission_requests: newCommissions,
      upcoming_visits: upcomingVisits,
      low_stock: lowStock,
      recent_orders: recentOrders.map((order) => ({
        id: order.id,
        status: order.status,
        total: order.total,
        item_count: order.items.reduce((sum, item) => sum + item.quantity, 0),
        created_at: order.created_at,
        customer: toUserRef(order.user),
      })),
      recent_bookings: recentBookings.map((booking) => ({
        id: booking.id,
        status: booking.status,
        starts_at: booking.starts_at,
        hours: booking.hours,
        participants: booking.participants,
        total: booking.total,
        created_at: booking.created_at,
        customer: toUserRef(booking.user),
      })),
    };
  }
}
