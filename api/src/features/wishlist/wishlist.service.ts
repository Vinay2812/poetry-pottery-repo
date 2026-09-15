import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@/prisma/prisma.service";
import {
  productListInclude,
  toProduct,
} from "@/features/products/products.service";
import type { Product } from "@/features/products/products.type";
import type { WishlistToggleResult } from "./wishlist.type";

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  // A saved piece stays saved once it is archived; the card just stops offering the cart.
  async list(userId: number): Promise<Product[]> {
    const rows = await this.prisma.wishlistItem.findMany({
      where: { user_id: userId },
      include: { product: { include: productListInclude } },
      orderBy: { created_at: "desc" },
    });
    return rows.map((row) => toProduct(row.product));
  }

  async ids(userId: number): Promise<number[]> {
    const rows = await this.prisma.wishlistItem.findMany({
      where: { user_id: userId },
      select: { product_id: true },
    });
    return rows.map((row) => row.product_id);
  }

  async toggle(
    userId: number,
    productId: number,
  ): Promise<WishlistToggleResult> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) {
      throw new NotFoundException("Product not found");
    }
    const isWishlisted = await this.prisma.withTransaction(async () => {
      const removed = await this.prisma.wishlistItem.deleteMany({
        where: { user_id: userId, product_id: productId },
      });
      if (removed.count > 0) return false;
      // A double tap can race the insert; duplicates are simply skipped.
      await this.prisma.wishlistItem.createMany({
        data: { user_id: userId, product_id: productId },
        skipDuplicates: true,
      });
      return true;
    });
    const wishlist_count = await this.prisma.wishlistItem.count({
      where: { user_id: userId },
    });
    return {
      product_id: productId,
      is_wishlisted: isWishlisted,
      wishlist_count,
    };
  }

  async remove(userId: number, productId: number): Promise<void> {
    await this.prisma.wishlistItem.deleteMany({
      where: { user_id: userId, product_id: productId },
    });
  }
}
