import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminGuard } from "@/common/guards/admin.guard";
import { ContactResolver } from "./contact.resolver";
import { ContactService } from "./contact.service";
import type {
  ContactMessage,
  ContactMessageInput,
  ContactMessagesResult,
} from "./contact.type";

function guardsOn(prototype: object, field: string): unknown[] {
  const handler: unknown = Object.getOwnPropertyDescriptor(
    prototype,
    field,
  )?.value;
  // A misspelt field would otherwise look like an unguarded one.
  if (typeof handler !== "function") {
    throw new Error(`${field} is not a resolver field`);
  }
  const guards: unknown = Reflect.getMetadata(GUARDS_METADATA, handler);
  return Array.isArray(guards) ? (guards as unknown[]) : [];
}

function makeMessage(overrides: Partial<ContactMessage> = {}): ContactMessage {
  return {
    id: 1,
    name: "Potter",
    email: "potter@example.com",
    phone: null,
    subject: null,
    message: "Do you ship to Sangli?",
    is_read: false,
    created_at: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

function makeMessageInput(
  overrides: Partial<ContactMessageInput> = {},
): ContactMessageInput {
  return {
    name: "Potter",
    email: "potter@example.com",
    message: "Do you ship to Sangli?",
    ...overrides,
  };
}

function makeResult(
  overrides: Partial<ContactMessagesResult> = {},
): ContactMessagesResult {
  return {
    items: [makeMessage()],
    page_info: { total: 1, page: 1, limit: 20, has_more: false },
    ...overrides,
  };
}

const contactMock = {
  send: vi.fn<ContactService["send"]>(),
  list: vi.fn<ContactService["list"]>(),
  markRead: vi.fn<ContactService["markRead"]>(),
};

describe("ContactResolver", () => {
  let resolver: ContactResolver;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ContactResolver,
        { provide: ContactService, useValue: contactMock },
      ],
    })
      // Nest instantiates the guard named in the UseGuards metadata, so it is stubbed out.
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();
    resolver = moduleRef.get(ContactResolver);
  });

  it("hands the enquiry to the service untouched", async () => {
    const input = makeMessageInput({
      subject: "Shipping",
      phone: "9876543210",
    });
    contactMock.send.mockResolvedValue(true);

    await expect(resolver.sendContactMessage(input)).resolves.toBe(true);
    expect(contactMock.send).toHaveBeenCalledWith(input);
  });

  it("lists the inbox with the page ahead of the limit", async () => {
    const result = makeResult();
    contactMock.list.mockResolvedValue(result);

    await expect(resolver.contactMessages(2, 30)).resolves.toBe(result);
    expect(contactMock.list).toHaveBeenCalledWith(2, 30);
  });

  it("passes an absent page and limit on so the service picks the bounds", async () => {
    contactMock.list.mockResolvedValue(makeResult());

    await resolver.contactMessages(null, null);

    expect(contactMock.list).toHaveBeenCalledWith(null, null);
  });

  it("marks a single message read by its id", async () => {
    const read = makeMessage({ is_read: true });
    contactMock.markRead.mockResolvedValue(read);

    await expect(resolver.markContactMessageRead(1)).resolves.toBe(read);
    expect(contactMock.markRead).toHaveBeenCalledWith(1);
  });

  it("leaves the enquiry form open to anyone", () => {
    expect(guardsOn(ContactResolver.prototype, "sendContactMessage")).toEqual(
      [],
    );
  });

  it("keeps the inbox behind the administrator guard", () => {
    const fields = ["contactMessages", "markContactMessageRead"];

    for (const field of fields) {
      expect(guardsOn(ContactResolver.prototype, field)).toEqual([AdminGuard]);
    }
  });
});
