import { NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { Prisma } from "@prisma/client";
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

  it("sets the asked-for state instead of flipping when a stale tab names it", async () => {
    prismaMock.product.findUnique.mockResolvedValue({ id: 1 });
    prismaMock.wishlistItem.count.mockResolvedValue(1);

    // Already saved elsewhere: asking to save keeps it saved and never deletes.
    await expect(service.toggle(1, 1, true)).resolves.toMatchObject({
      is_wishlisted: true,
    });
    expect(prismaMock.wishlistItem.deleteMany).not.toHaveBeenCalled();

    // Already removed elsewhere: asking to remove stays removed and never re-adds.
    prismaMock.wishlistItem.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.wishlistItem.createMany.mockClear();
    await expect(service.toggle(1, 1, false)).resolves.toMatchObject({
      is_wishlisted: false,
    });
    expect(prismaMock.wishlistItem.createMany).not.toHaveBeenCalled();
  });

  it("rejects unknown products", async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);
    await expect(service.toggle(1, 99)).rejects.toThrow("Product not found");
  });

  it("answers not found when the piece goes while the toggle writes", async () => {
    prismaMock.product.findUnique.mockResolvedValue({ id: 1 });
    prismaMock.wishlistItem.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.wishlistItem.createMany.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("fk violated", {
        code: "P2003",
        clientVersion: "7.9.1",
      }),
    );

    await expect(service.toggle(1, 1)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("keeps archived pieces on the list", async () => {
    prismaMock.wishlistItem.findMany.mockResolvedValue([{ product_id: 3 }]);

    await expect(service.ids(1)).resolves.toEqual([3]);
    expect(prismaMock.wishlistItem.findMany).toHaveBeenCalledWith(
      containing({ where: { user_id: 1 } }),
    );
  });
});
