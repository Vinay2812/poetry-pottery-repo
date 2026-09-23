import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "@/prisma/prisma.service";
import {
  productListInclude,
  sellableProductWhere,
  toProduct,
} from "@/features/products/products.service";
import { SettingsService } from "@/features/settings/settings.service";
import { PendingUploadsService } from "@/storage/pending-uploads.service";
import { customizationPrefix, StorageService } from "@/storage/storage.service";
import type { AddToCartInput, Cart, CartItem } from "./cart.type";
import {
  readCustomisation,
  repriceSelections,
  resolveReferenceImages,
  resolveSelections,
  selectionKey,
  selectionsTotal,
} from "./selections";

export const MAX_LINE_QUANTITY = 10;
export const LINE_FULL = `You already have ${MAX_LINE_QUANTITY} of this piece in your cart, the most one order can hold.`;

const cartItemInclude = {
  product: {
    include: {
      ...productListInclude,
      // Every option, active or not, so a retired choice is caught rather than silently kept.
      option_groups: { include: { options: true } },
    },
  },
} satisfies Prisma.CartItemInclude;

type CartItemRow = Prisma.CartItemGetPayload<{
  include: typeof cartItemInclude;
}>;

export function shippingFor(
  subtotal: number,
  flatFee: number,
  freeAbove: number | null,
): number {
  if (subtotal <= 0) return 0;
  return freeAbove !== null && subtotal >= freeAbove ? 0 : flatFee;
}

function availability(
  row: CartItemRow,
  now: Date,
  hasCurrentOptions: boolean,
): { is_available: boolean; reason: string | null } {
  const { product } = row;
  if (!product.is_active)
    return { is_available: false, reason: "No longer available" };
  if (!hasCurrentOptions) {
    return {
      is_available: false,
      reason: "Its options have changed; remove it and add it again",
    };
  }
  if (product.collection?.starts_at && product.collection.starts_at > now) {
    return {
      is_available: false,
      reason: "This collection has not opened yet",
    };
  }
  if (product.collection?.ends_at && product.collection.ends_at < now) {
    return { is_available: false, reason: "This collection has ended" };
  }
  if (!product.is_customizable && product.stock <= 0)
    return { is_available: false, reason: "Sold out" };
  if (!product.is_customizable && product.stock < row.quantity) {
    return { is_available: false, reason: `Only ${product.stock} left` };
  }
  return { is_available: true, reason: null };
}

