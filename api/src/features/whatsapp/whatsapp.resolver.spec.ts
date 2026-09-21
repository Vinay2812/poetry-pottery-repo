import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Test } from "@nestjs/testing";
import { UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminGuard } from "@/common/guards/admin.guard";
import { AuthGuard } from "@/common/guards/auth.guard";
import type { AuthUser } from "@/common/clerk/clerk.type";
import type { GqlContext } from "@/common/types/express";
import { WhatsAppResolver } from "./whatsapp.resolver";
import { WhatsAppService } from "./whatsapp.service";

function guardsOn(prototype: object, field: string): unknown[] {
  const handler: unknown = Object.getOwnPropertyDescriptor(
    prototype,
    field,
  )?.value;
  if (typeof handler !== "function") {
    throw new Error(`${field} is not a resolver field`);
  }
  const guards: unknown = Reflect.getMetadata(GUARDS_METADATA, handler);
  return Array.isArray(guards) ? (guards as unknown[]) : [];
}

const whatsappMock = {
  record: vi.fn<WhatsAppService["record"]>(),
  reply: vi.fn<WhatsAppService["reply"]>(),
  list: vi.fn<WhatsAppService["list"]>(),
};
const authGuardMock = { tryAuthenticate: vi.fn() };
const context = { req: {} } as GqlContext;
const admin: AuthUser = { db_user_id: 3, role: UserRole.ADMIN, auth_id: "a" };

const recordInput = { kind: "general", body: "Hi, a question." };

describe("WhatsAppResolver", () => {
  let resolver: WhatsAppResolver;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        WhatsAppResolver,
        { provide: WhatsAppService, useValue: whatsappMock },
        { provide: AuthGuard, useValue: authGuardMock },
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();
    resolver = moduleRef.get(WhatsAppResolver);
  });

  it("records an anonymous message without a user", async () => {
    authGuardMock.tryAuthenticate.mockResolvedValue(null);
    whatsappMock.record.mockResolvedValue(true);

    await expect(
      resolver.recordWhatsAppMessage(recordInput, context),
    ).resolves.toBe(true);
    expect(whatsappMock.record).toHaveBeenCalledWith(recordInput, null);
  });

  it("files a signed-in visitor's message against their account", async () => {
    authGuardMock.tryAuthenticate.mockResolvedValue({
      db_user_id: 7,
      role: UserRole.USER,
      auth_id: "u",
    });
    whatsappMock.record.mockResolvedValue(true);

    await resolver.recordWhatsAppMessage(recordInput, context);
    expect(whatsappMock.record).toHaveBeenCalledWith(recordInput, 7);
  });

  it("sends a reply as the acting admin", async () => {
    whatsappMock.reply.mockResolvedValue(true);
    const input = {
      kind: "commission-reply",
      body: "Hi Maya",
      to_email: "maya@example.com",
    };

    await expect(resolver.sendWhatsAppReply(input, admin)).resolves.toBe(true);
    expect(whatsappMock.reply).toHaveBeenCalledWith(input, 3);
  });

  it("lists with an empty filter when none is given", async () => {
    whatsappMock.list.mockResolvedValue({
      items: [],
      page_info: { total: 0, page: 1, limit: 20, has_more: false },
    });

    await resolver.adminWhatsAppMessages(null);
    expect(whatsappMock.list).toHaveBeenCalledWith({});
  });

  it("leaves recording open and guards the admin fields", () => {
    expect(
      guardsOn(WhatsAppResolver.prototype, "recordWhatsAppMessage"),
    ).toEqual([]);
    expect(guardsOn(WhatsAppResolver.prototype, "sendWhatsAppReply")).toEqual([
      AdminGuard,
    ]);
    expect(
      guardsOn(WhatsAppResolver.prototype, "adminWhatsAppMessages"),
    ).toEqual([AdminGuard]);
  });
});
