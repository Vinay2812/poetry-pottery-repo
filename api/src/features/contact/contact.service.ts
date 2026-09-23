import { BadRequestException, Injectable } from "@nestjs/common";
import { z } from "zod";

import { env } from "@/config/env";
import { MailService } from "@/mail/mail.service";
import {
  contactAcknowledgementMail,
  contactMessageStudioMail,
} from "@/mail/templates/contact";
import { PrismaService } from "@/prisma/prisma.service";
import { normalisePhone } from "@/features/addresses/address-validation";
import type { ContactMessageInput } from "./contact.type";

const messageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be 80 characters or fewer"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email address")),
  phone: z
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
  subject: z
    .string()
    .trim()
    .max(120, "Subject must be 120 characters or fewer")
    .nullish()
    .transform((value) => value || null),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be 2000 characters or fewer"),
});

export type ContactFields = z.infer<typeof messageSchema>;

export function parseContactInput(input: ContactMessageInput): ContactFields {
  const result = messageSchema.safeParse(input);
  if (!result.success) {
    throw new BadRequestException(
      result.error.issues[0]?.message ?? "Check the message details",
    );
  }
  return result.data;
}

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async send(input: ContactMessageInput): Promise<boolean> {
    const fields = parseContactInput(input);
    const message = await this.prisma.contactMessage.create({ data: fields });

    if (env.BUSINESS_EMAIL) {
      await this.mail.enqueue({
        to: env.BUSINESS_EMAIL,
        ...contactMessageStudioMail(message),
      });
    }
    await this.mail.enqueue({
      to: message.email,
      ...contactAcknowledgementMail(),
    });
    return true;
  }
}
