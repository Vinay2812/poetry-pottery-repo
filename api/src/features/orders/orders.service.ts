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
  orderStudioNoteMail,
} from "@/mail/templates/orders";
import { PrismaService } from "@/prisma/prisma.service";
import { StorageService } from "@/storage/storage.service";
import { CartService, shippingFor } from "@/features/cart/cart.service";
import {
  productListInclude,
  toProduct,
} from "@/features/products/products.service";
import { ShelfService } from "@/features/products/shelf.service";
import { SettingsService } from "@/features/settings/settings.service";
import { UploadsService } from "@/uploads/uploads.service";
import { UploadPurpose } from "@/uploads/uploads.type";
import { toCareLines } from "./care";
import { checkCoupon, normaliseCouponCode } from "./coupons";
import { readGift } from "./gift";
import {
  canTransition,
  CUSTOMER_CANCELLABLE,
  STATUS_TIMESTAMP,
  STOCK_HOLDING,
} from "./order-status";
import type { Cart } from "@/features/cart/cart.type";
import { readCustomisation } from "@/features/cart/selections";
import type {
  AddOrderNoteInput,
  CheckoutQuote,
  Order,
  OrdersResult,
  PlaceOrderInput,
  ReorderResult,
} from "./orders.type";

export const STUDIO_NOTE_MAX_LENGTH = 1000;

