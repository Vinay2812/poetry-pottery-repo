import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { OptionGroupKind, Prisma } from "@prisma/client";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import type { Logger } from "winston";

import { clampPage, toPageInfo } from "@/common/pagination/pagination";
import { PrismaService } from "@/prisma/prisma.service";
import {
  productListInclude,
  ProductsService,
  toProduct,
} from "@/features/products/products.service";
import type {
  Product,
  ProductOptionGroup,
} from "@/features/products/products.type";
import { NotificationsService } from "@/features/notifications/notifications.service";
import { cameBackInStock } from "@/features/notifications/restock";
import { SearchService } from "@/features/search/search.service";
import { searchTerm } from "../admin.type";
import { LOW_STOCK_THRESHOLD } from "../dashboard/dashboard.service";
import { rethrowMissing } from "../missing-row";
import { slugify, uniqueSlug } from "../slug";
import { UploadsService } from "../uploads/uploads.service";
import { UploadPurpose } from "../uploads/uploads.type";
import type {
  AdminOptionGroupInput,
  AdminOptionInput,
  AdminProductInput,
  AdminProductsFilterInput,
  AdminProductsResult,
  AdminProductUpdateInput,
} from "./products.type";

const MAX_LIMIT = 60;

export function assertMoney(
  value: number | null | undefined,
  label: string,
): void {
  if (value != null && (!Number.isInteger(value) || value < 0)) {
    throw new BadRequestException(`${label} must be a whole number of rupees`);
  }
}

export function assertStock(value: number | null | undefined): void {
  if (value != null && (!Number.isInteger(value) || value < 0)) {
    throw new BadRequestException("Stock cannot go below zero");
  }
}

// A measurement is either a positive number or missing; zero is never a real piece.
export function assertMeasure(
  value: number | null | undefined,
  label: string,
  max: number,
): void {
  if (value != null && (!Number.isFinite(value) || value <= 0 || value > max)) {
    throw new BadRequestException(`${label} must be between 0 and ${max}`);
  }
}

export function assertMeasurements(input: {
  capacity_ml?: number | null;
  height_cm?: number | null;
  diameter_cm?: number | null;
  weight_g?: number | null;
}): void {
  assertMeasure(input.capacity_ml, "Capacity", 20_000);
  assertMeasure(input.height_cm, "Height", 999);
  assertMeasure(input.diameter_cm, "Diameter", 999);
  assertMeasure(input.weight_g, "Weight", 50_000);
}

// A second is only honest if the flaw is named, so the two fields travel together.
export function assertSecond(
  isSecond: boolean | null | undefined,
  flawNote: string | null | undefined,
): void {
  if (isSecond === true && !flawNote?.trim()) {
    throw new BadRequestException("Say what the kiln left on this piece");
  }
}

// Blank entries are dropped so an empty row in the console never becomes an empty care note.
export function cleanList(
  values: readonly string[] | null | undefined,
): string[] {
  return (values ?? []).map((value) => value.trim()).filter(Boolean);
}

