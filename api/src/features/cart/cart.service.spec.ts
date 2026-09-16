import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "@/prisma/prisma.service";
import { SettingsService } from "@/features/settings/settings.service";
import { StorageService } from "@/storage/storage.service";
import {
  CartService,
  MAX_LINE_QUANTITY,
  shippingFor,
  toCartItem,
} from "./cart.service";

const containing = (value: Record<string, unknown>): unknown =>
  expect.objectContaining(value);

const prismaMock = {
  withTransaction: vi.fn((fn: () => Promise<unknown>) => fn()),
  $executeRaw: vi.fn().mockResolvedValue(1),
  cartItem: {
    aggregate: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  product: { findFirst: vi.fn() },
};

const storageMock = {
  isOwnUrl: vi.fn((url: string) => url.startsWith("https://cdn.test/")),
};

const settingsMock = {
  get: vi
    .fn()
    .mockResolvedValue({ shipping_flat_fee: 150, free_shipping_above: 2500 }),
};

function productRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    price: 850,
    stock: 3,
    is_active: true,
    is_customizable: false,
    collection: null,
    categories: [],
    option_groups: [],
    ...overrides,
  };
}

describe("shippingFor", () => {
  it("charges the flat fee below the threshold and nothing above or on an empty cart", () => {
    expect(shippingFor(0, 150, 2500)).toBe(0);
    expect(shippingFor(1000, 150, 2500)).toBe(150);
    expect(shippingFor(2500, 150, 2500)).toBe(0);
    expect(shippingFor(1000, 150, null)).toBe(150);
  });
});

describe("toCartItem", () => {
  it("prices lines from the product plus selection modifiers", () => {
    const item = toCartItem({
      id: 7,
      user_id: 1,
      product_id: 1,
      quantity: 2,
      selections: [
        {
          group_id: 1,
          group_name: "Size",
          option_id: 2,
          option_name: "Large",
          text: null,
          price_modifier: 150,
        },
      ],
      selection_key: "abc",
      created_at: new Date(),
      updated_at: new Date(),
      product: productRow({ is_customizable: true }) as never,
    });
    expect(item.unit_price).toBe(1000);
    expect(item.line_total).toBe(2000);
    expect(item.is_available).toBe(true);
  });

  it("flags sold out and short stock lines", () => {
    const base = {
      id: 7,
      user_id: 1,
      product_id: 1,
      quantity: 5,
      selections: null,
      selection_key: "",
      created_at: new Date(),
      updated_at: new Date(),
    };
    expect(
      toCartItem({ ...base, product: productRow({ stock: 0 }) as never })
        .unavailable_reason,
    ).toBe("Sold out");
    expect(
      toCartItem({ ...base, product: productRow({ stock: 3 }) as never })
        .unavailable_reason,
    ).toBe("Only 3 left");
    expect(
      toCartItem({
        ...base,
        product: productRow({ is_active: false }) as never,
      }).unavailable_reason,
    ).toBe("No longer available");
  });

  it("holds back a line whose collection window has not opened or has closed", () => {
    const now = new Date("2026-06-01T00:00:00Z");
    const base = {
      id: 7,
      user_id: 1,
      product_id: 1,
      quantity: 1,
      selections: null,
      selection_key: "",
      created_at: new Date(),
      updated_at: new Date(),
    };
    expect(
      toCartItem(
        {
          ...base,
          product: productRow({
            collection: {
              starts_at: new Date("2026-07-01T00:00:00Z"),
              ends_at: null,
            },
          }) as never,
        },
        now,
      ).unavailable_reason,
    ).toBe("This collection has not opened yet");
    expect(
      toCartItem(
        {
          ...base,
          product: productRow({
            collection: {
              starts_at: new Date("2026-01-01T00:00:00Z"),
              ends_at: new Date("2026-05-01T00:00:00Z"),
            },
          }) as never,
        },
        now,
      ).unavailable_reason,
    ).toBe("This collection has ended");
    expect(
      toCartItem(
        {
          ...base,
          product: productRow({
            collection: {
              starts_at: new Date("2026-01-01T00:00:00Z"),
              ends_at: new Date("2026-12-01T00:00:00Z"),
            },
          }) as never,
        },
        now,
      ).is_available,
    ).toBe(true);
  });
});

