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
    findUniqueOrThrow: vi.fn(),
    findFirst: vi.fn(),
    createMany: vi.fn(),
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
    prismaMock.newsletterSubscriber.findUniqueOrThrow.mockResolvedValue(
      subscriber(),
    );
    prismaMock.newsletterSubscriber.updateMany.mockResolvedValue({ count: 1 });
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
    const result = await service.subscribe("  Maya@Example.com ", null);

    expect(prismaMock.newsletterSubscriber.createMany).toHaveBeenCalledWith({
      data: { email: "maya@example.com", is_active: false },
      skipDuplicates: true,
    });
    expect(result).toEqual({
      email: "maya@example.com",
      is_active: true,
      was_already_subscribed: false,
    });
    expect(mailMock.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ to: "maya@example.com" }),
    );
  });

  it("wakes a dormant row with one predicated write", async () => {
    await service.subscribe("maya@example.com", null);

    expect(prismaMock.newsletterSubscriber.updateMany).toHaveBeenCalledWith({
      where: { email: "maya@example.com", is_active: false },
      data: { is_active: true, unsubscribed_at: null },
    });
  });

  it("stays quiet for the signups that did not wake the row", async () => {
    prismaMock.newsletterSubscriber.updateMany.mockResolvedValue({ count: 0 });

    const result = await service.subscribe("maya@example.com", null);

    expect(result.was_already_subscribed).toBe(true);
    expect(mailMock.enqueue).not.toHaveBeenCalled();
  });

  it("links the signed-in account when it is not already linked", async () => {
    prismaMock.newsletterSubscriber.findUnique.mockResolvedValueOnce(null);

    await service.subscribe("maya@example.com", 7);

    expect(prismaMock.newsletterSubscriber.updateMany).toHaveBeenCalledWith({
      where: { email: "maya@example.com" },
      data: { user_id: 7 },
    });
  });

  it("skips linking when the account already owns another row", async () => {
    prismaMock.newsletterSubscriber.findUnique.mockResolvedValueOnce({
      id: 99,
    });

    await service.subscribe("maya@example.com", 7);

    expect(prismaMock.newsletterSubscriber.updateMany).not.toHaveBeenCalledWith(
      expect.objectContaining({ data: { user_id: 7 } }),
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
