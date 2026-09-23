import { BadRequestException, Injectable } from "@nestjs/common";
import { CommissionStatus, Prisma } from "@prisma/client";
import { z } from "zod";

import { clampPage, toPageInfo } from "@/common/pagination/pagination";
import { env } from "@/config/env";
import { MailService } from "@/mail/mail.service";
import {
  commissionAcknowledgementMail,
  commissionStudioMail,
} from "@/mail/templates/commissions";
import { PrismaService } from "@/prisma/prisma.service";
import { PendingUploadsService } from "@/storage/pending-uploads.service";
import { customizationPrefix, StorageService } from "@/storage/storage.service";
import { rethrowMissing } from "@/features/admin/missing-row";
import { normalisePhone } from "@/features/addresses/address-validation";
import { type Product } from "@/features/products/products.type";
import {
  productListInclude,
  sellableProductWhere,
  toProduct,
} from "@/features/products/products.service";
import type {
  CommissionOptions,
  CommissionRequest,
  CommissionRequestInput,
  CommissionRequestsFilterInput,
  CommissionRequestsResult,
} from "./commissions.type";

export const MAX_REFERENCE_PHOTOS = 3;
const MAX_COMMISSION_PIECES = 12;

// The words are carved by hand into wet clay, so the line has to stay short enough to fit.
export const MAX_CARVED_WORDS = 40;

const briefSchema = z.object({
  piece_type: z
    .string()
    .trim()
    .min(2, "Say which piece you have in mind")
    .max(60, "Piece must be 60 characters or fewer"),
  size: z
    .string()
    .trim()
    .min(1, "Pick a size")
    .max(60, "Size must be 60 characters or fewer"),
  glaze: z
    .string()
    .trim()
    .min(1, "Pick a glaze")
    .max(60, "Glaze must be 60 characters or fewer"),
  carved_words: z
    .string()
    .trim()
    .max(MAX_CARVED_WORDS, `Keep the words to ${MAX_CARVED_WORDS} characters`)
    .nullish()
    .transform((value) => value || null),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes must be 1000 characters or fewer")
    .nullish()
    .transform((value) => value || null),
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
  reference_image_urls: z
    .array(z.url("Reference photos must be uploaded through the studio"))
    .max(MAX_REFERENCE_PHOTOS, `Attach at most ${MAX_REFERENCE_PHOTOS} photos`)
    .nullish()
    .transform((value) => value ?? []),
});

export type CommissionFields = z.infer<typeof briefSchema>;

export function parseCommissionInput(
  input: CommissionRequestInput,
): CommissionFields {
  const result = briefSchema.safeParse(input);
  if (!result.success) {
    throw new BadRequestException(
      result.error.issues[0]?.message ?? "Check the brief",
    );
  }
  return result.data;
}

const SIZE_GROUP_NAMES = ["size", "sizes"];

