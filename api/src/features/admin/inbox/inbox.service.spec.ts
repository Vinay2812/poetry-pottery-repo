import { NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "@/prisma/prisma.service";
import { missingRow } from "@test/helpers/prisma-errors";
import { AdminInboxService, toCsv } from "./inbox.service";

const message = {
  id: 1,
  name: "Maya",
  email: "maya@example.com",
  phone: null,
  subject: null,
  message: "When is the next batch?",
  is_read: false,
  created_at: new Date(),
};

const subscriber = {
  id: 1,
  email: "maya@example.com",
  is_active: true,
  created_at: new Date("2026-09-01T00:00:00.000Z"),
  unsubscribed_at: null,
  user_id: 7,
};

const prismaMock = {
  contactMessage: {
    findMany: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  newsletterSubscriber: {
    findMany: vi.fn(),
    count: vi.fn(),
    updateMany: vi.fn(),
  },
};

describe("toCsv", () => {
  it("writes a header and one row per subscriber", () => {
    const csv = toCsv([
      {
        email: "maya@example.com",
        is_active: true,
        created_at: new Date("2026-09-01T00:00:00.000Z"),
        unsubscribed_at: null,
      },
    ]);

    expect(csv.split("\n")).toEqual([
      "email,status,subscribed_at,unsubscribed_at",
      "maya@example.com,subscribed,2026-09-01T00:00:00.000Z,",
    ]);
  });

  it("quotes a field that carries a comma", () => {
    const csv = toCsv([
      {
        email: 'odd,"address"@example.com',
        is_active: false,
        created_at: new Date("2026-09-01T00:00:00.000Z"),
        unsubscribed_at: new Date("2026-09-02T00:00:00.000Z"),
      },
    ]);

    expect(csv).toContain('"odd,""address""@example.com"');
    expect(csv).toContain("unsubscribed");
  });

  it("still writes the header for an empty list", () => {
    expect(toCsv([])).toBe("email,status,subscribed_at,unsubscribed_at");
  });
});

describe("AdminInboxService", () => {
  let service: AdminInboxService;

  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock.contactMessage.findMany.mockResolvedValue([message]);
    prismaMock.contactMessage.count.mockResolvedValue(1);
    prismaMock.contactMessage.update.mockResolvedValue({
      ...message,
      is_read: true,
    });
    prismaMock.contactMessage.delete.mockResolvedValue(message);
    prismaMock.newsletterSubscriber.findMany.mockResolvedValue([subscriber]);
    prismaMock.newsletterSubscriber.count.mockResolvedValue(1);
    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminInboxService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = moduleRef.get(AdminInboxService);
  });

  it("lists unread messages newest first", async () => {
    const result = await service.messages({ is_read: false });

    expect(result.page_info.total).toBe(1);
    expect(prismaMock.contactMessage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { is_read: false },
        orderBy: { created_at: "desc" },
      }),
    );
  });

  it("searches name, email, subject and body", async () => {
    await service.messages({ search: "batch" });

    const call = prismaMock.contactMessage.findMany.mock.calls[0]?.[0] as {
      where: { OR: unknown[] };
    };
    expect(call.where.OR).toHaveLength(4);
  });

  it("marks a message read and unread", async () => {
    await service.setMessageRead(1, true);

    expect(prismaMock.contactMessage.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { is_read: true },
    });
  });

  it("deletes a message", async () => {
    await expect(service.deleteMessage(1)).resolves.toBe(true);
  });

  it("answers not found when the message is already gone", async () => {
    prismaMock.contactMessage.delete.mockRejectedValue(missingRow());

    await expect(service.deleteMessage(1)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("exports the filtered subscriber list as csv", async () => {
    const csv = await service.exportSubscribers({ is_active: true });

    expect(csv).toContain("maya@example.com,subscribed");
    expect(prismaMock.newsletterSubscriber.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { is_active: true } }),
    );
  });

  it("unsubscribes a lower-cased address", async () => {
    prismaMock.newsletterSubscriber.updateMany.mockResolvedValue({ count: 1 });

    await expect(service.unsubscribe(" Maya@Example.com ")).resolves.toBe(true);
    expect(prismaMock.newsletterSubscriber.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: "maya@example.com", is_active: true },
      }),
    );
  });

  it("reports an address that is not subscribed", async () => {
    prismaMock.newsletterSubscriber.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.unsubscribe("nobody@example.com"),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
