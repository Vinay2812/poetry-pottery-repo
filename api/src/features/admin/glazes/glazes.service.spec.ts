import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "@/prisma/prisma.service";
import { ProductsService } from "@/features/products/products.service";
import { UploadsService } from "@/uploads/uploads.service";
import { UploadPurpose } from "@/uploads/uploads.type";
import { AdminGlazesService, parseColorCode } from "./glazes.service";

const containing = (value: Record<string, unknown>): unknown =>
  expect.objectContaining(value);

const row = {
  id: 1,
  slug: "kiln-ash",
  name: "Kiln ash",
  description: "A soft grey-green that pools where the wall thickens.",
  variation_note: null,
  swatch_url: null,
  color_code: "#6f7d6b",
  created_at: new Date(),
  updated_at: new Date(),
  _count: { products: 0 },
};

const prismaMock = {
  glaze: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};
const productsMock = { invalidateCatalogCache: vi.fn() };
const uploadsMock = { claimConfirmed: vi.fn() };

function input(overrides: Record<string, unknown> = {}) {
  return {
    name: "Kiln ash",
    description: "A soft grey-green that pools where the wall thickens.",
    ...overrides,
  };
}

describe("parseColorCode", () => {
  it("keeps a six-digit hex and drops a blank", () => {
    expect(parseColorCode("#6F7D6B")).toBe("#6f7d6b");
    expect(parseColorCode("  ")).toBeNull();
    expect(parseColorCode(null)).toBeNull();
  });

  it("refuses anything that is not a hex", () => {
    expect(() => parseColorCode("sage")).toThrow(BadRequestException);
    expect(() => parseColorCode("#fff")).toThrow(BadRequestException);
  });
});

describe("AdminGlazesService", () => {
  let service: AdminGlazesService;

  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock.glaze.findMany.mockResolvedValue([]);
    prismaMock.glaze.count.mockResolvedValue(0);
    prismaMock.glaze.create.mockResolvedValue(row);
    prismaMock.glaze.update.mockResolvedValue(row);
    prismaMock.glaze.findUnique.mockResolvedValue(row);
    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminGlazesService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ProductsService, useValue: productsMock },
        { provide: UploadsService, useValue: uploadsMock },
      ],
    }).compile();
    service = moduleRef.get(AdminGlazesService);
  });

  it("pages the list and counts the pieces wearing each glaze", async () => {
    prismaMock.glaze.findMany.mockResolvedValue([
      { ...row, _count: { products: 4 } },
    ]);
    prismaMock.glaze.count.mockResolvedValue(1);

    const result = await service.list({ page: 1, limit: 20 });

    expect(result.items[0]?.product_count).toBe(4);
    expect(result.items[0]?.glaze.slug).toBe("kiln-ash");
    expect(result.page_info).toEqual({
      total: 1,
      page: 1,
      limit: 20,
      has_more: false,
    });
  });

  it("generates a unique slug from the name", async () => {
    prismaMock.glaze.findMany.mockResolvedValue([{ slug: "kiln-ash" }]);

    await service.create(input());

    expect(prismaMock.glaze.create).toHaveBeenCalledWith(
      containing({ data: containing({ slug: "kiln-ash-2" }) }),
    );
  });

  it("confirms the swatch against the glaze spec", async () => {
    await service.create(
      input({ swatch_url: "https://cdn.example.com/glazes/ash.png" }),
    );

    expect(uploadsMock.claimConfirmed).toHaveBeenCalledWith(
      ["https://cdn.example.com/glazes/ash.png"],
      [],
      UploadPurpose.GLAZE,
    );
  });

  it("refuses a delete while pieces still wear the glaze", async () => {
    prismaMock.glaze.findUnique.mockResolvedValue({
      ...row,
      _count: { products: 3 },
    });

    await expect(service.remove(1)).rejects.toBeInstanceOf(BadRequestException);
    expect(prismaMock.glaze.delete).not.toHaveBeenCalled();
  });

  it("deletes a glaze nothing wears", async () => {
    await expect(service.remove(1)).resolves.toBe(true);
    expect(prismaMock.glaze.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it("answers not found for a glaze someone else removed", async () => {
    prismaMock.glaze.findUnique.mockResolvedValue(null);

    await expect(service.remove(1)).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.update(1, input())).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
