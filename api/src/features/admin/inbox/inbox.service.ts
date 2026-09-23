import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { clampPage, toPageInfo } from "@/common/pagination/pagination";
import { csvCell } from "@/common/csv";
import { PrismaService } from "@/prisma/prisma.service";
import type {
  ContactMessage,
  ContactMessagesResult,
} from "@/features/contact/contact.type";
import { searchTerm } from "../admin.type";
import { rethrowMissing } from "../missing-row";
import type {
  AdminBatchNotificationsFilterInput,
  AdminBatchNotificationsResult,
  AdminContactFilterInput,
  AdminSubscribersFilterInput,
  AdminSubscribersResult,
} from "./inbox.type";

const MAX_LIMIT = 60;
const EXPORT_LIMIT = 10_000;

export interface CsvSubscriber {
  email: string;
  is_active: boolean;
  created_at: Date;
  unsubscribed_at: Date | null;
}

export interface CsvWatcher {
  email: string;
  product: { name: string };
  created_at: Date;
  notified_at: Date | null;
}

// The waiting list for the next kiln load, in the same shape as the subscriber sheet.
export function toWatcherCsv(rows: readonly CsvWatcher[]): string {
  const header = "email,piece,requested_at,notified_at";
  const lines = rows.map((row) =>
    [
      csvCell(row.email),
      csvCell(row.product.name),
      row.created_at.toISOString(),
      row.notified_at?.toISOString() ?? "",
    ].join(","),
  );
  return [header, ...lines].join("\n");
}

// A plain RFC 4180 sheet the studio can open in any spreadsheet.
export function toCsv(rows: readonly CsvSubscriber[]): string {
  const header = "email,status,subscribed_at,unsubscribed_at";
  const lines = rows.map((row) =>
    [
      csvCell(row.email),
      row.is_active ? "subscribed" : "unsubscribed",
      row.created_at.toISOString(),
      row.unsubscribed_at?.toISOString() ?? "",
    ].join(","),
  );
  return [header, ...lines].join("\n");
}

@Injectable()
export class AdminInboxService {
  constructor(private readonly prisma: PrismaService) {}

  async messages(
    filter: AdminContactFilterInput,
  ): Promise<ContactMessagesResult> {
    const bounds = clampPage(filter.page, filter.limit, MAX_LIMIT);
    const term = searchTerm(filter.search);
    const where: Prisma.ContactMessageWhereInput = {
      ...(filter.is_read == null ? {} : { is_read: filter.is_read }),
      ...(term
        ? {
            OR: [
              { name: { contains: term, mode: "insensitive" } },
              { email: { contains: term, mode: "insensitive" } },
              { subject: { contains: term, mode: "insensitive" } },
              { message: { contains: term, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.contactMessage.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip: bounds.skip,
        take: bounds.limit,
      }),
      this.prisma.contactMessage.count({ where }),
    ]);
    return { items, page_info: toPageInfo(bounds, total) };
  }

  setMessageRead(id: number, isRead: boolean): Promise<ContactMessage> {
    return this.prisma.contactMessage
      .update({ where: { id }, data: { is_read: isRead } })
      .catch(rethrowMissing("Message not found"));
  }

  async deleteMessage(id: number): Promise<boolean> {
    await this.prisma.contactMessage
      .delete({ where: { id } })
      .catch(rethrowMissing("Message not found"));
    return true;
  }

  async subscribers(
    filter: AdminSubscribersFilterInput,
  ): Promise<AdminSubscribersResult> {
    const bounds = clampPage(filter.page, filter.limit, MAX_LIMIT);
    const where = this.subscriberWhere(filter);
    const [items, total] = await Promise.all([
      this.prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip: bounds.skip,
        take: bounds.limit,
        select: {
          id: true,
          email: true,
          is_active: true,
          created_at: true,
          unsubscribed_at: true,
          user_id: true,
        },
      }),
      this.prisma.newsletterSubscriber.count({ where }),
    ]);
    return { items, page_info: toPageInfo(bounds, total) };
  }

  // Returned as one string so the console can offer it as a download without another endpoint.
  async exportSubscribers(
    filter: AdminSubscribersFilterInput,
  ): Promise<string> {
    const rows = await this.prisma.newsletterSubscriber.findMany({
      where: this.subscriberWhere(filter),
      orderBy: { created_at: "asc" },
      take: EXPORT_LIMIT,
      select: {
        email: true,
        is_active: true,
        created_at: true,
        unsubscribed_at: true,
      },
    });
    return toCsv(rows);
  }

  async unsubscribe(email: string): Promise<boolean> {
    const updated = await this.prisma.newsletterSubscriber.updateMany({
      where: { email: email.trim().toLowerCase(), is_active: true },
      data: { is_active: false, unsubscribed_at: new Date() },
    });
    if (updated.count === 0) {
      throw new NotFoundException("That address is not on the list");
    }
    return true;
  }

  async batchNotifications(
    filter: AdminBatchNotificationsFilterInput,
  ): Promise<AdminBatchNotificationsResult> {
    const bounds = clampPage(filter.page, filter.limit, MAX_LIMIT);
    const where = this.watcherWhere(filter);
    const [rows, total] = await Promise.all([
      this.prisma.batchNotification.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip: bounds.skip,
        take: bounds.limit,
        select: {
          id: true,
          email: true,
          product_id: true,
          created_at: true,
          notified_at: true,
          product: { select: { name: true, slug: true } },
        },
      }),
      this.prisma.batchNotification.count({ where }),
    ]);
    return {
      items: rows.map(({ product, ...row }) => ({
        ...row,
        product_name: product.name,
        product_slug: product.slug,
      })),
      page_info: toPageInfo(bounds, total),
    };
  }

  async exportBatchNotifications(
    filter: AdminBatchNotificationsFilterInput,
  ): Promise<string> {
    const rows = await this.prisma.batchNotification.findMany({
      where: this.watcherWhere(filter),
      orderBy: { created_at: "asc" },
      take: EXPORT_LIMIT,
      select: {
        email: true,
        created_at: true,
        notified_at: true,
        product: { select: { name: true } },
      },
    });
    return toWatcherCsv(rows);
  }

  private watcherWhere(
    filter: AdminBatchNotificationsFilterInput,
  ): Prisma.BatchNotificationWhereInput {
    const term = searchTerm(filter.search);
    return {
      ...(filter.is_notified == null
        ? {}
        : { notified_at: filter.is_notified ? { not: null } : null }),
      ...(filter.product_id ? { product_id: filter.product_id } : {}),
      ...(term
        ? {
            OR: [
              { email: { contains: term, mode: "insensitive" } },
              { product: { name: { contains: term, mode: "insensitive" } } },
            ],
          }
        : {}),
    };
  }

  private subscriberWhere(
    filter: AdminSubscribersFilterInput,
  ): Prisma.NewsletterSubscriberWhereInput {
    const term = searchTerm(filter.search);
    return {
      ...(filter.is_active == null ? {} : { is_active: filter.is_active }),
      ...(term ? { email: { contains: term, mode: "insensitive" } } : {}),
    };
  }
}
