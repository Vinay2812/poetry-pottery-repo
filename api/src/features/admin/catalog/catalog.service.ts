import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "@/prisma/prisma.service";
import { ProductsService } from "@/features/products/products.service";
import type { Category, Collection } from "@/features/products/products.type";
import { rethrowMissing } from "../missing-row";
import { slugify, uniqueSlug } from "../slug";
import { UploadsService } from "@/uploads/uploads.service";
import { UploadPurpose } from "@/uploads/uploads.type";
import type { AdminCategoryInput, AdminCollectionInput } from "./catalog.type";

export function assertWindow(
  starts: Date | null | undefined,
  ends: Date | null | undefined,
): void {
  if (starts && ends && ends <= starts) {
    throw new BadRequestException("A collection must close after it opens");
  }
}

@Injectable()
export class AdminCatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly products: ProductsService,
    private readonly uploads: UploadsService,
  ) {}

  // The console lists everything, including categories with nothing in them yet.
  async categories(): Promise<Category[]> {
    const rows = await this.prisma.category.findMany({
      orderBy: [{ sort_order: "asc" }, { name: "asc" }],
      include: { _count: { select: { products: true } } },
    });
    return rows.map(({ _count, ...category }) => ({
      ...category,
      product_count: _count.products,
    }));
  }

  async collections(): Promise<Collection[]> {
    const rows = await this.prisma.collection.findMany({
      orderBy: [{ created_at: "desc" }],
      include: { _count: { select: { products: true } } },
    });
    return rows.map(({ _count, ...collection }) => ({
      ...collection,
      product_count: _count.products,
    }));
  }

  async createCategory(input: AdminCategoryInput): Promise<Category> {
    const image_url = input.image_url?.trim() || null;
    await this.uploads.claimConfirmed(
      image_url ? [image_url] : [],
      [],
      UploadPurpose.CATEGORY,
    );
    const row = await this.prisma.category.create({
      data: {
        slug: await this.freeCategorySlug(input.name),
        name: input.name.trim(),
        icon: input.icon?.trim() || null,
        image_url,
        sort_order: input.sort_order ?? 0,
      },
    });
    await this.products.invalidateCatalogCache();
    return { ...row, product_count: 0 };
  }

  async updateCategory(
    id: number,
    input: AdminCategoryInput,
  ): Promise<Category> {
    const current = await this.prisma.category.findUnique({
      where: { id },
      select: { image_url: true },
    });
    if (!current) {
      throw new NotFoundException("Category not found");
    }
    const image_url = input.image_url?.trim() || null;
    await this.uploads.claimConfirmed(
      image_url ? [image_url] : [],
      current.image_url ? [current.image_url] : [],
      UploadPurpose.CATEGORY,
    );
    const row = await this.prisma.category.update({
      where: { id },
      data: {
        name: input.name.trim(),
        icon: input.icon?.trim() || null,
        image_url,
        ...(input.sort_order == null ? {} : { sort_order: input.sort_order }),
      },
      include: { _count: { select: { products: true } } },
    });
    await this.products.invalidateCatalogCache();
    const { _count, ...category } = row;
    return { ...category, product_count: _count.products };
  }

  async deleteCategory(id: number): Promise<boolean> {
    await this.prisma.category
      .delete({ where: { id } })
      .catch(rethrowMissing("Category not found"));
    await this.products.invalidateCatalogCache();
    return true;
  }

  async createCollection(input: AdminCollectionInput): Promise<Collection> {
    assertWindow(input.starts_at, input.ends_at);
    const image_url = input.image_url?.trim() || null;
    await this.uploads.claimConfirmed(
      image_url ? [image_url] : [],
      [],
      UploadPurpose.COLLECTION,
    );
    const row = await this.prisma.collection.create({
      data: {
        slug: await this.freeCollectionSlug(input.name),
        name: input.name.trim(),
        description: input.description?.trim() || null,
        image_url,
        starts_at: input.starts_at ?? null,
        ends_at: input.ends_at ?? null,
      },
    });
    await this.products.invalidateCatalogCache();
    return { ...row, product_count: 0 };
  }

  async updateCollection(
    id: number,
    input: AdminCollectionInput,
  ): Promise<Collection> {
    assertWindow(input.starts_at, input.ends_at);
    const current = await this.prisma.collection.findUnique({
      where: { id },
      select: { image_url: true },
    });
    if (!current) {
      throw new NotFoundException("Collection not found");
    }
    const image_url = input.image_url?.trim() || null;
    await this.uploads.claimConfirmed(
      image_url ? [image_url] : [],
      current.image_url ? [current.image_url] : [],
      UploadPurpose.COLLECTION,
    );
    const row = await this.prisma.collection.update({
      where: { id },
      data: {
        name: input.name.trim(),
        description: input.description?.trim() || null,
        image_url,
        starts_at: input.starts_at ?? null,
        ends_at: input.ends_at ?? null,
      },
      include: { _count: { select: { products: true } } },
    });
    await this.products.invalidateCatalogCache();
    const { _count, ...collection } = row;
    return { ...collection, product_count: _count.products };
  }

  async deleteCollection(id: number): Promise<boolean> {
    await this.prisma.collection
      .delete({ where: { id } })
      .catch(rethrowMissing("Collection not found"));
    await this.products.invalidateCatalogCache();
    return true;
  }

  private async freeCategorySlug(name: string): Promise<string> {
    const base = slugify(name);
    const siblings = await this.prisma.category.findMany({
      where: { slug: { startsWith: base } },
      select: { slug: true },
    });
    return uniqueSlug(base, new Set(siblings.map((row) => row.slug)));
  }

  private async freeCollectionSlug(name: string): Promise<string> {
    const base = slugify(name);
    const siblings = await this.prisma.collection.findMany({
      where: { slug: { startsWith: base } },
      select: { slug: true },
    });
    return uniqueSlug(base, new Set(siblings.map((row) => row.slug)));
  }
}
