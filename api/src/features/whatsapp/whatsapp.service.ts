import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma, WhatsAppDirection } from "@prisma/client";
import { z } from "zod";

import { clampPage, toPageInfo } from "@/common/pagination/pagination";
import { env } from "@/config/env";
import { MailService } from "@/mail/mail.service";
import {
  whatsAppCustomerMail,
  whatsAppStudioMail,
} from "@/mail/templates/whatsapp";
import { PrismaService } from "@/prisma/prisma.service";
import { searchTerm, toUserRef } from "@/features/admin/admin.type";
import { normalisePhone } from "@/features/addresses/address-validation";
import type {
  AdminWhatsAppFilterInput,
  AdminWhatsAppMessagesResult,
  RecordWhatsAppMessageInput,
  SendWhatsAppReplyInput,
} from "./whatsapp.type";

const MAX_LIMIT = 60;

const kindField = z
  .string()
  .trim()
  .min(1, "Say what kind of message this is")
  .max(40, "Kind must be 40 characters or fewer");

const bodyField = z
  .string()
  .trim()
  .min(1, "The message is empty")
  .max(2000, "Message must be 2000 characters or fewer");

const referenceField = z
  .string()
  .trim()
  .max(120, "Reference must be 120 characters or fewer")
  .nullish()
  .transform((value) => value || null);

const recordSchema = z.object({
  kind: kindField,
  body: bodyField,
  page_url: z
    .string()
    .trim()
    .max(500, "Page URL must be 500 characters or fewer")
    .nullish()
    .transform((value) => value || null),
  reference: referenceField,
});

const replySchema = z.object({
  kind: kindField,
  body: bodyField,
  to_email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email address")),
  to_phone: z
    .string()
    .nullish()
    .transform((value, ctx) => {
      if (!value?.trim()) return null;
      const phone = normalisePhone(value);
      if (phone === null) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a valid 10-digit phone number",
        });
        return z.NEVER;
      }
      return phone;
    }),
  reference: referenceField,
});

export type RecordFields = z.infer<typeof recordSchema>;
export type ReplyFields = z.infer<typeof replySchema>;

function firstIssue(error: z.ZodError, fallback: string): never {
  throw new BadRequestException(error.issues[0]?.message ?? fallback);
}

export function parseRecordInput(
  input: RecordWhatsAppMessageInput,
): RecordFields {
  const result = recordSchema.safeParse(input);
  return result.success
    ? result.data
    : firstIssue(result.error, "Check the message");
}

export function parseReplyInput(input: SendWhatsAppReplyInput): ReplyFields {
  const result = replySchema.safeParse(input);
  return result.success
    ? result.data
    : firstIssue(result.error, "Check the reply");
}

const userRefSelect = { id: true, name: true, email: true, image: true };

@Injectable()
export class WhatsAppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  // A visitor tapped a wa.me link; keep the text and tell the studio in case WhatsApp never opens.
  async record(
    input: RecordWhatsAppMessageInput,
    userId: number | null,
  ): Promise<boolean> {
    const fields = parseRecordInput(input);
    const sender =
      userId === null
        ? null
        : await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, phone: true },
          });
    const message = await this.prisma.whatsAppMessage.create({
      data: {
        ...fields,
        direction: WhatsAppDirection.TO_STUDIO,
        user_id: sender?.id ?? null,
        name: sender?.name ?? null,
        email: sender?.email ?? null,
        phone: sender?.phone ?? null,
      },
    });

    if (env.BUSINESS_EMAIL) {
      await this.mail.enqueue({
        to: env.BUSINESS_EMAIL,
        ...whatsAppStudioMail(message),
      });
    }
    return true;
  }

  // The admin's WhatsApp reply also lands in the customer's inbox, so nothing lives only in chat.
  async reply(
    input: SendWhatsAppReplyInput,
    adminId: number,
  ): Promise<boolean> {
    const fields = parseReplyInput(input);
    const message = await this.prisma.whatsAppMessage.create({
      data: {
        direction: WhatsAppDirection.TO_CUSTOMER,
        kind: fields.kind,
        body: fields.body,
        reference: fields.reference,
        user_id: adminId,
        email: fields.to_email,
        phone: fields.to_phone,
      },
    });
    await this.mail.enqueue({
      to: message.email ?? fields.to_email,
      ...whatsAppCustomerMail(message),
    });
    return true;
  }

  async list(
    filter: AdminWhatsAppFilterInput,
  ): Promise<AdminWhatsAppMessagesResult> {
    const bounds = clampPage(filter.page, filter.limit, MAX_LIMIT);
    const term = searchTerm(filter.search);
    const where: Prisma.WhatsAppMessageWhereInput = {
      ...(filter.direction ? { direction: filter.direction } : {}),
      ...(filter.user_id ? { user_id: filter.user_id } : {}),
      ...(term
        ? {
            OR: [
              { body: { contains: term, mode: "insensitive" } },
              { name: { contains: term, mode: "insensitive" } },
              { email: { contains: term, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.whatsAppMessage.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip: bounds.skip,
        take: bounds.limit,
        include: { user: { select: userRefSelect } },
      }),
      this.prisma.whatsAppMessage.count({ where }),
    ]);
    return {
      items: rows.map(({ user, ...row }) => ({
        ...row,
        user: user ? toUserRef(user) : null,
      })),
      page_info: toPageInfo(bounds, total),
    };
  }
}
