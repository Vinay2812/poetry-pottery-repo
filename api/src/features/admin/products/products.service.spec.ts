import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { OptionGroupKind } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "@/prisma/prisma.service";
import { ProductsService } from "@/features/products/products.service";
import { SearchService } from "@/features/search/search.service";
import { missingRow } from "@test/helpers/prisma-errors";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { NotificationsService } from "@/features/notifications/notifications.service";
import { UploadsService } from "../uploads/uploads.service";
import {
  assertSecond,
  cleanList,
  AdminProductsService,
} from "./products.service";

const containing = (value: Record<string, unknown>): unknown =>
  expect.objectContaining(value);

const row = {
  id: 1,
  slug: "slate-morning-mug",
  name: "Slate morning mug",
  price: 1200,
  stock: 4,
  image_urls: ["https://cdn.example.com/products/one.png"],
  categories: [],
  collection: null,
  height_cm: null,
  diameter_cm: null,
};

const prismaMock = {
  product: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    updateManyAndReturn: vi.fn(),
  },
  productOptionGroup: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  productOption: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  category: { count: vi.fn() },
  collection: { count: vi.fn() },
  glaze: { count: vi.fn() },
};
const productsMock = { invalidateCatalogCache: vi.fn() };
const searchMock = { requestProductIndex: vi.fn() };
const uploadsMock = { assertConfirmed: vi.fn() };
const notificationsMock = { announceRestock: vi.fn() };
const loggerMock = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

function input(overrides: Record<string, unknown> = {}) {
  return {
    name: "Slate morning mug",
    description: "Thrown in stoneware.",
    price: 1200,
    material: "Stoneware",
    stock: 3,
    ...overrides,
  };
}

describe("cleanList", () => {
  it("drops blanks and trims", () => {
    expect(cleanList([" a ", "", "  ", "b"])).toEqual(["a", "b"]);
    expect(cleanList(null)).toEqual([]);
  });
});

describe("assertSecond", () => {
  it("wants the flaw named before a piece is sold as a second", () => {
    expect(() => assertSecond(true, "  ")).toThrow(BadRequestException);
    expect(() => assertSecond(true, "Glaze crawl on the foot")).not.toThrow();
    expect(() => assertSecond(false, null)).not.toThrow();
  });
});

