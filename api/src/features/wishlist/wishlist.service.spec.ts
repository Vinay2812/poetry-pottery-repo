import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "@/prisma/prisma.service";
import { WishlistService } from "./wishlist.service";

const containing = (value: Record<string, unknown>): unknown =>
  expect.objectContaining(value);

const prismaMock = {
  withTransaction: vi.fn((fn: () => Promise<unknown>) => fn()),
  wishlistItem: {
    findMany: vi.fn(),
    deleteMany: vi.fn(),
    createMany: vi.fn(),
    count: vi.fn(),
  },
  product: { findUnique: vi.fn() },
};

describe("WishlistService", () => {
  let service: WishlistService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        WishlistService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = moduleRef.get(WishlistService);
  });

  it("adds when absent and removes when present", async () => {
    prismaMock.product.findUnique.mockResolvedValue({ id: 1 });
    prismaMock.wishlistItem.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.wishlistItem.count.mockResolvedValue(1);

    await expect(service.toggle(1, 1)).resolves.toEqual({
      product_id: 1,
      is_wishlisted: true,
      wishlist_count: 1,
    });
    expect(prismaMock.wishlistItem.createMany).toHaveBeenCalledWith({
      data: { user_id: 1, product_id: 1 },
      skipDuplicates: true,
    });

    prismaMock.wishlistItem.deleteMany.mockResolvedValue({ count: 1 });
    prismaMock.wishlistItem.count.mockResolvedValue(0);
    await expect(service.toggle(1, 1)).resolves.toMatchObject({
      is_wishlisted: false,
      wishlist_count: 0,
    });
  });

  it("rejects unknown products", async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);
    await expect(service.toggle(1, 99)).rejects.toThrow("Product not found");
  });

  it("only lists pieces that can still be bought", async () => {
    prismaMock.wishlistItem.findMany.mockResolvedValue([{ product_id: 3 }]);

    await expect(service.ids(1)).resolves.toEqual([3]);
    expect(prismaMock.wishlistItem.findMany).toHaveBeenCalledWith(
      containing({
        where: containing({
          user_id: 1,
          product: containing({ is_active: true }),
        }),
      }),
    );
  });
});
