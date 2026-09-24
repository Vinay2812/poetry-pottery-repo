import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "@/prisma/prisma.service";
import { QueueService } from "@/queue/queue.service";
import { ShelfService } from "./shelf.service";

const containing = (value: Record<string, unknown>): unknown =>
  expect.objectContaining(value);

const prismaMock = {
  withTransaction: vi.fn((fn: () => Promise<unknown>) => fn()),
  product: {
    update: vi.fn(),
    updateMany: vi.fn(),
    updateManyAndReturn: vi.fn(),
  },
};
const queueMock = { publish: vi.fn() };

const mug = { id: 10, is_customizable: false };
const listed = { id: 10, is_active: true, is_customizable: false };

describe("ShelfService", () => {
  let service: ShelfService;

  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock.product.updateMany.mockResolvedValue({ count: 1 });
    const moduleRef = await Test.createTestingModule({
      providers: [
        ShelfService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: QueueService, useValue: queueMock },
      ],
    }).compile();
    service = moduleRef.get(ShelfService);
  });

  describe("take", () => {
    it("decrements conditionally so two buyers cannot both take the last piece", async () => {
      await expect(service.take(mug, 2)).resolves.toBe(true);

      expect(prismaMock.product.updateMany).toHaveBeenCalledWith({
        where: { id: 10, stock: { gte: 2 } },
        data: { stock: { decrement: 2 }, sales_count: { increment: 2 } },
      });
    });

    it("reports a shelf that did not hold enough", async () => {
      prismaMock.product.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.take(mug, 2)).resolves.toBe(false);
    });

    it("only counts the sale for a piece thrown to order", async () => {
      await expect(
        service.take({ ...mug, is_customizable: true }, 3),
      ).resolves.toBe(true);

      expect(prismaMock.product.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { sales_count: { increment: 3 } },
      });
      expect(prismaMock.product.updateMany).not.toHaveBeenCalled();
    });
  });

  describe("release", () => {
    it("announces a piece put back on a bare shelf", async () => {
      prismaMock.product.update.mockResolvedValue({ ...listed, stock: 2 });

      await service.release(mug, 2);

      expect(prismaMock.product.update).toHaveBeenCalledWith(
        containing({
          where: { id: 10 },
          data: { sales_count: { decrement: 2 }, stock: { increment: 2 } },
        }),
      );
      expect(queueMock.publish).toHaveBeenCalledWith("notify.back-in-stock", {
        productId: 10,
      });
    });

    it("stays quiet when the shelf still had pieces, or the piece is archived", async () => {
      prismaMock.product.update.mockResolvedValue({ ...listed, stock: 5 });
      await service.release(mug, 2);

      prismaMock.product.update.mockResolvedValue({
        ...listed,
        stock: 2,
        is_active: false,
      });
      await service.release(mug, 2);

      expect(queueMock.publish).not.toHaveBeenCalled();
    });

    it("gives no stock back for a piece thrown to order", async () => {
      prismaMock.product.update.mockResolvedValue({
        ...listed,
        stock: 0,
        is_customizable: true,
      });

      await service.release({ ...mug, is_customizable: true }, 1);

      expect(prismaMock.product.update).toHaveBeenCalledWith(
        containing({ data: { sales_count: { decrement: 1 } } }),
      );
      expect(queueMock.publish).not.toHaveBeenCalled();
    });
  });

  describe("adjust", () => {
    it("refuses a count the shelf cannot give", async () => {
      prismaMock.product.updateManyAndReturn.mockResolvedValue([]);

      await expect(service.adjust(10, -4)).resolves.toBeNull();
      expect(prismaMock.product.updateManyAndReturn).toHaveBeenCalledWith(
        containing({ where: { id: 10, stock: { gte: 4 } } }),
      );
    });

    it("announces only the top-up that ends a sell-out", async () => {
      prismaMock.product.updateManyAndReturn.mockResolvedValue([
        { ...listed, stock: 3 },
      ]);
      await expect(service.adjust(10, 3)).resolves.toBe(3);
      expect(queueMock.publish).toHaveBeenCalledWith("notify.back-in-stock", {
        productId: 10,
      });

      queueMock.publish.mockClear();
      prismaMock.product.updateManyAndReturn.mockResolvedValue([
        { ...listed, stock: 5 },
      ]);
      await expect(service.adjust(10, 3)).resolves.toBe(5);
      prismaMock.product.updateManyAndReturn.mockResolvedValue([
        { ...listed, stock: 1 },
      ]);
      await expect(service.adjust(10, -2)).resolves.toBe(1);
      expect(queueMock.publish).not.toHaveBeenCalled();
    });

    it("says nothing about an archived piece, whatever the count does", async () => {
      prismaMock.product.updateManyAndReturn.mockResolvedValue([
        { ...listed, stock: 3, is_active: false },
      ]);

      await service.adjust(10, 3);

      expect(queueMock.publish).not.toHaveBeenCalled();
    });
  });

  describe("setListed", () => {
    it("announces a stocked piece coming back on the shelf", async () => {
      prismaMock.product.updateManyAndReturn.mockResolvedValue([
        { ...listed, stock: 3 },
      ]);

      await expect(service.setListed(10, true)).resolves.toBe(true);

      expect(prismaMock.product.updateManyAndReturn).toHaveBeenCalledWith(
        containing({
          where: { id: 10, is_active: false },
          data: { is_active: true },
        }),
      );
      expect(queueMock.publish).toHaveBeenCalledWith("notify.back-in-stock", {
        productId: 10,
      });
    });

    it("stays quiet when listing a sold-out piece or archiving one", async () => {
      prismaMock.product.updateManyAndReturn.mockResolvedValue([
        { ...listed, stock: 0 },
      ]);
      await service.setListed(10, true);

      prismaMock.product.updateManyAndReturn.mockResolvedValue([
        { ...listed, stock: 3, is_active: false },
      ]);
      await service.setListed(10, false);

      expect(queueMock.publish).not.toHaveBeenCalled();
    });

    it("reports when the flag was already where it was asked to go", async () => {
      prismaMock.product.updateManyAndReturn.mockResolvedValue([]);

      await expect(service.setListed(10, true)).resolves.toBe(false);
      expect(queueMock.publish).not.toHaveBeenCalled();
    });
  });
});