describe("AdminProductsService", () => {
  let service: AdminProductsService;

  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock.product.findMany.mockResolvedValue([]);
    prismaMock.product.create.mockResolvedValue(row);
    prismaMock.product.update.mockResolvedValue(row);
    prismaMock.product.findUnique.mockResolvedValue(row);
    prismaMock.category.count.mockResolvedValue(2);
    prismaMock.collection.count.mockResolvedValue(1);
    prismaMock.glaze.count.mockResolvedValue(1);
    prismaMock.product.updateManyAndReturn.mockResolvedValue([{ stock: 2 }]);
    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminProductsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ProductsService, useValue: productsMock },
        { provide: SearchService, useValue: searchMock },
        { provide: UploadsService, useValue: uploadsMock },
        { provide: NotificationsService, useValue: notificationsMock },
        { provide: WINSTON_MODULE_PROVIDER, useValue: loggerMock },
      ],
    }).compile();
    service = moduleRef.get(AdminProductsService);
  });

  it("lists inactive pieces too and paginates", async () => {
    prismaMock.product.findMany.mockResolvedValue([row]);
    prismaMock.product.count.mockResolvedValue(1);

    const result = await service.list({ page: 1, limit: 20 });

    expect(result.page_info).toEqual({
      total: 1,
      page: 1,
      limit: 20,
      has_more: false,
    });
    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      containing({ where: {} }),
    );
  });

  it("searches name, slug and material", async () => {
    prismaMock.product.count.mockResolvedValue(0);

    await service.list({ search: " mug " });

    const call = prismaMock.product.findMany.mock.calls[0]?.[0] as {
      where: { OR: unknown[] };
    };
    expect(call.where.OR).toHaveLength(3);
  });

  it("generates a unique slug from the name", async () => {
    prismaMock.product.findMany.mockResolvedValue([
      { slug: "slate-morning-mug" },
    ]);

    await service.create(input());

    expect(prismaMock.product.create).toHaveBeenCalledWith(
      containing({
        data: containing({ slug: "slate-morning-mug-2" }),
      }),
    );
  });

  it("rejects a negative price and negative stock", async () => {
    await expect(service.create(input({ price: -1 }))).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.create(input({ stock: -3 }))).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("checks image urls were confirmed before saving", async () => {
    await service.create(
      input({ image_urls: ["https://cdn.example.com/products/one.png"] }),
    );

    expect(uploadsMock.assertConfirmed).toHaveBeenCalledWith(
      ["https://cdn.example.com/products/one.png"],
      [],
      "PRODUCT",
    );
  });

  it("enqueues a reindex and clears the catalogue cache after a write", async () => {
    await service.create(input());

    expect(productsMock.invalidateCatalogCache).toHaveBeenCalled();
    expect(searchMock.requestProductIndex).toHaveBeenCalledWith(1);
  });

  it("never writes an absolute stock count from the edit form", async () => {
    await service.update(1, { name: "Slate mug" });

    const call = prismaMock.product.update.mock.calls[0]?.[0] as {
      data: Record<string, unknown>;
    };
    expect(call.data).not.toHaveProperty("stock");
  });

  it("replaces the category set on update", async () => {
    await service.update(1, { category_ids: [2, 3] });

    expect(prismaMock.product.update).toHaveBeenCalledWith(
      containing({
        data: containing({
          categories: { set: [{ id: 2 }, { id: 3 }] },
        }),
      }),
    );
  });

  it("toggles the archive flag", async () => {
    await service.setActive(1, false);

    expect(prismaMock.product.update).toHaveBeenCalledWith(
      containing({ data: { is_active: false } }),
    );
  });

  it("refuses to put an empty batch on the shelf", async () => {
    await expect(
      service.create(input({ stock: 0, is_customizable: false })),
    ).rejects.toBeInstanceOf(BadRequestException);

    prismaMock.product.findUnique.mockResolvedValue({
      stock: 0,
      is_customizable: false,
    });
    await expect(service.setActive(1, true)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prismaMock.product.update).not.toHaveBeenCalled();
  });

  it("lets a made-to-order piece go live with nothing in stock", async () => {
    await service.create(input({ stock: 0, is_customizable: true }));

    prismaMock.product.findUnique.mockResolvedValue({
      stock: 0,
      is_customizable: true,
    });
    await service.setActive(1, true);

    expect(prismaMock.product.create).toHaveBeenCalled();
    expect(prismaMock.product.update).toHaveBeenCalledWith(
      containing({ data: { is_active: true } }),
    );
  });

  it("keeps a live piece editable after it sells out", async () => {
    prismaMock.product.findUnique.mockResolvedValue({
      stock: 0,
      is_customizable: false,
      image_urls: [],
      is_second: false,
      flaw_note: null,
    });

    await service.update(1, { name: "Slate mug" });

    expect(prismaMock.product.update).toHaveBeenCalled();
  });

  it("adjusts stock conditionally and logs the reason", async () => {
    prismaMock.product.updateManyAndReturn.mockResolvedValue([{ stock: 2 }]);

    await service.adjustStock(1, -2, "Two broke in the kiln");

    expect(prismaMock.product.updateManyAndReturn).toHaveBeenCalledWith(
      containing({
        where: { id: 1, stock: { gte: 2 } },
        data: { stock: { increment: -2 } },
      }),
    );
    expect(loggerMock.info).toHaveBeenCalledWith(
      "stock adjusted",
      containing({ reason: "Two broke in the kiln" }),
    );
  });

  it("refuses a stock adjustment that would go negative", async () => {
    prismaMock.product.updateManyAndReturn.mockResolvedValue([]);

    await expect(
      service.adjustStock(1, -9, "Counted the shelf"),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("announces a restock only when the shelf was empty before the top-up", async () => {
    prismaMock.product.updateManyAndReturn.mockResolvedValue([{ stock: 3 }]);
    await service.adjustStock(1, 3, "Out of the kiln");
    expect(notificationsMock.announceRestock).toHaveBeenCalledWith(1);

    notificationsMock.announceRestock.mockClear();
    prismaMock.product.updateManyAndReturn.mockResolvedValue([{ stock: 5 }]);
    await service.adjustStock(1, 3, "Topping up a shelf that was not empty");
    expect(notificationsMock.announceRestock).not.toHaveBeenCalled();

    prismaMock.product.updateManyAndReturn.mockResolvedValue([{ stock: 1 }]);
    await service.adjustStock(1, -2, "Two sold at the market");
    expect(notificationsMock.announceRestock).not.toHaveBeenCalled();
  });

  it("demands a reason for a stock adjustment", async () => {
    await expect(service.adjustStock(1, -1, " ")).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("saves the measurements, the maker's note and the glaze", async () => {
    await service.create(
      input({
        capacity_ml: 300,
        height_cm: 9.5,
        diameter_cm: 8,
        weight_g: 420,
        maker_note: "  Thrown on a wet Tuesday  ",
        glaze_id: 3,
        is_commission: true,
      }),
    );

    expect(prismaMock.product.create).toHaveBeenCalledWith(
      containing({
        data: containing({
          capacity_ml: 300,
          height_cm: 9.5,
          diameter_cm: 8,
          weight_g: 420,
          maker_note: "Thrown on a wet Tuesday",
          glaze_id: 3,
          is_commission: true,
        }),
      }),
    );
  });

  it("refuses a measurement that is zero or absurd", async () => {
    await expect(
      service.create(input({ height_cm: 0 })),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.create(input({ capacity_ml: 99_999 })),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("refuses a glaze that no longer exists", async () => {
    prismaMock.glaze.count.mockResolvedValue(0);

    await expect(service.create(input({ glaze_id: 9 }))).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("keeps the stored flaw note when only the second flag is edited", async () => {
    prismaMock.product.findUnique.mockResolvedValue({
      ...row,
      is_second: false,
      flaw_note: "Glaze crawl on the foot",
    });

    await service.update(1, { is_second: true });

    expect(prismaMock.product.update).toHaveBeenCalledWith(
      containing({ data: containing({ is_second: true }) }),
    );
  });

  it("only reorders the photos already on the piece", async () => {
    await expect(
      service.reorderImages(1, ["https://cdn.example.com/products/two.png"]),
    ).rejects.toBeInstanceOf(BadRequestException);

    await service.reorderImages(1, [
      "https://cdn.example.com/products/one.png",
    ]);
    expect(prismaMock.product.update).toHaveBeenCalled();
  });

  it("caps free-text option groups and clears max_length for choices", async () => {
    prismaMock.productOptionGroup.create.mockResolvedValue({ id: 5 });

    await service.createOptionGroup(1, {
      name: "Carved name",
      kind: OptionGroupKind.TEXT,
      max_length: 24,
    });
    expect(prismaMock.productOptionGroup.create).toHaveBeenCalledWith(
      containing({
        data: containing({ max_length: 24 }),
      }),
    );

    await service.createOptionGroup(1, {
      name: "Glaze",
      kind: OptionGroupKind.CHOICE,
      max_length: 24,
    });
    expect(prismaMock.productOptionGroup.create).toHaveBeenLastCalledWith(
      containing({
        data: containing({ max_length: null }),
      }),
    );
  });

  it("refuses options on a free-text group", async () => {
    prismaMock.productOptionGroup.findUnique.mockResolvedValue({
      id: 5,
      kind: OptionGroupKind.TEXT,
    });

    await expect(
      service.createOption(5, { name: "Sage" }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("adds an option to a choice group and returns the group", async () => {
    prismaMock.productOptionGroup.findUnique.mockResolvedValue({
      id: 5,
      kind: OptionGroupKind.CHOICE,
    });
    prismaMock.productOptionGroup.findUniqueOrThrow.mockResolvedValue({
      id: 5,
      options: [],
    });

    await expect(
      service.createOption(5, { name: "Sage", price_modifier: 100 }),
    ).resolves.toMatchObject({ id: 5 });
  });

  it("reports a missing piece", async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);

    await expect(service.byId(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it("refuses a category or collection that no longer exists", async () => {
    prismaMock.category.count.mockResolvedValue(1);

    await expect(service.update(1, { category_ids: [2, 3] })).rejects.toThrow(
      /categories no longer exists/,
    );

    prismaMock.category.count.mockResolvedValue(2);
    prismaMock.collection.count.mockResolvedValue(0);
    await expect(service.update(1, { collection_id: 4 })).rejects.toThrow(
      /collection no longer exists/,
    );
  });

  it("answers not found when the piece was archived out from under the toggle", async () => {
    prismaMock.product.update.mockRejectedValue(missingRow());

    await expect(service.setActive(1, false)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("answers not found when an option group is added to a piece that is gone", async () => {
    prismaMock.productOptionGroup.create.mockRejectedValue(missingRow("P2003"));

    await expect(
      service.createOptionGroup(99, { name: "Glaze" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
