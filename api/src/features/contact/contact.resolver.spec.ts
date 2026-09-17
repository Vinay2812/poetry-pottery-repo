import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ContactResolver } from "./contact.resolver";
import { ContactService } from "./contact.service";
import type { ContactMessageInput } from "./contact.type";

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

const contactMock = { send: vi.fn<ContactService["send"]>() };

describe("ContactResolver", () => {
  let resolver: ContactResolver;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ContactResolver,
        { provide: ContactService, useValue: contactMock },
      ],
    }).compile();
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

  it("leaves the enquiry form open to anyone", () => {
    expect(guardsOn(ContactResolver.prototype, "sendContactMessage")).toEqual(
      [],
    );
  });
});