export function toCartItem(row: CartItemRow, now = new Date()): CartItem {
  const { options, reference_image_urls } = readCustomisation(row.selections);
  const { option_groups, ...product } = row.product;
  // A plain piece carries no choices, so leftover ones mean the product changed under the line.
  const live = product.is_customizable
    ? repriceSelections(option_groups, options)
    : options.length === 0
      ? options
      : null;
  const selections = live ?? options;
  const unit_price = product.price + selectionsTotal(selections);
  const { is_available, reason } = availability(row, now, live !== null);
  return {
    id: row.id,
    product: toProduct(product),
    quantity: row.quantity,
    unit_price,
    line_total: unit_price * row.quantity,
    selections,
    reference_image_urls,
    is_available,
    unavailable_reason: reason,
  };
}

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
    private readonly storage: StorageService,
    private readonly pendingUploads: PendingUploadsService,
  ) {}

  async get(userId: number): Promise<Cart> {
    const [rows, settings] = await Promise.all([
      this.prisma.cartItem.findMany({
        where: { user_id: userId },
        include: cartItemInclude,
        orderBy: { created_at: "asc" },
      }),
      this.settings.get(),
    ]);
    const items = rows.map((row) => toCartItem(row));
    const available = items.filter((item) => item.is_available);
    const subtotal = available.reduce((sum, item) => sum + item.line_total, 0);
    const shipping_fee = shippingFor(
      subtotal,
      settings.shipping_flat_fee,
      settings.free_shipping_above,
    );
    return {
      items,
      item_count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      shipping_fee,
      free_shipping_above: settings.free_shipping_above,
      total: subtotal + shipping_fee,
    };
  }

  // The header badge only needs the number, so it never builds the cart.
  async count(userId: number): Promise<number> {
    const totals = await this.prisma.cartItem.aggregate({
      where: { user_id: userId },
      _sum: { quantity: true },
    });
    return totals._sum.quantity ?? 0;
  }

  async add(userId: number, input: AddToCartInput): Promise<Cart> {
    const quantity = Math.trunc(input.quantity);
    if (quantity < 1 || quantity > MAX_LINE_QUANTITY) {
      throw new BadRequestException(
        `Quantity must be between 1 and ${MAX_LINE_QUANTITY}`,
      );
    }
    const product = await this.prisma.product.findFirst({
      where: { id: input.product_id, ...sellableProductWhere() },
      include: { option_groups: { include: { options: true } } },
    });
    if (!product) {
      throw new NotFoundException("Product not found");
    }
    const selections = product.is_customizable
      ? resolveSelections(product.option_groups, input.selections ?? [])
      : [];
    const referenceImages = product.is_customizable
      ? resolveReferenceImages(input.reference_image_urls, (url) =>
          this.storage.isUploadedUnder(url, customizationPrefix(userId)),
        )
      : [];
    const key = selectionKey(selections, referenceImages);

    await this.prisma.withTransaction(async () => {
      // The merge reads the line before rewriting it, so two tabs adding at once must queue up.
      await this.prisma
        .$executeRaw`SELECT pg_advisory_xact_lock(${userId}::int, ${product.id}::int)`;
      const existing = await this.prisma.cartItem.findUnique({
        where: {
          user_id_product_id_selection_key: {
            user_id: userId,
            product_id: product.id,
            selection_key: key,
          },
        },
      });
      // A full line is refused out loud; a partial add is topped up to the limit.
      if (existing && existing.quantity >= MAX_LINE_QUANTITY) {
        throw new BadRequestException(LINE_FULL);
      }
      const nextQuantity = Math.min(
        MAX_LINE_QUANTITY,
        (existing?.quantity ?? 0) + quantity,
      );
      this.assertStock(
        product.is_customizable,
        product.stock,
        nextQuantity,
        existing?.quantity ?? 0,
      );
      await this.prisma.cartItem.upsert({
        where: {
          user_id_product_id_selection_key: {
            user_id: userId,
            product_id: product.id,
            selection_key: key,
          },
        },
        create: {
          user_id: userId,
          product_id: product.id,
          quantity: nextQuantity,
          selections: {
            options: selections,
            reference_image_urls: referenceImages,
          },
          selection_key: key,
        },
        update: { quantity: nextQuantity },
      });
    });

    // The photos are on a cart line now, so they are no longer waiting to be swept.
    await this.pendingUploads.keep(userId, referenceImages);
    return this.get(userId);
  }

  async updateQuantity(
    userId: number,
    itemId: number,
    quantity: number,
  ): Promise<Cart> {
    const row = await this.prisma.cartItem.findFirst({
      where: { id: itemId, user_id: userId },
      include: { product: { select: { stock: true, is_customizable: true } } },
    });
    if (!row) {
      throw new NotFoundException("Cart item not found");
    }
    const next = Math.trunc(quantity);
    if (next <= 0) {
      await this.prisma.cartItem.delete({ where: { id: row.id } });
    } else {
      if (next > MAX_LINE_QUANTITY) {
        throw new BadRequestException(
          `Quantity must be ${MAX_LINE_QUANTITY} or fewer`,
        );
      }
      this.assertStock(row.product.is_customizable, row.product.stock, next);
      await this.prisma.cartItem.update({
        where: { id: row.id },
        data: { quantity: next },
      });
    }
    return this.get(userId);
  }

  async remove(userId: number, itemId: number): Promise<Cart> {
    await this.prisma.cartItem.deleteMany({
      where: { id: itemId, user_id: userId },
    });
    return this.get(userId);
  }

  async clear(userId: number): Promise<Cart> {
    await this.prisma.cartItem.deleteMany({ where: { user_id: userId } });
    return this.get(userId);
  }

  // inCart is what the line already held, so the message explains why a small add was refused.
  private assertStock(
    isCustomizable: boolean,
    stock: number,
    quantity: number,
    inCart = 0,
  ): void {
    if (isCustomizable) return;
    if (stock <= 0) throw new BadRequestException("This piece is sold out");
    if (quantity <= stock) return;
    throw new BadRequestException(
      inCart > 0
        ? `Only ${stock} left in stock, and ${inCart} ${inCart === 1 ? "is" : "are"} already in your cart`
        : `Only ${stock} left in stock`,
    );
  }
}
