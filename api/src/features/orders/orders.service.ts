import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { OrderStatus, Prisma } from "@prisma/client";

import { newPublicId } from "@/common/ids/public-id";
import { clampPage, toPageInfo } from "@/common/pagination/pagination";
import { env } from "@/config/env";
import { MailService } from "@/mail/mail.service";
import {
  orderPlacedCustomerMail,
  orderPlacedStudioMail,
  orderStatusMail,
} from "@/mail/templates/orders";
import { PrismaService } from "@/prisma/prisma.service";
import { CartService, shippingFor } from "@/features/cart/cart.service";
import {
  productListInclude,
  toProduct,
} from "@/features/products/products.service";
import { SettingsService } from "@/features/settings/settings.service";
import { checkCoupon, normaliseCouponCode } from "./coupons";
import {
  canTransition,
  CUSTOMER_CANCELLABLE,
  STATUS_TIMESTAMP,
  STOCK_HOLDING,
} from "./order-status";
import type { Cart } from "@/features/cart/cart.type";
import type {
  CheckoutQuote,
  Order,
  OrdersResult,
  PlaceOrderInput,
} from "./orders.type";

export const orderInclude = {
  items: {
    include: { product: { include: productListInclude } },
    orderBy: { id: "asc" },
  },
  coupon: { select: { code: true } },
} satisfies Prisma.OrderInclude;

type OrderRow = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

// Lines link to the shop only while the piece can still be bought there.
function isLinkable(
  product: OrderRow["items"][number]["product"],
  now: Date,
): boolean {
  if (!product.is_active) return false;
  return !(product.collection?.ends_at && product.collection.ends_at < now);
}

