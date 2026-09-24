import { Injectable, NotFoundException } from "@nestjs/common";
import { OrderStatus, Prisma } from "@prisma/client";

import { csvCell } from "@/common/csv";
import { clampPage, toPageInfo } from "@/common/pagination/pagination";
import { PrismaService } from "@/prisma/prisma.service";
import { canTransition } from "@/features/orders/order-status";
import {
  orderInclude,
  OrdersService,
  toOrder,
} from "@/features/orders/orders.service";
import { searchTerm, toUserRef, trimmed } from "../admin.type";
import type {
  AdminOrder,
  AdminOrdersFilterInput,
  AdminOrdersResult,
} from "./orders.type";

const MAX_LIMIT = 60;
// Enough for years of a studio's orders in one sheet without a runaway query.
const EXPORT_LIMIT = 20_000;

export const adminOrderInclude = {
  ...orderInclude,
  user: { select: { id: true, name: true, email: true, image: true } },
} satisfies Prisma.OrderInclude;

type AdminOrderRow = Prisma.OrderGetPayload<{
  include: typeof adminOrderInclude;
}>;

export function nextStatuses(from: OrderStatus): OrderStatus[] {
  return Object.values(OrderStatus).filter((to) => canTransition(from, to));
}

export function toAdminOrder(row: AdminOrderRow, now = new Date()): AdminOrder {
  return {
    order: toOrder(row, now),
    customer: toUserRef(row.user),
    admin_note: row.admin_note,
    next_statuses: nextStatuses(row.status),
  };
}

@Injectable()
export class AdminOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orders: OrdersService,
  ) {}

  // The same filters the orders table uses, so an export holds exactly what is on screen.
  private whereFor(filter: AdminOrdersFilterInput): Prisma.OrderWhereInput {
    const term = searchTerm(filter.search);
    return {
      ...(filter.user_id ? { user_id: filter.user_id } : {}),
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.from || filter.to
        ? {
            created_at: {
              ...(filter.from ? { gte: filter.from } : {}),
              ...(filter.to ? { lte: filter.to } : {}),
            },
          }
        : {}),
      ...(term
        ? {
            OR: [
              { id: { contains: term, mode: "insensitive" } },
              { user: { email: { contains: term, mode: "insensitive" } } },
            ],
          }
        : {}),
    };
  }

  // One row per order line, in a sheet the studio's accountant can open anywhere.
  async exportCsv(filter: AdminOrdersFilterInput): Promise<string> {
    const rows = await this.prisma.order.findMany({
      where: this.whereFor(filter),
      orderBy: { created_at: "asc" },
      take: EXPORT_LIMIT,
      select: {
        id: true,
        status: true,
        created_at: true,
        subtotal: true,
        discount: true,
        shipping_fee: true,
        total: true,
        coupon: { select: { code: true } },
        user: { select: { name: true, email: true } },
        shipping_address: true,
        items: {
          select: {
            product_name: true,
            quantity: true,
            unit_price: true,
            line_total: true,
          },
          orderBy: { id: "asc" },
        },
      },
    });
    const header =
      "order_id,placed_at,status,customer,email,city,pincode,piece,quantity,unit_price,line_total,order_subtotal,discount,coupon,shipping_fee,order_total";
    const lines = rows.flatMap((order) => {
      const address = order.shipping_address;
      return order.items.map((item) =>
        [
          order.id,
          order.created_at.toISOString(),
          order.status,
          csvCell(order.user.name ?? ""),
          csvCell(order.user.email),
          csvCell(address.city),
          csvCell(address.pincode),
          csvCell(item.product_name),
          String(item.quantity),
          String(item.unit_price),
          String(item.line_total),
          String(order.subtotal),
          String(order.discount),
          csvCell(order.coupon?.code ?? ""),
          String(order.shipping_fee),
          String(order.total),
        ].join(","),
      );
    });
    return [header, ...lines].join("\n");
  }

  async list(filter: AdminOrdersFilterInput): Promise<AdminOrdersResult> {
    const bounds = clampPage(filter.page, filter.limit, MAX_LIMIT);
    const where = this.whereFor(filter);
    const [rows, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: adminOrderInclude,
        orderBy: { created_at: "desc" },
        skip: bounds.skip,
        take: bounds.limit,
      }),
      this.prisma.order.count({ where }),
    ]);
    return {
      items: rows.map((row) => toAdminOrder(row)),
      page_info: toPageInfo(bounds, total),
    };
  }

  async byId(id: string): Promise<AdminOrder> {
    return toAdminOrder(await this.require(id));
  }

  // The state machine, stock release and mail all live in OrdersService; this only picks the target.
  async setStatus(
    id: string,
    next: OrderStatus,
    extra: {
      tracking_note?: string | null;
      cancel_reason?: string | null;
      admin_note?: string | null;
    } = {},
  ): Promise<AdminOrder> {
    const current = await this.require(id);
    await this.orders.applyStatus(current, next, {
      ...(extra.tracking_note === undefined
        ? {}
        : { tracking_note: trimmed(extra.tracking_note, 300) }),
      ...(extra.cancel_reason === undefined
        ? {}
        : { cancel_reason: trimmed(extra.cancel_reason, 300) }),
      ...(extra.admin_note === undefined
        ? {}
        : { admin_note: trimmed(extra.admin_note, 1000) }),
    });
    return this.byId(id);
  }

  markPaid(id: string): Promise<AdminOrder> {
    return this.setStatus(id, OrderStatus.PAID);
  }

  // Cancelling walks the same path as a customer cancellation, so stock and coupon uses come back.
  cancel(id: string, reason: string | null): Promise<AdminOrder> {
    return this.setStatus(id, OrderStatus.CANCELLED, {
      cancel_reason: reason ?? "Cancelled by the studio",
    });
  }

  async setAdminNote(id: string, note: string | null): Promise<AdminOrder> {
    await this.require(id);
    await this.prisma.order.update({
      where: { id },
      data: { admin_note: trimmed(note, 1000) },
    });
    return this.byId(id);
  }

  private async require(id: string): Promise<AdminOrderRow> {
    const row = await this.prisma.order.findUnique({
      where: { id },
      include: adminOrderInclude,
    });
    if (!row) {
      throw new NotFoundException("Order not found");
    }
    return row;
  }
}
