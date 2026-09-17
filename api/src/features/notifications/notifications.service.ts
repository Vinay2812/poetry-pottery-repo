import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { MailService } from "@/mail/mail.service";
import { backInStockMail } from "@/mail/templates/notifications";
import { PrismaService } from "@/prisma/prisma.service";
import { QueueService } from "@/queue/queue.service";
import { parseEmail } from "@/features/newsletter/newsletter.service";
import type { BatchNotificationResult } from "./notifications.type";

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly queue: QueueService,
  ) {}

  // Asking twice is the same as asking once, and re-asking after a mail went out
  // puts the row back in the waiting state for the batch after this one.
  async watch(
    productId: number,
    rawEmail: string,
    userId: number | null,
  ): Promise<BatchNotificationResult> {
    const email = parseEmail(rawEmail);
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, is_active: true, is_customizable: true },
    });
    if (!product?.is_active) {
      throw new NotFoundException("That piece is no longer listed");
    }
    // A piece thrown to order never has a next batch to wait for.
    if (product.is_customizable) {
      throw new BadRequestException("That piece is made to order");
    }
    const existing = await this.prisma.batchNotification.findUnique({
      where: { email_product_id: { email, product_id: product.id } },
      select: { notified_at: true },
    });
    await this.prisma.batchNotification.upsert({
      where: { email_product_id: { email, product_id: product.id } },
      create: { email, product_id: product.id, user_id: userId },
      update: {
        notified_at: null,
        ...(userId === null ? {} : { user_id: userId }),
      },
    });
    return {
      email,
      was_already_waiting: existing !== null && existing.notified_at === null,
    };
  }

  async stopWatching(token: string): Promise<boolean> {
    const removed = await this.prisma.batchNotification.deleteMany({
      where: { token },
    });
    if (removed.count === 0) {
      throw new NotFoundException("That link has already been used");
    }
    return true;
  }

  // Called from every path that can put stock back on the shelf; publishing never blocks the write.
  announceRestock(productId: number): Promise<void> {
    return this.queue.publish("notify.back-in-stock", { productId });
  }

  // Claims the waiting rows before sending, so a job delivered twice does not mail twice.
  async sendBackInStock(productId: number): Promise<number> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { name: true, slug: true, stock: true, is_active: true },
    });
    if (!product?.is_active || product.stock <= 0) return 0;

    const claimed = await this.prisma.batchNotification.updateManyAndReturn({
      where: { product_id: productId, notified_at: null },
      data: { notified_at: new Date() },
      select: { email: true, token: true },
    });
    for (const row of claimed) {
      await this.mail.enqueue({
        to: row.email,
        ...backInStockMail(product.name, product.slug, row.token),
      });
    }
    return claimed.length;
  }
}
