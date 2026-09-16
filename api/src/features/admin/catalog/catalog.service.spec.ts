import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "@/prisma/prisma.service";
import { ProductsService } from "@/features/products/products.service";
import { missingRow } from "@test/helpers/prisma-errors";
import { UploadsService } from "../uploads/uploads.service";
import { AdminCatalogService, assertWindow } from "./catalog.service";
import { UploadPurpose } from "../uploads/uploads.type";

const containing = (value: Record<string, unknown>): unknown =>
  expect.objectContaining(value);

const prismaMock = {
  category: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  collection: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};
const productsMock = { invalidateCatalogCache: vi.fn() };
const uploadsMock = { assertConfirmed: vi.fn() };

describe("assertWindow", () => {
  it("accepts an open-ended window", () => {
    expect(() => assertWindow(null, null)).not.toThrow();
    expect(() => assertWindow(new Date("2026-01-01"), null)).not.toThrow();
  });

  it("refuses a window that closes before it opens", () => {
    expect(() =>
      assertWindow(new Date("2026-02-01"), new Date("2026-01-01")),
    ).toThrow(BadRequestException);
  });
});

describe("AdminCatalogService", () => {
  let service: AdminCatalogService;

  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock.category.findMany.mockResolvedValue([]);
    prismaMock.collection.findMany.mockResolvedValue([]);
    prismaMock.category.create.mockResolvedValue({ id: 1, slug: "mugs" });
    prismaMock.collection.create.mockResolvedValue({ id: 1, slug: "monsoon" });
    prismaMock.category.delete.mockResolvedValue({ id: 1 });
    prismaMock.collection.delete.mockResolvedValue({ id: 1 });
    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminCatalogService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ProductsService, useValue: productsMock },
        { provide: UploadsService, useValue: uploadsMock },
      ],
    }).compile();
    service = moduleRef.get(AdminCatalogService);
  });

  it("lists every category, empty ones included", async () => {
    prismaMock.category.findMany.mockResolvedValue([
      { id: 1, slug: "mugs", name: "Mugs", _count: { products: 0 } },
    ]);

    await expect(service.categories()).resolves.toEqual([
      containing({ slug: "mugs", product_count: 0 }),
    ]);
  });

  it("slugifies a new category and clears the cache", async () => {
    await service.createCategory({ name: "Serving dishes" });

    expect(prismaMock.category.create).toHaveBeenCalledWith({
      data: containing({ slug: "serving-dishes" }),
    });
    expect(productsMock.invalidateCatalogCache).toHaveBeenCalled();
  });

  it("checks a category image against the category spec", async () => {
    await service.createCategory({
      name: "Mugs",
      image_url: "https://cdn.example.com/categories/a.png",
    });

    expect(uploadsMock.assertConfirmed).toHaveBeenCalledWith(
      ["https://cdn.example.com/categories/a.png"],
      [],
      UploadPurpose.CATEGORY,
    );
  });

  it("reports a missing category on update", async () => {
    prismaMock.category.findUnique.mockResolvedValue(null);

    await expect(
      service.updateCategory(9, { name: "Mugs" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("stores the collection window", async () => {
    const starts_at = new Date("2026-06-01");
    const ends_at = new Date("2026-08-31");

    await service.createCollection({ name: "Monsoon", starts_at, ends_at });

    expect(prismaMock.collection.create).toHaveBeenCalledWith({
      data: containing({ starts_at, ends_at }),
    });
  });

  it("refuses a backwards collection window", async () => {
    await expect(
      service.createCollection({
        name: "Monsoon",
        starts_at: new Date("2026-08-31"),
        ends_at: new Date("2026-06-01"),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("clears the cache after deleting a collection", async () => {
    await expect(service.deleteCollection(1)).resolves.toBe(true);

    expect(productsMock.invalidateCatalogCache).toHaveBeenCalled();
  });

  it("answers not found when another admin deleted the category first", async () => {
    prismaMock.category.delete.mockRejectedValue(missingRow());

    await expect(service.deleteCategory(1)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
