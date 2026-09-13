import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { clampPage, toPageInfo } from "@/common/pagination/pagination";
import { PrismaService } from "@/prisma/prisma.service";
import type {
  ContactMessage,
  ContactMessagesResult,
} from "@/features/contact/contact.type";
import { searchTerm } from "../admin.type";
import type {
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

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
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
    return this.prisma.contactMessage.update({
      where: { id },
      data: { is_read: isRead },
    });
  }

  async deleteMessage(id: number): Promise<boolean> {
    await this.prisma.contactMessage.delete({ where: { id } });
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