export const orderInclude = {
  items: {
    include: { product: { include: productListInclude } },
    orderBy: { id: "asc" },
  },
  coupon: { select: { code: true } },
  notes: { orderBy: { created_at: "asc" } },
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
    gift_note: row.gift_note,
    hide_prices: row.hide_prices,
    tracking_note: row.tracking_note,
    cancel_reason: row.cancel_reason,
    can_cancel: CUSTOMER_CANCELLABLE.includes(row.status),
    care_notes: toCareLines(row.items.map((item) => item.product)),
    item_count: row.items.reduce((sum, item) => sum + item.quantity, 0),
    items: row.items.map((item) => {
      const customisation = readCustomisation(item.selections);
      return {
        id: item.id,
        product: isLinkable(item.product, now) ? toProduct(item.product) : null,
        product_name: item.product_name,
        product_image: item.product_image,
        unit_price: item.unit_price,
        quantity: item.quantity,
        line_total: item.line_total,
        selections: customisation.options,
        reference_image_urls: customisation.reference_image_urls,
      };
    }),
    studio_notes: row.notes.map((note) => ({
      id: note.id,
      body: note.body,
      image_url: note.image_url,
      created_at: note.created_at,
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

export const CART_CHANGED =
  "Your cart changed since you opened checkout. Check the new total and place the order again.";

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cart: CartService,
    private readonly settings: SettingsService,
    private readonly mail: MailService,
    private readonly storage: StorageService,
    private readonly shelf: ShelfService,
    private readonly uploads: UploadsService,
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

  // Pins every piece in the cart for the rest of the transaction, so a price, an option or the
  // active flag cannot move between the quote and the decrement. Ordered by id so two carts
  // holding the same pieces can never deadlock against each other.
  private async lockCartProducts(userId: number): Promise<void> {
    await this.prisma.$executeRaw`
      SELECT id FROM products
      WHERE id IN (SELECT product_id FROM cart_items WHERE user_id = ${userId})
      ORDER BY id
      FOR UPDATE`;
  }

  async place(userId: number, input: PlaceOrderInput): Promise<Order> {
    const note = input.customer_note?.trim().slice(0, 500) || null;
    const gift = readGift(input.gift_note, input.hide_prices);

    const order = await this.prisma.withTransaction(async () => {
      await this.lockCartProducts(userId);
      const address = await this.prisma.address.findFirst({
        where: { id: input.address_id, user_id: userId },
      });
      const cart = await this.cart.get(userId);
      // One cart snapshot feeds both the totals and the order lines.
      const quote = await this.quote(userId, input.coupon_code, cart);
      if (!address) {
        throw new NotFoundException("Choose a delivery address");
      }
      const available = cart.items.filter((item) => item.is_available);
      // Named pieces first: a cart whose only line just sold out is not an empty cart.
      if (quote.problems.length > 0) {
        throw new BadRequestException(
          `Some pieces are no longer available: ${quote.problems.join(", ")}`,
        );
      }
      if (available.length === 0) {
        throw new BadRequestException("Your cart is empty");
      }
      if (
        input.expected_total != null &&
        input.expected_total !== quote.total
      ) {
        throw new ConflictException(CART_CHANGED);
      }
      const code = normaliseCouponCode(input.coupon_code);
      if (code && quote.coupon_code === null) {
        throw new BadRequestException(
          quote.coupon_message ?? "That code is not valid",
        );
      }

      for (const item of available) {
        const taken = await this.shelf.take(item.product, item.quantity);
        if (!taken) {
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
          gift_note: gift.gift_note,
          hide_prices: gift.hide_prices,
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
              selections: {
                options: item.selections,
                reference_image_urls: item.reference_image_urls,
              },
            })),
          },
        },
        include: orderInclude,
      });
      // The order items now hold the reference photos, so releasing the lines keeps them.
      await this.cart.removeLines(
        userId,
        available.map((item) => item.id),
      );
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
      if (current.status === OrderStatus.CANCELLED) {
        throw new ConflictException("This order is already cancelled.");
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
    return toOrder(row);
  }

  // Puts a past order's pieces back in the cart, one line at a time, so a piece that has since
  // sold out or lost an option is named rather than sinking the whole request.
  async reorder(userId: number, orderId: string): Promise<ReorderResult> {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, user_id: userId },
      include: {
        items: { include: { product: true }, orderBy: { id: "asc" } },
      },
    });
    if (!order) {
      throw new NotFoundException("Order not found");
    }
    const skipped: string[] = [];
    for (const item of order.items) {
      const product = item.product;
      const quantity = product.is_customizable
        ? item.quantity
        : Math.min(item.quantity, product.stock);
      if (!product.is_active || quantity < 1) {
        skipped.push(item.product_name);
        continue;
      }
      const { options } = readCustomisation(item.selections);
      try {
        await this.cart.add(userId, {
          product_id: product.id,
          quantity,
          selections: options.map((option) => ({
            group_id: option.group_id,
            option_id: option.option_id,
            text: option.text,
          })),
        });
      } catch (error) {
        if (
          error instanceof BadRequestException ||
          error instanceof NotFoundException
        ) {
          skipped.push(item.product_name);
          continue;
        }
        throw error;
      }
    }
    return { cart: await this.cart.get(userId), skipped };
  }

  // Shared by customer cancellation and the admin console; releases stock when an order leaves
  // the holding states and mails the customer, both settling only once the transaction commits.
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
          await this.shelf.release(item.product, item.quantity);
        }
        if (current.coupon_id !== null) {
          await this.prisma.coupon.updateMany({
            where: { id: current.coupon_id, uses_count: { gt: 0 } },
            data: { uses_count: { decrement: 1 } },
          });
        }
      }
      const row = await this.prisma.order.findUniqueOrThrow({
        where: { id: current.id },
        include: orderInclude,
      });
      await this.notifyStatus(current.user_id, toOrder(row));
      return row;
    });
  }

  // Admin only: the note is written for the customer, so it goes out as one mail straight away.
  async addNote(input: AddOrderNoteInput): Promise<Order> {
    const body = input.body.trim().slice(0, STUDIO_NOTE_MAX_LENGTH);
    if (body.length === 0) {
      throw new BadRequestException("Write something for the customer");
    }
    const imageUrl = input.image_url?.trim() || null;
    if (imageUrl !== null && !this.storage.isOwnUrl(imageUrl)) {
      throw new BadRequestException("Attach a photo uploaded to the studio");
    }
    // The same spec check every other console image goes through.
    await this.uploads.claimConfirmed(
      imageUrl ? [imageUrl] : [],
      [],
      UploadPurpose.ORDER_NOTE,
    );
    const order = await this.prisma.order.findUnique({
      where: { id: input.order_id },
      select: { id: true, user: { select: { email: true } } },
    });
    if (!order) {
      throw new NotFoundException("Order not found");
    }
    const note = await this.prisma.orderNote.create({
      data: { order_id: order.id, body, image_url: imageUrl },
    });
    const row = await this.prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: orderInclude,
    });
    const result = toOrder(row);
    await this.mail.enqueue({
      to: order.user.email,
      ...orderStudioNoteMail(result, note.body, note.image_url),
    });
    return result;
  }

  private async notifyStatus(userId: number, order: Order): Promise<void> {
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
