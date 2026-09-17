import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { clampPage, toPageInfo } from "@/common/pagination/pagination";
import { PrismaService } from "@/prisma/prisma.service";
import { ProductsService } from "@/features/products/products.service";
import { searchTerm } from "../admin.type";
import { slugify, uniqueSlug } from "../slug";
import { UploadsService } from "../uploads/uploads.service";
import { UploadPurpose } from "../uploads/uploads.type";
import type {
  AdminGlaze,
  AdminGlazeInput,
  AdminGlazesFilterInput,
  AdminGlazesResult,
} from "./glazes.type";

const MAX_LIMIT = 60;
const HEX = /^#[0-9a-f]{6}$/i;

// The swatch on the table is a flat colour, so the console stores a plain six-digit hex.
export function parseColorCode(
  value: string | null | undefined,
): string | null {
  const code = value?.trim() ?? "";
  if (code.length === 0) return null;
  if (!HEX.test(code)) {
    throw new BadRequestException("A glaze colour must be a hex like #6F7D6B");
  }
  return code.toLowerCase();
}

type GlazeRow = Prisma.GlazeGetPayload<{
  include: { _count: { select: { products: true } } };
}>;

export function toAdminGlaze({ _count, ...glaze }: GlazeRow): AdminGlaze {
  return { glaze, product_count: _count.products };
}

@Injectable()
export class AdminGlazesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly products: ProductsService,
    private readonly uploads: UploadsService,
  ) {}

  async list(filter: AdminGlazesFilterInput): Promise<AdminGlazesResult> {
    const bounds = clampPage(filter.page, filter.limit, MAX_LIMIT);
    const term = searchTerm(filter.search);
    const where: Prisma.GlazeWhereInput = term
      ? {
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { slug: { contains: term, mode: "insensitive" } },
          ],
        }
      : {};
    const [rows, total] = await Promise.all([
      this.prisma.glaze.findMany({
        where,
        orderBy: { name: "asc" },
        skip: bounds.skip,
        take: bounds.limit,
        include: { _count: { select: { products: true } } },
      }),
      this.prisma.glaze.count({ where }),
    ]);
    return {
      items: rows.map(toAdminGlaze),
      page_info: toPageInfo(bounds, total),
    };
  }

  async create(input: AdminGlazeInput): Promise<AdminGlaze> {
    const swatch_url = input.swatch_url?.trim() || null;
    await this.uploads.assertConfirmed(
      swatch_url ? [swatch_url] : [],
      [],
      UploadPurpose.GLAZE,
    );
    const row = await this.prisma.glaze.create({
      data: {
        slug: await this.freeSlug(input.name),
        name: input.name.trim(),
        description: input.description.trim(),
        variation_note: input.variation_note?.trim() || null,
        swatch_url,
        color_code: parseColorCode(input.color_code),
      },
      include: { _count: { select: { products: true } } },
    });
    await this.products.invalidateCatalogCache();
    return toAdminGlaze(row);
  }

  async update(id: number, input: AdminGlazeInput): Promise<AdminGlaze> {
    const current = await this.prisma.glaze.findUnique({
      where: { id },
      select: { swatch_url: true },
    });
    if (!current) {
      throw new NotFoundException("Glaze not found");
    }
    const swatch_url = input.swatch_url?.trim() || null;
    await this.uploads.assertConfirmed(
      swatch_url ? [swatch_url] : [],
      current.swatch_url ? [current.swatch_url] : [],
      UploadPurpose.GLAZE,
    );
    const row = await this.prisma.glaze.update({
      where: { id },
      data: {
        name: input.name.trim(),
        description: input.description.trim(),
        variation_note: input.variation_note?.trim() || null,
        swatch_url,
        color_code: parseColorCode(input.color_code),
      },
      include: { _count: { select: { products: true } } },
    });
    await this.products.invalidateCatalogCache();
    return toAdminGlaze(row);
  }

  // Deleting would quietly strip the glaze off every piece wearing it, so it is refused instead.
  async remove(id: number): Promise<boolean> {
    const row = await this.prisma.glaze.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!row) {
      throw new NotFoundException("Glaze not found");
    }
    if (row._count.products > 0) {
      throw new BadRequestException(
        `${row._count.products} pieces still wear this glaze; move them first`,
      );
    }
    await this.prisma.glaze.delete({ where: { id } });
    await this.products.invalidateCatalogCache();
    return true;
  }

  private async freeSlug(name: string): Promise<string> {
    const base = slugify(name);
    const siblings = await this.prisma.glaze.findMany({
      where: { slug: { startsWith: base } },
      select: { slug: true },
    });
    return uniqueSlug(base, new Set(siblings.map((row) => row.slug)));
  }
}
