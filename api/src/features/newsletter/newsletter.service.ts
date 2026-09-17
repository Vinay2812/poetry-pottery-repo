import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { z } from "zod";

import { MailService } from "@/mail/mail.service";
import { newsletterWelcomeMail } from "@/mail/templates/newsletter";
import { PrismaService } from "@/prisma/prisma.service";
import type { NewsletterResult, NewsletterStatus } from "./newsletter.type";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address"));

export function parseEmail(value: string): string {
  const result = emailSchema.safeParse(value);
  if (!result.success) {
    throw new BadRequestException(
      result.error.issues[0]?.message ?? "Enter a valid email address",
    );
  }
  return result.data;
}

@Injectable()
export class NewsletterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async subscribe(
    rawEmail: string,
    userId: number | null,
  ): Promise<NewsletterResult> {
    const email = parseEmail(rawEmail);
    const { subscriber, wasActive } = await this.prisma.withTransaction(
      async () => {
        // A new row starts dormant so the wake-up below is the single write that decides
        // who gets to send the welcome; a storm of signups only wakes it once.
        await this.prisma.newsletterSubscriber.createMany({
          data: { email, is_active: false },
          skipDuplicates: true,
        });
        const row = await this.prisma.newsletterSubscriber.findUniqueOrThrow({
          where: { email },
          select: { id: true },
        });
        // user_id is unique, so only link when the account is free or already on this row.
        const linked = await this.linkableUserId(userId, row.id);
        if (linked !== null) {
          await this.prisma.newsletterSubscriber.updateMany({
            where: { email },
            data: { user_id: linked },
          });
        }
        const woken = await this.prisma.newsletterSubscriber.updateMany({
          where: { email, is_active: false },
          data: { is_active: true, unsubscribed_at: null },
        });
        const subscriber =
          await this.prisma.newsletterSubscriber.findUniqueOrThrow({
            where: { email },
          });
        return { subscriber, wasActive: woken.count === 0 };
      },
    );

    if (!wasActive) {
      await this.mail.enqueue({
        to: subscriber.email,
        ...newsletterWelcomeMail(subscriber.token),
      });
    }

    return {
      email: subscriber.email,
      is_active: subscriber.is_active,
      was_already_subscribed: wasActive,
    };
  }

  async unsubscribe(token: string): Promise<boolean> {
    const updated = await this.prisma.newsletterSubscriber.updateMany({
      where: { token },
      data: { is_active: false, unsubscribed_at: new Date() },
    });
    if (updated.count === 0) {
      throw new NotFoundException("Subscription not found");
    }
    return true;
  }

  async status(userId: number): Promise<NewsletterStatus> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    const subscriber = await this.prisma.newsletterSubscriber.findFirst({
      where: {
        OR: [{ user_id: userId }, ...(user ? [{ email: user.email }] : [])],
      },
      orderBy: { user_id: { sort: "asc", nulls: "last" } },
    });
    return {
      is_subscribed: subscriber?.is_active ?? false,
      email: subscriber?.email ?? user?.email ?? null,
    };
  }

  private async linkableUserId(
    userId: number | null,
    subscriberId: number | null,
  ): Promise<number | null> {
    if (userId === null) return null;
    const owned = await this.prisma.newsletterSubscriber.findUnique({
      where: { user_id: userId },
      select: { id: true },
    });
    return owned === null || owned.id === subscriberId ? userId : null;
  }
}
