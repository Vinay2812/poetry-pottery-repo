import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/prisma.service";
import { QueueService } from "@/queue/queue.service";
import { becameBuyable, type ShelfState, shelfSelect } from "./shelf";

interface Piece {
  id: number;
  is_customizable: boolean;
}

// Every move of stock or the listing flag comes through here, so the "became buyable" edge is
// computed on the row the write landed on and announced only once the transaction has committed.
@Injectable()
export class ShelfService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queue: QueueService,
  ) {}

  // Conditional decrement is the oversell guard: two buyers cannot both take the last piece.
  async take(piece: Piece, quantity: number): Promise<boolean> {
    if (piece.is_customizable) {
      await this.prisma.product.update({
        where: { id: piece.id },
        data: { sales_count: { increment: quantity } },
      });
      return true;
    }
    const taken = await this.prisma.product.updateMany({
      where: { id: piece.id, stock: { gte: quantity } },
      data: {
        stock: { decrement: quantity },
        sales_count: { increment: quantity },
      },
    });
    return taken.count === 1;
  }

  release(piece: Piece, quantity: number): Promise<void> {
    return this.prisma.withTransaction(async () => {
      const restored = piece.is_customizable ? 0 : quantity;
      const after = await this.prisma.product.update({
        where: { id: piece.id },
        data: {
          sales_count: { decrement: quantity },
          ...(restored === 0 ? {} : { stock: { increment: restored } }),
        },
        select: shelfSelect,
      });
      await this.announce({ ...after, stock: after.stock - restored }, after);
    });
  }

  // Applied conditionally so two admins counting the same shelf cannot drive stock negative;
  // null means the shelf did not hold that many.
  adjust(productId: number, delta: number): Promise<number | null> {
    return this.prisma.withTransaction(async () => {
      const moved = await this.prisma.product.updateManyAndReturn({
        where: {
          id: productId,
          ...(delta < 0 ? { stock: { gte: -delta } } : {}),
        },
        data: { stock: { increment: delta } },
        select: shelfSelect,
      });
      const after = moved[0];
      if (!after) return null;
      await this.announce({ ...after, stock: after.stock - delta }, after);
      return after.stock;
    });
  }

  // Predicated on the opposite flag, so the row that moved is exactly the one whose edge is judged.
  setListed(productId: number, isActive: boolean): Promise<boolean> {
    return this.prisma.withTransaction(async () => {
      const moved = await this.prisma.product.updateManyAndReturn({
        where: { id: productId, is_active: !isActive },
        data: { is_active: isActive },
        select: shelfSelect,
      });
      const after = moved[0];
      if (!after) return false;
      await this.announce({ ...after, is_active: !isActive }, after);
      return true;
    });
  }

  // Made to order is the third shelf fact: switching it on puts a sold-out piece back on sale.
  setMadeToOrder(productId: number, isCustomizable: boolean): Promise<boolean> {
    return this.prisma.withTransaction(async () => {
      const moved = await this.prisma.product.updateManyAndReturn({
        where: { id: productId, is_customizable: !isCustomizable },
        data: { is_customizable: isCustomizable },
        select: shelfSelect,
      });
      const after = moved[0];
      if (!after) return false;
      await this.announce(
        { ...after, is_customizable: !isCustomizable },
        after,
      );
      return true;
    });
  }

  private async announce(
    before: ShelfState,
    after: ShelfState & { id: number },
  ): Promise<void> {
    if (!becameBuyable(before, after)) return;
    await this.queue.publish("notify.back-in-stock", { productId: after.id });
  }
}
