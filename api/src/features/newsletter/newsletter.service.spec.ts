import { Test } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MailService } from "@/mail/mail.service";
import { PrismaService } from "@/prisma/prisma.service";
import { NewsletterService } from "./newsletter.service";

const anyDate: unknown = expect.any(Date);

const prismaMock = {
  withTransaction: vi.fn((fn: () => Promise<unknown>) => fn()),
  newsletterSubscriber: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    upsert: vi.fn(),
    updateMany: vi.fn(),
  },
  user: { findUnique: vi.fn() },
};
const mailMock = { enqueue: vi.fn() };

function subscriber(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    email: "maya@example.com",
    user_id: null,
    token: "tok_123",
    is_active: true,
    unsubscribed_at: null,
    ...overrides,
  };
}

describe("NewsletterService", () => {
  let service: NewsletterService;

  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock.newsletterSubscriber.findUnique.mockResolvedValue(null);
    const moduleRef = await Test.createTestingModule({
      providers: [
        NewsletterService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: MailService, useValue: mailMock },
      ],
    }).compile();
    service = moduleRef.get(NewsletterService);
  });

  it("normalises the email and mails a new subscriber", async () => {
    prismaMock.newsletterSubscriber.upsert.mockResolvedValue(subscriber());

    const result = await service.subscribe("  Maya@Example.com ", null);

    expect(prismaMock.newsletterSubscriber.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: "maya@example.com" } }),
    );
    expect(result).toEqual({
      email: "maya@example.com",
      is_active: true,
      was_already_subscribed: false,
    });
    expect(mailMock.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ to: "maya@example.com" }),
    );
  });

  it("stays quiet when the address is already active", async () => {
    prismaMock.newsletterSubscriber.findUnique.mockResolvedValueOnce(
      subscriber(),
    );
    prismaMock.newsletterSubscriber.upsert.mockResolvedValue(subscriber());

    const result = await service.subscribe("maya@example.com", null);

    expect(result.was_already_subscribed).toBe(true);
    expect(mailMock.enqueue).not.toHaveBeenCalled();
  });

  it("re-activates an unsubscribed row and mails again", async () => {
    prismaMock.newsletterSubscriber.findUnique.mockResolvedValueOnce(
      subscriber({ is_active: false, unsubscribed_at: new Date() }),
    );
    prismaMock.newsletterSubscriber.upsert.mockResolvedValue(subscriber());

    const result = await service.subscribe("maya@example.com", null);

    expect(result.was_already_subscribed).toBe(false);
    expect(mailMock.enqueue).toHaveBeenCalledTimes(1);
  });

  it("links the signed-in account when it is not already linked", async () => {
    prismaMock.newsletterSubscriber.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    prismaMock.newsletterSubscriber.upsert.mockResolvedValue(
      subscriber({ user_id: 7 }),
    );

    await service.subscribe("maya@example.com", 7);

    expect(prismaMock.newsletterSubscriber.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: { email: "maya@example.com", user_id: 7 },
      }),
    );
  });

  it("skips linking when the account already owns another row", async () => {
    prismaMock.newsletterSubscriber.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 99 });
    prismaMock.newsletterSubscriber.upsert.mockResolvedValue(subscriber());

    await service.subscribe("maya@example.com", 7);

    expect(prismaMock.newsletterSubscriber.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: { email: "maya@example.com", user_id: null },
      }),
    );
  });

  it("rejects an invalid email", async () => {
    await expect(
      service.subscribe("not-an-email", null),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("unsubscribes by token", async () => {
    prismaMock.newsletterSubscriber.updateMany.mockResolvedValue({ count: 1 });

    await expect(service.unsubscribe("tok_123")).resolves.toBe(true);
    expect(prismaMock.newsletterSubscriber.updateMany).toHaveBeenCalledWith({
      where: { token: "tok_123" },
      data: { is_active: false, unsubscribed_at: anyDate },
    });
  });

  it("rejects an unknown token", async () => {
    prismaMock.newsletterSubscriber.updateMany.mockResolvedValue({ count: 0 });

    await expect(service.unsubscribe("nope")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("falls back to the account email when there is no subscription", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ email: "maya@example.com" });
    prismaMock.newsletterSubscriber.findFirst.mockResolvedValue(null);

    await expect(service.status(7)).resolves.toEqual({
      is_subscribed: false,
      email: "maya@example.com",
    });
  });
});
