import { Injectable } from "@nestjs/common";
import {
  CommissionStatus,
  EventStatus,
  OrderStatus,
  RegistrationStatus,
} from "@prisma/client";

import { fromWallClock, toWallClock } from "@/features/workshops/schedule";
import { PrismaService } from "@/prisma/prisma.service";
import { toUserRef } from "../admin.type";
import {
  type AdminAgendaItem,
  AdminAgendaKind,
  type AdminDashboard,
  type AdminOrderStatusCount,
} from "./dashboard.type";

export const LOW_STOCK_THRESHOLD = 2;
const STUDIO_TIMEZONE = "Asia/Kolkata";
const AGENDA_STATUSES: readonly RegistrationStatus[] = [
  RegistrationStatus.PENDING,
  RegistrationStatus.APPROVED,
  RegistrationStatus.CONFIRMED,
];
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

  // Everything with a start time inside today's studio day, soonest first.
  async today(now = new Date()): Promise<AdminAgendaItem[]> {
    const config = await this.prisma.workshopConfig.findFirst({
      where: { is_active: true },
      select: { timezone: true },
    });
    const timezone = config?.timezone ?? STUDIO_TIMEZONE;
    const dayKey = toWallClock(now, timezone).date;
    const dayStart = fromWallClock(dayKey, 0, timezone);
    const dayEnd = fromWallClock(dayKey, 24 * 60, timezone);
    const inDay = { gte: dayStart, lt: dayEnd };
    const [slots, visits, events] = await Promise.all([
      this.prisma.workshopBookingSlot.findMany({
        where: {
          starts_at: inDay,
          booking: { status: { in: [...AGENDA_STATUSES] } },
        },
        select: {
          starts_at: true,
          ends_at: true,
          booking: {
            select: {
              id: true,
              participants: true,
              status: true,
              user: customerSelect,
              config: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.studioVisit.findMany({
        where: { starts_at: inDay, cancelled_at: null },
        select: { id: true, name: true, starts_at: true, ends_at: true },
      }),
      this.prisma.event.findMany({
        where: { starts_at: inDay, status: EventStatus.PUBLISHED },
        select: {
          id: true,
          title: true,
          starts_at: true,
          ends_at: true,
          total_seats: true,
          available_seats: true,
        },
      }),
    ]);
    const items: AdminAgendaItem[] = [
      ...slots.map((slot) => ({
        kind: AdminAgendaKind.BOOKING,
        id: slot.booking.id,
        starts_at: slot.starts_at,
        ends_at: slot.ends_at,
        title: slot.booking.user.name ?? slot.booking.user.email,
        detail: `${slot.booking.config.name} · ${slot.booking.participants} at the wheel · ${slot.booking.status.toLowerCase()}`,
      })),
      ...visits.map((visit) => ({
        kind: AdminAgendaKind.VISIT,
        id: visit.id,
        starts_at: visit.starts_at,
        ends_at: visit.ends_at,
        title: visit.name,
        detail: "Studio visit",
      })),
      ...events.map((event) => ({
        kind: AdminAgendaKind.EVENT,
        id: String(event.id),
        starts_at: event.starts_at,
        ends_at: event.ends_at,
        title: event.title,
        detail: `${event.total_seats - event.available_seats} of ${event.total_seats} seats taken`,
      })),
    ];
    return items.sort((a, b) => a.starts_at.getTime() - b.starts_at.getTime());
  }

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
      today,
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
      this.today(now),
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
      today,
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