describe("CartService", () => {
  let service: CartService;

  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock.cartItem.findMany.mockResolvedValue([]);
    const moduleRef = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: SettingsService, useValue: settingsMock },
        { provide: StorageService, useValue: storageMock },
      ],
    }).compile();
    service = moduleRef.get(CartService);
  });

  it("counts the pieces without building the cart", async () => {
    prismaMock.cartItem.aggregate.mockResolvedValue({ _sum: { quantity: 4 } });
    await expect(service.count(1)).resolves.toBe(4);

    prismaMock.cartItem.aggregate.mockResolvedValue({
      _sum: { quantity: null },
    });
    await expect(service.count(1)).resolves.toBe(0);
    expect(prismaMock.cartItem.findMany).not.toHaveBeenCalled();
  });

  it("merges into an existing line and caps at the stock", async () => {
    prismaMock.product.findFirst.mockResolvedValue(productRow({ stock: 3 }));
    prismaMock.cartItem.findUnique.mockResolvedValue({ quantity: 2 });

    await expect(
      service.add(1, { product_id: 1, quantity: 2 }),
    ).rejects.toThrow("Only 3 left");

    prismaMock.cartItem.findUnique.mockResolvedValue({ quantity: 1 });
    await service.add(1, { product_id: 1, quantity: 2 });
    expect(prismaMock.cartItem.upsert).toHaveBeenCalledWith(
      containing({
        update: { quantity: 3 },
        create: containing({ quantity: 3, selection_key: "" }),
      }),
    );
    expect(prismaMock.$executeRaw).toHaveBeenCalled();
  });

  it("stores reference photos on a custom line and rejects foreign URLs", async () => {
    prismaMock.product.findFirst.mockResolvedValue(
      productRow({ is_customizable: true }),
    );
    prismaMock.cartItem.findUnique.mockResolvedValue(null);

    await service.add(1, {
      product_id: 1,
      quantity: 1,
      reference_image_urls: ["https://cdn.test/customization/1/a.jpg"],
    });
    expect(prismaMock.cartItem.upsert).toHaveBeenCalledWith(
      containing({
        create: containing({
          selections: {
            options: [],
            reference_image_urls: ["https://cdn.test/customization/1/a.jpg"],
          },
        }),
      }),
    );

    await expect(
      service.add(1, {
        product_id: 1,
        quantity: 1,
        reference_image_urls: ["https://evil.test/a.jpg"],
      }),
    ).rejects.toThrow("was not uploaded");
  });

  it("rejects quantities outside the allowed range", async () => {
    await expect(
      service.add(1, { product_id: 1, quantity: 0 }),
    ).rejects.toThrow("between 1 and");
    await expect(
      service.add(1, { product_id: 1, quantity: MAX_LINE_QUANTITY + 1 }),
    ).rejects.toThrow("between 1 and");
    expect(prismaMock.product.findFirst).not.toHaveBeenCalled();
  });

  it("removes a line when the quantity drops to zero", async () => {
    prismaMock.cartItem.findFirst.mockResolvedValue({
      id: 9,
      product: { stock: 5, is_customizable: false },
    });

    await service.updateQuantity(1, 9, 0);

    expect(prismaMock.cartItem.delete).toHaveBeenCalledWith({
      where: { id: 9 },
    });
  });

  it("totals only available lines and applies free shipping", async () => {
    prismaMock.cartItem.findMany.mockResolvedValue([
      {
        id: 1,
        user_id: 1,
        product_id: 1,
        quantity: 3,
        selections: null,
        selection_key: "",
        created_at: new Date(),
        updated_at: new Date(),
        product: productRow({ price: 1000, stock: 5 }),
      },
      {
        id: 2,
        user_id: 1,
        product_id: 2,
        quantity: 1,
        selections: null,
        selection_key: "",
        created_at: new Date(),
        updated_at: new Date(),
        product: productRow({ id: 2, price: 500, stock: 0 }),
      },
    ]);

    const cart = await service.get(1);

    expect(cart.item_count).toBe(4);
    expect(cart.subtotal).toBe(3000);
    expect(cart.shipping_fee).toBe(0);
    expect(cart.total).toBe(3000);
    expect(cart.items[1]?.is_available).toBe(false);
  });
});
