import { Test } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { env } from "@/config/env";
import { MailService } from "@/mail/mail.service";
import { PrismaService } from "@/prisma/prisma.service";
import { ContactService } from "./contact.service";
import type { ContactMessageInput } from "./contact.type";

const containing = (value: Record<string, unknown>): unknown =>
  expect.objectContaining(value);

const prismaMock = {
  contactMessage: { create: vi.fn() },
};
const mailMock = { enqueue: vi.fn() };

const row = {
  id: 1,
  name: "Maya",
  email: "maya@example.com",
  phone: "9123456789",
  subject: "Workshop dates",
  message: "When is the next wheel throwing batch?",
  is_read: false,
  created_at: new Date(),
};

function input(overrides: Partial<ContactMessageInput> = {}) {
  return {
    name: "Maya",
    email: "Maya@Example.com",
    phone: "+91 91234-56789",
    subject: "Workshop dates",
    message: "When is the next wheel throwing batch?",
    ...overrides,
  };
}

describe("ContactService", () => {
  let service: ContactService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ContactService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: MailService, useValue: mailMock },
      ],
    }).compile();
    service = moduleRef.get(ContactService);
  });

  it("stores a normalised message and acknowledges the sender", async () => {
    prismaMock.contactMessage.create.mockResolvedValue(row);

    await expect(service.send(input())).resolves.toBe(true);

    expect(prismaMock.contactMessage.create).toHaveBeenCalledWith({
      data: containing({
        email: "maya@example.com",
        phone: "9123456789",
      }),
    });
    expect(mailMock.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ to: "maya@example.com" }),
    );
  });

  it("mails the studio when a business address is configured", async () => {
    prismaMock.contactMessage.create.mockResolvedValue(row);
    env.BUSINESS_EMAIL = "studio@example.com";

    try {
      await service.send(input());
    } finally {
      env.BUSINESS_EMAIL = undefined;
    }

    expect(mailMock.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ to: "studio@example.com" }),
    );
  });

  it("rejects a short message", async () => {
    await expect(service.send(input({ message: "hi" }))).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("rejects a phone number that is not ten Indian digits", async () => {
    await expect(
      service.send(input({ phone: "12345" })),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("treats a blank phone number as absent", async () => {
    prismaMock.contactMessage.create.mockResolvedValue(row);

    await service.send(input({ phone: "  " }));

    expect(prismaMock.contactMessage.create).toHaveBeenCalledWith({
      data: containing({ phone: null }),
    });
  });
});
