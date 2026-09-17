import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MailService } from "@/mail/mail.service";
import { PrismaService } from "@/prisma/prisma.service";
import { QueueService } from "@/queue/queue.service";
import { NotificationsService } from "./notifications.service";

const prismaMock = {
  product: { findUnique: vi.fn() },
  batchNotification: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    deleteMany: vi.fn(),
    updateManyAndReturn: vi.fn(),
  },
};
const mailMock = { enqueue: vi.fn() };
const queueMock = { publish: vi.fn() };

const PIECE = { id: 4, name: "Slate mug", slug: "slate-mug", is_active: true };

describe("NotificationsService", () => {
  let service: NotificationsService;

  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock.product.findUnique.mockResolvedValue(PIECE);
    prismaMock.batchNotification.findUnique.mockResolvedValue(null);
    prismaMock.batchNotification.upsert.mockResolvedValue({ id: 1 });
    const moduleRef = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: MailService, useValue: mailMock },
        { provide: QueueService, useValue: queueMock },
      ],
    }).compile();
    service = moduleRef.get(NotificationsService);
  });

  describe("watch", () => {
    it("lowercases the address and keeps one row per piece", async () => {
      await expect(service.watch(4, "  MAYA@Example.com ", 7)).resolves.toEqual(
        { email: "maya@example.com", was_already_waiting: false },
      );
      expect(prismaMock.batchNotification.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: { email: "maya@example.com", product_id: 4, user_id: 7 },
        }),
      );
    });

    it("says so when the same address is already waiting", async () => {
      prismaMock.batchNotification.findUnique.mockResolvedValue({
        notified_at: null,
      });

      await expect(service.watch(4, "maya@example.com", null)).resolves.toEqual(
        {
          email: "maya@example.com",
          was_already_waiting: true,
        },
      );
    });

    it("puts a row that was already mailed back in the queue for the next batch", async () => {
      prismaMock.batchNotification.findUnique.mockResolvedValue({
        notified_at: new Date(),
      });

      const result = await service.watch(4, "maya@example.com", null);

      expect(result.was_already_waiting).toBe(false);
      expect(prismaMock.batchNotification.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ update: { notified_at: null } }),
      );
    });

    it("refuses an unlisted piece and a bad address", async () => {
      await expect(service.watch(4, "not-an-email", null)).rejects.toThrow(
        "valid email",
      );

      prismaMock.product.findUnique.mockResolvedValue(null);
      await expect(service.watch(4, "maya@example.com", null)).rejects.toThrow(
        "no longer listed",
      );
    });
  });

  describe("sendBackInStock", () => {
    it("claims the waiting rows before mailing, so a replay is silent", async () => {
      prismaMock.product.findUnique.mockResolvedValue({ ...PIECE, stock: 3 });
      prismaMock.batchNotification.updateManyAndReturn.mockResolvedValue([
        { email: "maya@example.com", token: "tok_1" },
        { email: "ravi@example.com", token: "tok_2" },
      ]);

      await expect(service.sendBackInStock(4)).resolves.toBe(2);
      expect(
        prismaMock.batchNotification.updateManyAndReturn,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { product_id: 4, notified_at: null },
        }),
      );
      expect(mailMock.enqueue).toHaveBeenCalledTimes(2);
      expect(mailMock.enqueue).toHaveBeenCalledWith(
        expect.objectContaining({ to: "maya@example.com" }),
      );
    });

    it("mails nobody when the piece is still sold out or delisted", async () => {
      prismaMock.product.findUnique.mockResolvedValue({ ...PIECE, stock: 0 });
      await expect(service.sendBackInStock(4)).resolves.toBe(0);

      prismaMock.product.findUnique.mockResolvedValue({
        ...PIECE,
        stock: 3,
        is_active: false,
      });
      await expect(service.sendBackInStock(4)).resolves.toBe(0);

      expect(mailMock.enqueue).not.toHaveBeenCalled();
    });
  });

  it("publishes one job per restocked piece", async () => {
    await service.announceRestock(4);

    expect(queueMock.publish).toHaveBeenCalledWith("notify.back-in-stock", {
      productId: 4,
    });
  });

  it("spends the stop link once", async () => {
    prismaMock.batchNotification.deleteMany.mockResolvedValue({ count: 1 });
    await expect(service.stopWatching("tok_1")).resolves.toBe(true);

    prismaMock.batchNotification.deleteMany.mockResolvedValue({ count: 0 });
    await expect(service.stopWatching("tok_1")).rejects.toThrow(
      "already been used",
    );
  });
});