@Injectable()
export class CommissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly storage: StorageService,
    private readonly pendingUploads: PendingUploadsService,
  ) {}

  // The form never invents a size or a glaze: it offers the glazes the studio fires and, per
  // piece, the sizes the made-to-order product pages in that category already carry.
  // Read straight through: nothing in the API writes glazes, categories or options, so a
  // cache here could only ever be invalidated by a TTL guessing when the seed last ran.
  async options(): Promise<CommissionOptions> {
    const [categories, glazes] = await Promise.all([
      this.prisma.category.findMany({
        where: { products: { some: sellableProductWhere() } },
        orderBy: [{ sort_order: "asc" }, { name: "asc" }],
        select: {
          name: true,
          products: {
            where: { AND: [sellableProductWhere(), { is_customizable: true }] },
            select: {
              option_groups: {
                where: { name: { in: SIZE_GROUP_NAMES, mode: "insensitive" } },
                select: {
                  options: {
                    where: { is_active: true },
                    orderBy: [{ sort_order: "asc" }, { name: "asc" }],
                    select: { name: true },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.glaze.findMany({
        orderBy: { name: "asc" },
        select: { slug: true, name: true, color_code: true },
      }),
    ]);
    const pieces = new Map<string, string[]>();
    for (const category of categories) {
      const name = category.name.trim();
      if (!name) continue;
      const sizes = category.products.flatMap((product) =>
        product.option_groups.flatMap((group) =>
          group.options.map((option) => option.name),
        ),
      );
      pieces.set(name, unique([...(pieces.get(name) ?? []), ...sizes]));
    }
    return {
      piece_types: [...pieces].map(([name, sizes]) => ({ name, sizes })),
      glazes,
    };
  }

  // Past commissions if the studio has flagged any; the made-to-order shelf until then.
  async pieces(limit: number): Promise<Product[]> {
    const take = Math.min(MAX_COMMISSION_PIECES, Math.max(1, limit));
    const flagged = await this.prisma.product.findMany({
      where: { is_commission: true },
      include: productListInclude,
      orderBy: [{ created_at: "desc" }, { id: "desc" }],
      take,
    });
    if (flagged.length > 0) return flagged.map(toProduct);
    const madeToOrder = await this.prisma.product.findMany({
      where: { ...sellableProductWhere(), is_customizable: true },
      include: productListInclude,
      orderBy: [{ created_at: "desc" }, { id: "desc" }],
      take,
    });
    return madeToOrder.map(toProduct);
  }

  async create(
    input: CommissionRequestInput,
    userId: number | null,
  ): Promise<CommissionRequest> {
    const fields = parseCommissionInput(input);
    // Only photos this sender uploaded travel with a brief; a guest cannot upload, so carries none.
    const foreign = fields.reference_image_urls.find(
      (url) =>
        userId === null ||
        !this.storage.isUploadedUnder(url, customizationPrefix(userId)),
    );
    if (foreign) {
      throw new BadRequestException(
        "Reference photos must be uploaded through the studio",
      );
    }

    const request = await this.prisma.commissionRequest.create({
      data: { ...fields, user_id: userId },
    });

    // The brief keeps its photos, so they are no longer waiting to be swept.
    if (userId !== null) {
      await this.pendingUploads.keep(userId, fields.reference_image_urls);
    }

    if (env.BUSINESS_EMAIL) {
      await this.mail.enqueue({
        to: env.BUSINESS_EMAIL,
        ...commissionStudioMail(request),
      });
    }
    await this.mail.enqueue({
      to: request.email,
      ...commissionAcknowledgementMail(request),
    });
    return request;
  }

  async list(
    filter: CommissionRequestsFilterInput,
  ): Promise<CommissionRequestsResult> {
    const bounds = clampPage(filter.page, filter.limit);
    const term = filter.search?.trim() || null;
    const where: Prisma.CommissionRequestWhereInput = {
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.is_read == null ? {} : { is_read: filter.is_read }),
      ...(term
        ? {
            OR: [
              { name: { contains: term, mode: "insensitive" } },
              { email: { contains: term, mode: "insensitive" } },
              { piece_type: { contains: term, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.commissionRequest.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip: bounds.skip,
        take: bounds.limit,
      }),
      this.prisma.commissionRequest.count({ where }),
    ]);
    return { items, page_info: toPageInfo(bounds, total) };
  }

  markRead(id: string): Promise<CommissionRequest> {
    return this.prisma.commissionRequest
      .update({ where: { id }, data: { is_read: true } })
      .catch(rethrowMissing("Commission request not found"));
  }

  // Moving a brief off NEW means someone has looked at it, so it counts as read too.
  setStatus(id: string, status: CommissionStatus): Promise<CommissionRequest> {
    return this.prisma.commissionRequest
      .update({
        where: { id },
        data: {
          status,
          ...(status === CommissionStatus.NEW ? {} : { is_read: true }),
        },
      })
      .catch(rethrowMissing("Commission request not found"));
  }
}

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