export function toOrder(row: OrderRow, now = new Date()): Order {
  return {
    id: row.id,
    status: row.status,
    subtotal: row.subtotal,
    discount: row.discount,
    shipping_fee: row.shipping_fee,
    total: row.total,
    coupon_code: row.coupon?.code ?? null,
    shipping_address: row.shipping_address,
    customer_note: row.customer_note,
    tracking_note: row.tracking_note,
    cancel_reason: row.cancel_reason,
    can_cancel: CUSTOMER_CANCELLABLE.includes(row.status),
    item_count: row.items.reduce((sum, item) => sum + item.quantity, 0),
    items: row.items.map((item) => ({
      id: item.id,
      product: isLinkable(item.product, now) ? toProduct(item.product) : null,
      product_name: item.product_name,
      product_image: item.product_image,
      unit_price: item.unit_price,
      quantity: item.quantity,
      line_total: item.line_total,
      selections: item.selections ?? [],
    })),
    created_at: row.created_at,
    confirmed_at: row.confirmed_at,
    paid_at: row.paid_at,
    shipped_at: row.shipped_at,
    delivered_at: row.delivered_at,
    cancelled_at: row.cancelled_at,
    refunded_at: row.refunded_at,
  };
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cart: CartService,
    private readonly settings: SettingsService,
    private readonly mail: MailService,
  ) {}

  // Same maths as placeOrder, so the checkout page never shows a total the order will not match.
  async quote(
    userId: number,
    couponCode: string | null | undefined,
    snapshot?: Cart,
  ): Promise<CheckoutQuote> {
    const [cart, settings] = await Promise.all([
      snapshot ?? this.cart.get(userId),
      this.settings.get(),
    ]);
    const available = cart.items.filter((item) => item.is_available);
    const problems = cart.items
      .filter((item) => !item.is_available)
      .map(
        (item) =>
          `${item.product.name}: ${item.unavailable_reason ?? "unavailable"}`,
      );
    const subtotal = available.reduce((sum, item) => sum + item.line_total, 0);

    const code = normaliseCouponCode(couponCode);
    let discount = 0;
    let applied_code: string | null = null;
    let coupon_message: string | null = null;
    if (code) {
      const coupon = await this.prisma.coupon.findUnique({ where: { code } });
      const check = checkCoupon(coupon, subtotal);
      if (check.ok) {
        discount = check.discount;
        applied_code = code;
        coupon_message = `${code} applied`;
      } else {
        coupon_message = check.message;
      }
    }
    const shipping_fee = shippingFor(
      subtotal - discount,
      settings.shipping_flat_fee,
      settings.free_shipping_above,
    );
    return {
      subtotal,
      discount,
      shipping_fee,
      total: subtotal - discount + shipping_fee,
      item_count: available.reduce((sum, item) => sum + item.quantity, 0),
      // A valid code that happens to be worth nothing is still applied, not rejected.
      coupon_code: applied_code,
      coupon_message,
      problems,
    };
  }

  async place(userId: number, input: PlaceOrderInput): Promise<Order> {
    const [address, cart] = await Promise.all([
      this.prisma.address.findFirst({
        where: { id: input.address_id, user_id: userId },
      }),
      this.cart.get(userId),
    ]);
    // One cart snapshot feeds both the totals and the order lines.
    const quote = await this.quote(userId, input.coupon_code, cart);
    if (!address) {
      throw new NotFoundException("Choose a delivery address");
    }
    const available = cart.items.filter((item) => item.is_available);
    if (available.length === 0) {
      throw new BadRequestException("Your cart is empty");
    }
    if (quote.problems.length > 0) {
      throw new BadRequestException(
        `Some pieces are no longer available: ${quote.problems.join(", ")}`,
      );
    }
    const code = normaliseCouponCode(input.coupon_code);
    if (code && quote.coupon_code === null) {
      throw new BadRequestException(
        quote.coupon_message ?? "That code is not valid",
      );
    }
    const note = input.customer_note?.trim().slice(0, 500) || null;

    const order = await this.prisma.withTransaction(async () => {
      for (const item of available) {
        if (item.product.is_customizable) {
          await this.prisma.product.update({
            where: { id: item.product.id },
            data: { sales_count: { increment: item.quantity } },
          });
          continue;
        }
        // Conditional decrement is the oversell guard: two buyers cannot both take the last piece.
        const taken = await this.prisma.product.updateMany({
          where: { id: item.product.id, stock: { gte: item.quantity } },
          data: {
            stock: { decrement: item.quantity },
            sales_count: { increment: item.quantity },
          },
        });
        if (taken.count === 0) {
          throw new BadRequestException(
            `${item.product.name} sold out while you were checking out`,
          );
        }
      }

      let couponId: number | null = null;
      if (code) {
        const coupon = await this.prisma.coupon.findUnique({ where: { code } });
        const redeemed = coupon
          ? await this.prisma.coupon.updateMany({
              where: {
                id: coupon.id,
                is_active: true,
                OR: [
                  { max_uses: null },
                  { uses_count: { lt: coupon.max_uses ?? 0 } },
                ],
              },
              data: { uses_count: { increment: 1 } },
            })
          : { count: 0 };
        if (!coupon || redeemed.count === 0) {
          throw new BadRequestException("That code has been fully redeemed");
        }
        couponId = coupon.id;
      }

      const created = await this.prisma.order.create({
        data: {
          id: newPublicId("PP"),
          user_id: userId,
          subtotal: quote.subtotal,
          discount: quote.discount,
          shipping_fee: quote.shipping_fee,
          total: quote.total,
          coupon_id: couponId,
          customer_note: note,
          shipping_address: {
            name: address.name,
            phone: address.phone,
            line1: address.line1,
            line2: address.line2,
            landmark: address.landmark,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
          },
          items: {
            create: available.map((item) => ({
              product_id: item.product.id,
              product_name: item.product.name,
              product_image: item.product.image_urls[0] ?? null,
              unit_price: item.unit_price,
              quantity: item.quantity,
              line_total: item.line_total,
              selections: item.selections,
            })),
          },
        },
        include: orderInclude,
      });
      await this.prisma.cartItem.deleteMany({
        where: {
          user_id: userId,
          id: { in: available.map((item) => item.id) },
        },
      });
      return created;
    });

    const result = toOrder(order);
    await this.notifyPlaced(userId, result);
    return result;
  }

  async list(
    userId: number,
    page: number | null,
    limit: number | null,
  ): Promise<OrdersResult> {
    const bounds = clampPage(page, limit, 20);
    const [rows, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { user_id: userId },
        include: orderInclude,
        orderBy: { created_at: "desc" },
        skip: bounds.skip,
        take: bounds.limit,
      }),
      this.prisma.order.count({ where: { user_id: userId } }),
    ]);
    return {
      items: rows.map((row) => toOrder(row)),
      page_info: toPageInfo(bounds, total),
    };
  }

  async byId(userId: number, id: string): Promise<Order> {
    const row = await this.prisma.order.findFirst({
      where: { id, user_id: userId },
      include: orderInclude,
    });
    if (!row) {
      throw new NotFoundException("Order not found");
    }
    return toOrder(row);
  }

  async cancel(
    userId: number,
    id: string,
    reason: string | null | undefined,
  ): Promise<Order> {
    const row = await this.prisma.withTransaction(async () => {
      const current = await this.prisma.order.findFirst({
        where: { id, user_id: userId },
        include: orderInclude,
      });
      if (!current) {
        throw new NotFoundException("Order not found");
      }
      if (!CUSTOMER_CANCELLABLE.includes(current.status)) {
        throw new BadRequestException(
          "This order can no longer be cancelled online. Message us on WhatsApp and we will sort it out.",
        );
      }
      return this.applyStatus(current, OrderStatus.CANCELLED, {
        cancel_reason:
          reason?.trim().slice(0, 300) || "Cancelled by the customer",
      });
    });
    const order = toOrder(row);
    await this.notifyStatus(userId, order);
    return order;
  }

  // Shared by customer cancellation and the admin console; releases stock when an order leaves the holding states.
  async applyStatus(
    current: OrderRow,
    next: OrderStatus,
    extra: {
      cancel_reason?: string | null;
      tracking_note?: string | null;
      admin_note?: string | null;
    } = {},
  ): Promise<OrderRow> {
    if (!canTransition(current.status, next)) {
      throw new BadRequestException(
        `An order cannot move from ${current.status.toLowerCase()} to ${next.toLowerCase()}`,
      );
    }
    return this.prisma.withTransaction(async () => {
      const stamp = STATUS_TIMESTAMP[next];
      // Predicated on the status we read, so two concurrent transitions cannot both release stock.
      const moved = await this.prisma.order.updateMany({
        where: { id: current.id, status: current.status },
        data: {
          status: next,
          ...(stamp ? { [stamp]: new Date() } : {}),
          ...extra,
        },
      });
      if (moved.count === 0) {
        throw new ConflictException(
          "This order was just updated, refresh and try again",
        );
      }
      const releasesStock =
        STOCK_HOLDING.includes(current.status) && !STOCK_HOLDING.includes(next);
      if (releasesStock) {
        for (const item of current.items) {
          await this.prisma.product.update({
            where: { id: item.product_id },
            data: {
              sales_count: { decrement: item.quantity },
              ...(item.product.is_customizable
                ? {}
                : { stock: { increment: item.quantity } }),
            },
          });
        }
        if (current.coupon_id !== null) {
          await this.prisma.coupon.updateMany({
            where: { id: current.coupon_id, uses_count: { gt: 0 } },
            data: { uses_count: { decrement: 1 } },
          });
        }
      }
      return this.prisma.order.findUniqueOrThrow({
        where: { id: current.id },
        include: orderInclude,
      });
    });
  }

  async notifyStatus(userId: number, order: Order): Promise<void> {
    const mail = orderStatusMail(order);
    if (!mail) return;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (user) await this.mail.enqueue({ to: user.email, ...mail });
  }

  private async notifyPlaced(userId: number, order: Order): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!user) return;
    await this.mail.enqueue({
      to: user.email,
      ...orderPlacedCustomerMail(order),
    });
    if (env.BUSINESS_EMAIL) {
      await this.mail.enqueue({
        to: env.BUSINESS_EMAIL,
        ...orderPlacedStudioMail(order, user.email),
      });
    }
  }
}
