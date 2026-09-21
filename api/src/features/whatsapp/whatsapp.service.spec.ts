import { Test } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { WhatsAppDirection } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { env } from "@/config/env";
import { MailService } from "@/mail/mail.service";
import { PrismaService } from "@/prisma/prisma.service";
import { WhatsAppService } from "./whatsapp.service";
import type {
  RecordWhatsAppMessageInput,
  SendWhatsAppReplyInput,
} from "./whatsapp.type";

const containing = (value: Record<string, unknown>): unknown =>
  expect.objectContaining(value);

const prismaMock = {
  user: { findUnique: vi.fn() },
  whatsAppMessage: {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
  },
};
const mailMock = { enqueue: vi.fn() };

const row = {
  id: 1,
  direction: WhatsAppDirection.TO_STUDIO,
  kind: "order",
  body: "Hi, I have a question about order abc123.",
  page_url: "https://example.com/orders/abc123",
  user_id: 7,
  name: "Maya",
  email: "maya@example.com",
  phone: "9123456789",
  reference: "abc123",
  created_at: new Date(),
};

function recordInput(overrides: Partial<RecordWhatsAppMessageInput> = {}) {
  return {
    kind: "order",
    body: "Hi, I have a question about order abc123.",
    page_url: "https://example.com/orders/abc123",
    reference: "abc123",
    ...overrides,
  };
}

function replyInput(overrides: Partial<SendWhatsAppReplyInput> = {}) {
  return {
    kind: "commission-reply",
    body: "Hi Maya, thanks for the mug brief.",
    to_email: "Maya@Example.com",
    to_phone: "+91 91234-56789",
    reference: "abc123",
    ...overrides,
  };
}

describe("WhatsAppService", () => {
  let service: WhatsAppService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        WhatsAppService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: MailService, useValue: mailMock },
      ],
    }).compile();
    service = moduleRef.get(WhatsAppService);
  });

  describe("record", () => {
    it("stores an anonymous message without mailing when no studio address is set", async () => {
      prismaMock.whatsAppMessage.create.mockResolvedValue({
        ...row,
        user_id: null,
        name: null,
        email: null,
      });

      const studio = env.BUSINESS_EMAIL;
      env.BUSINESS_EMAIL = undefined;
      try {
        await expect(service.record(recordInput(), null)).resolves.toBe(true);
      } finally {
        env.BUSINESS_EMAIL = studio;
      }

      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
      expect(prismaMock.whatsAppMessage.create).toHaveBeenCalledWith({
        data: containing({
          direction: WhatsAppDirection.TO_STUDIO,
          user_id: null,
          name: null,
          email: null,
        }),
      });
      expect(mailMock.enqueue).not.toHaveBeenCalled();
    });

    it("files the message against the signed-in user and mails the studio", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 7,
        name: "Maya",
        email: "maya@example.com",
        phone: "9123456789",
      });
      prismaMock.whatsAppMessage.create.mockResolvedValue(row);
      const studio = env.BUSINESS_EMAIL;
      env.BUSINESS_EMAIL = "studio@example.com";

      try {
        await service.record(recordInput(), 7);
      } finally {
        env.BUSINESS_EMAIL = studio;
      }

      expect(prismaMock.whatsAppMessage.create).toHaveBeenCalledWith({
        data: containing({
          user_id: 7,
          name: "Maya",
          email: "maya@example.com",
          phone: "9123456789",
        }),
      });
      expect(mailMock.enqueue).toHaveBeenCalledWith(
        containing({
          to: "studio@example.com",
          subject: "WhatsApp: order from Maya",
        }),
      );
    });

    it("rejects an empty body", async () => {
      await expect(
        service.record(recordInput({ body: "   " }), null),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it("treats a blank page url as absent", async () => {
      prismaMock.whatsAppMessage.create.mockResolvedValue(row);

      await service.record(recordInput({ page_url: "" }), null);

      expect(prismaMock.whatsAppMessage.create).toHaveBeenCalledWith({
        data: containing({ page_url: null }),
      });
    });
  });

  describe("reply", () => {
    it("stores the reply under the admin and mails the customer", async () => {
      prismaMock.whatsAppMessage.create.mockResolvedValue({
        ...row,
        direction: WhatsAppDirection.TO_CUSTOMER,
        user_id: 3,
        email: "maya@example.com",
      });

      await expect(service.reply(replyInput(), 3)).resolves.toBe(true);

      expect(prismaMock.whatsAppMessage.create).toHaveBeenCalledWith({
        data: containing({
          direction: WhatsAppDirection.TO_CUSTOMER,
          user_id: 3,
          email: "maya@example.com",
          phone: "9123456789",
        }),
      });
      expect(mailMock.enqueue).toHaveBeenCalledWith(
        containing({
          to: "maya@example.com",
          subject: "A note from Poetry & Pottery",
        }),
      );
    });

    it("rejects a phone number that is not ten Indian digits", async () => {
      await expect(
        service.reply(replyInput({ to_phone: "12345" }), 3),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe("list", () => {
    it("filters by direction and search and shapes the user ref", async () => {
      prismaMock.whatsAppMessage.findMany.mockResolvedValue([
        {
          ...row,
          user: {
            id: 7,
            name: "Maya",
            email: "maya@example.com",
            image: null,
          },
        },
      ]);
      prismaMock.whatsAppMessage.count.mockResolvedValue(1);

      const result = await service.list({
        direction: WhatsAppDirection.TO_STUDIO,
        search: "order",
        page: 1,
        limit: 10,
      });

      expect(prismaMock.whatsAppMessage.findMany).toHaveBeenCalledWith(
        containing({
          where: containing({
            direction: WhatsAppDirection.TO_STUDIO,
            OR: expect.arrayContaining([
              { body: { contains: "order", mode: "insensitive" } },
            ]),
          }),
          skip: 0,
          take: 10,
        }),
      );
      expect(result.items[0]?.user).toEqual({
        id: 7,
        name: "Maya",
        email: "maya@example.com",
        image: null,
      });
      expect(result.page_info).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        has_more: false,
      });
    });
  });
});