@Injectable()
export class AdminProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly products: ProductsService,
    private readonly search: SearchService,
    private readonly uploads: UploadsService,
    private readonly notifications: NotificationsService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async list(filter: AdminProductsFilterInput): Promise<AdminProductsResult> {
    const bounds = clampPage(filter.page, filter.limit, MAX_LIMIT);
    const term = searchTerm(filter.search);
    const where: Prisma.ProductWhereInput = {
      ...(term
        ? {
            OR: [
              { name: { contains: term, mode: "insensitive" } },
              { slug: { contains: term, mode: "insensitive" } },
              { material: { contains: term, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(filter.category_id
        ? { categories: { some: { id: filter.category_id } } }
        : {}),
      ...(filter.collection_id ? { collection_id: filter.collection_id } : {}),
      ...(filter.is_active == null ? {} : { is_active: filter.is_active }),
      ...(filter.is_featured == null
        ? {}
        : { is_featured: filter.is_featured }),
      ...(filter.low_stock
        ? { stock: { lte: LOW_STOCK_THRESHOLD }, is_customizable: false }
        : {}),
      ...(filter.is_second == null ? {} : { is_second: filter.is_second }),
      ...(filter.glaze_id ? { glaze_id: filter.glaze_id } : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: productListInclude,
        orderBy: [{ created_at: "desc" }, { id: "desc" }],
        skip: bounds.skip,
        take: bounds.limit,
      }),
      this.prisma.product.count({ where }),
    ]);
    return {
      items: rows.map(toProduct),
      page_info: toPageInfo(bounds, total),
    };
  }

  async byId(id: number): Promise<Product> {
    const row = await this.prisma.product.findUnique({
      where: { id },
      include: productListInclude,
    });
    if (!row) {
      throw new NotFoundException("Product not found");
    }
    return toProduct(row);
  }

  async create(input: AdminProductInput): Promise<Product> {
    assertMoney(input.price, "Price");
    assertMoney(input.compare_at_price, "Compare-at price");
    assertStock(input.stock);
    assertMeasurements(input);
    assertSecond(input.is_second, input.flaw_note);
    await this.assertLinks(
      input.category_ids,
      input.collection_id,
      input.glaze_id,
    );
    const image_urls = cleanList(input.image_urls);
    await this.uploads.assertConfirmed(image_urls, [], UploadPurpose.PRODUCT);

    const row = await this.prisma.product.create({
      data: {
        slug: await this.freeSlug(input.name),
        name: input.name.trim(),
        description: input.description.trim(),
        price: input.price,
        compare_at_price: input.compare_at_price ?? null,
        material: input.material.trim(),
        color_name: input.color_name?.trim() || null,
        color_code: input.color_code?.trim() || null,
        dimensions: input.dimensions?.trim() || null,
        care_notes: cleanList(input.care_notes),
        image_urls,
        stock: input.stock ?? 0,
        is_active: input.is_active ?? true,
        is_featured: input.is_featured ?? false,
        is_customizable: input.is_customizable ?? false,
        is_second: input.is_second ?? false,
        flaw_note: input.flaw_note?.trim() || null,
        is_commission: input.is_commission ?? false,
        collection_id: input.collection_id ?? null,
        glaze_id: input.glaze_id ?? null,
        capacity_ml: input.capacity_ml ?? null,
        height_cm: input.height_cm ?? null,
        diameter_cm: input.diameter_cm ?? null,
        weight_g: input.weight_g ?? null,
        maker_note: input.maker_note?.trim() || null,
        ...(input.category_ids?.length
          ? {
              categories: {
                connect: input.category_ids.map((id) => ({ id })),
              },
            }
          : {}),
      },
      include: productListInclude,
    });
    await this.afterWrite(row.id);
    return toProduct(row);
  }

  async update(id: number, input: AdminProductUpdateInput): Promise<Product> {
    assertMoney(input.price, "Price");
    assertMoney(input.compare_at_price, "Compare-at price");
    assertMeasurements(input);
    const current = await this.prisma.product.findUnique({
      where: { id },
      select: { image_urls: true, is_second: true, flaw_note: true },
    });
    if (!current) {
      throw new NotFoundException("Product not found");
    }
    assertSecond(
      input.is_second ?? current.is_second,
      input.flaw_note === undefined ? current.flaw_note : input.flaw_note,
    );
    await this.assertLinks(
      input.category_ids,
      input.collection_id,
      input.glaze_id,
    );
    const image_urls = input.image_urls
      ? cleanList(input.image_urls)
      : undefined;
    if (image_urls) {
      await this.uploads.assertConfirmed(
        image_urls,
        current.image_urls,
        UploadPurpose.PRODUCT,
      );
    }

    const row = await this.prisma.product.update({
      where: { id },
      data: {
        ...(input.name == null ? {} : { name: input.name.trim() }),
        ...(input.description == null
          ? {}
          : { description: input.description.trim() }),
        ...(input.price == null ? {} : { price: input.price }),
        ...(input.compare_at_price === undefined
          ? {}
          : { compare_at_price: input.compare_at_price }),
        ...(input.material == null ? {} : { material: input.material.trim() }),
        ...(input.color_name === undefined
          ? {}
          : { color_name: input.color_name?.trim() || null }),
        ...(input.color_code === undefined
          ? {}
          : { color_code: input.color_code?.trim() || null }),
        ...(input.dimensions === undefined
          ? {}
          : { dimensions: input.dimensions?.trim() || null }),
        ...(input.care_notes
          ? { care_notes: cleanList(input.care_notes) }
          : {}),
        ...(image_urls ? { image_urls } : {}),
        ...(input.is_customizable == null
          ? {}
          : { is_customizable: input.is_customizable }),
        ...(input.collection_id === undefined
          ? {}
          : { collection_id: input.collection_id }),
        ...(input.glaze_id === undefined ? {} : { glaze_id: input.glaze_id }),
        ...(input.capacity_ml === undefined
          ? {}
          : { capacity_ml: input.capacity_ml }),
        ...(input.height_cm === undefined
          ? {}
          : { height_cm: input.height_cm }),
        ...(input.diameter_cm === undefined
          ? {}
          : { diameter_cm: input.diameter_cm }),
        ...(input.weight_g === undefined ? {} : { weight_g: input.weight_g }),
        ...(input.maker_note === undefined
          ? {}
          : { maker_note: input.maker_note?.trim() || null }),
        ...(input.is_second == null ? {} : { is_second: input.is_second }),
        ...(input.flaw_note === undefined
          ? {}
          : { flaw_note: input.flaw_note?.trim() || null }),
        ...(input.is_commission == null
          ? {}
          : { is_commission: input.is_commission }),
        ...(input.category_ids
          ? {
              categories: {
                set: input.category_ids.map((cid) => ({ id: cid })),
              },
            }
          : {}),
      },
      include: productListInclude,
    });
    await this.afterWrite(id);
    return toProduct(row);
  }

  async setActive(id: number, isActive: boolean): Promise<Product> {
    const row = await this.prisma.product
      .update({
        where: { id },
        data: { is_active: isActive },
        include: productListInclude,
      })
      .catch(rethrowMissing("Product not found"));
    await this.afterWrite(id);
    return toProduct(row);
  }

  async setFeatured(id: number, isFeatured: boolean): Promise<Product> {
    const row = await this.prisma.product
      .update({
        where: { id },
        data: { is_featured: isFeatured },
        include: productListInclude,
      })
      .catch(rethrowMissing("Product not found"));
    await this.products.invalidateCatalogCache();
    return toProduct(row);
  }

  // The delta is applied conditionally so two admins counting the same shelf cannot drive stock negative.
  async adjustStock(
    id: number,
    delta: number,
    reason: string,
  ): Promise<Product> {
    if (!Number.isInteger(delta) || delta === 0) {
      throw new BadRequestException("Enter how many pieces to add or remove");
    }
    const note = reason.trim();
    if (note.length < 3) {
      throw new BadRequestException("Say why the count changed");
    }
    // Returning the new count makes the edge exact: the row the increment actually landed on.
    const moved = await this.prisma.product.updateManyAndReturn({
      where: { id, ...(delta < 0 ? { stock: { gte: -delta } } : {}) },
      data: { stock: { increment: delta } },
      select: { stock: true },
    });
    const after = moved[0]?.stock;
    if (after === undefined) {
      throw new BadRequestException(
        "There are not that many pieces on the shelf",
      );
    }
    this.logger.info("stock adjusted", { product_id: id, delta, reason: note });
    if (cameBackInStock(after - delta, after)) {
      await this.notifications.announceRestock(id);
    }
    await this.afterWrite(id);
    return this.byId(id);
  }

  async reorderImages(id: number, imageUrls: string[]): Promise<Product> {
    const current = await this.prisma.product.findUnique({
      where: { id },
      select: { image_urls: true },
    });
    if (!current) {
      throw new NotFoundException("Product not found");
    }
    const next = cleanList(imageUrls);
    const sameSet =
      next.length === current.image_urls.length &&
      next.every((url) => current.image_urls.includes(url));
    if (!sameSet) {
      throw new BadRequestException(
        "Reordering keeps the same photos; add or remove them with the edit form",
      );
    }
    const row = await this.prisma.product.update({
      where: { id },
      data: { image_urls: next },
      include: productListInclude,
    });
    return toProduct(row);
  }

  optionGroups(productId: number): Promise<ProductOptionGroup[]> {
    return this.prisma.productOptionGroup.findMany({
      where: { product_id: productId },
      orderBy: { sort_order: "asc" },
      include: { options: { orderBy: { sort_order: "asc" } } },
    });
  }

  async createOptionGroup(
    productId: number,
    input: AdminOptionGroupInput,
  ): Promise<ProductOptionGroup> {
    assertMoney(input.price_modifier, "Price modifier");
    const kind = input.kind ?? OptionGroupKind.CHOICE;
    return this.prisma.productOptionGroup
      .create({
        data: {
          product_id: productId,
          name: input.name.trim(),
          kind,
          is_required: input.is_required ?? true,
          price_modifier: input.price_modifier ?? 0,
          max_length: this.maxLengthFor(kind, input.max_length),
          sort_order: input.sort_order ?? 0,
        },
        include: { options: { orderBy: { sort_order: "asc" } } },
      })
      .catch(rethrowMissing("Product not found"));
  }

  async updateOptionGroup(
    id: number,
    input: AdminOptionGroupInput,
  ): Promise<ProductOptionGroup> {
    assertMoney(input.price_modifier, "Price modifier");
    const current = await this.prisma.productOptionGroup.findUnique({
      where: { id },
      select: { kind: true },
    });
    if (!current) {
      throw new NotFoundException("Option group not found");
    }
    const kind = input.kind ?? current.kind;
    return this.prisma.productOptionGroup.update({
      where: { id },
      data: {
        name: input.name.trim(),
        kind,
        is_required: input.is_required ?? undefined,
        price_modifier: input.price_modifier ?? undefined,
        max_length: this.maxLengthFor(kind, input.max_length),
        sort_order: input.sort_order ?? undefined,
      },
      include: { options: { orderBy: { sort_order: "asc" } } },
    });
  }

  async deleteOptionGroup(id: number): Promise<boolean> {
    await this.prisma.productOptionGroup
      .delete({ where: { id } })
      .catch(rethrowMissing("Option group not found"));
    return true;
  }

  async createOption(
    groupId: number,
    input: AdminOptionInput,
  ): Promise<ProductOptionGroup> {
    assertMoney(input.price_modifier, "Price modifier");
    const group = await this.prisma.productOptionGroup.findUnique({
      where: { id: groupId },
      select: { id: true, kind: true },
    });
    if (!group) {
      throw new NotFoundException("Option group not found");
    }
    if (group.kind === OptionGroupKind.TEXT) {
      throw new BadRequestException(
        "A free-text group prices the entry itself and holds no options",
      );
    }
    await this.prisma.productOption.create({
      data: {
        group_id: groupId,
        name: input.name.trim(),
        price_modifier: input.price_modifier ?? 0,
        sort_order: input.sort_order ?? 0,
        is_active: input.is_active ?? true,
      },
    });
    return this.groupById(groupId);
  }

  async updateOption(
    id: number,
    input: AdminOptionInput,
  ): Promise<ProductOptionGroup> {
    assertMoney(input.price_modifier, "Price modifier");
    const option = await this.prisma.productOption
      .update({
        where: { id },
        data: {
          name: input.name.trim(),
          price_modifier: input.price_modifier ?? undefined,
          sort_order: input.sort_order ?? undefined,
          is_active: input.is_active ?? undefined,
        },
        select: { group_id: true },
      })
      .catch(rethrowMissing("Option not found"));
    return this.groupById(option.group_id);
  }

  async deleteOption(id: number): Promise<boolean> {
    await this.prisma.productOption
      .delete({ where: { id } })
      .catch(rethrowMissing("Option not found"));
    return true;
  }

  private maxLengthFor(
    kind: OptionGroupKind,
    value: number | null | undefined,
  ): number | null {
    if (kind !== OptionGroupKind.TEXT) return null;
    const length = value ?? 40;
    if (!Number.isInteger(length) || length < 1 || length > 200) {
      throw new BadRequestException(
        "A free-text group allows between 1 and 200 characters",
      );
    }
    return length;
  }

  private async groupById(id: number): Promise<ProductOptionGroup> {
    return this.prisma.productOptionGroup.findUniqueOrThrow({
      where: { id },
      include: { options: { orderBy: { sort_order: "asc" } } },
    });
  }

  // Checked before the write so a stale picker answers "that category is gone" instead of
  // a foreign key error from the database.
  private async assertLinks(
    categoryIds: number[] | null | undefined,
    collectionId: number | null | undefined,
    glazeId: number | null | undefined,
  ): Promise<void> {
    const wanted = new Set(categoryIds ?? []);
    if (wanted.size > 0) {
      const found = await this.prisma.category.count({
        where: { id: { in: [...wanted] } },
      });
      if (found !== wanted.size) {
        throw new BadRequestException(
          "One of those categories no longer exists",
        );
      }
    }
    if (collectionId != null) {
      const found = await this.prisma.collection.count({
        where: { id: collectionId },
      });
      if (found === 0) {
        throw new BadRequestException("That collection no longer exists");
      }
    }
    if (glazeId != null) {
      const found = await this.prisma.glaze.count({ where: { id: glazeId } });
      if (found === 0) {
        throw new BadRequestException("That glaze no longer exists");
      }
    }
  }

  private async freeSlug(name: string): Promise<string> {
    const base = slugify(name);
    const siblings = await this.prisma.product.findMany({
      where: { slug: { startsWith: base } },
      select: { slug: true },
    });
    return uniqueSlug(base, new Set(siblings.map((row) => row.slug)));
  }

  // Catalogue counts are cached and the search index is rebuilt off the queue.
  private async afterWrite(productId: number): Promise<void> {
    await this.products.invalidateCatalogCache();
    await this.search.requestProductIndex(productId);
  }
}
