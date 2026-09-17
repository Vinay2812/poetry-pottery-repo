import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminGuard } from "@/common/guards/admin.guard";
import { AuthGuard } from "@/common/guards/auth.guard";
import type { GqlContext } from "@/common/types/express";
import { CommissionsResolver } from "./commissions.resolver";
import { CommissionsService } from "./commissions.service";
import type {
  CommissionRequest,
  CommissionRequestInput,
} from "./commissions.type";

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

function makeRequest(
  overrides: Partial<CommissionRequest> = {},
): CommissionRequest {
  return {
    id: "abc123def456",
    piece_type: "Mug",
    size: "Short (150 ml)",
    glaze: "Ocean Blue",
    carved_words: null,
    notes: null,
    name: "Maya",
    email: "maya@example.com",
    phone: null,
    reference_image_urls: [],
    is_read: false,
    created_at: new Date("2026-09-17T00:00:00.000Z"),
    ...overrides,
  };
}

function makeInput(
  overrides: Partial<CommissionRequestInput> = {},
): CommissionRequestInput {
  return {
    piece_type: "Mug",
    size: "Short (150 ml)",
    glaze: "Ocean Blue",
    name: "Maya",
    email: "maya@example.com",
    ...overrides,
  };
}

const commissionsMock = {
  options: vi.fn<CommissionsService["options"]>(),
  pieces: vi.fn<CommissionsService["pieces"]>(),
  create: vi.fn<CommissionsService["create"]>(),
  list: vi.fn<CommissionsService["list"]>(),
  markRead: vi.fn<CommissionsService["markRead"]>(),
};

const authGuardMock = { tryAuthenticate: vi.fn() };
const context = { req: {} } as GqlContext;

describe("CommissionsResolver", () => {
  let resolver: CommissionsResolver;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        CommissionsResolver,
        { provide: CommissionsService, useValue: commissionsMock },
        { provide: AuthGuard, useValue: authGuardMock },
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();
    resolver = moduleRef.get(CommissionsResolver);
  });

  it("files a signed-in visitor's brief against their account", async () => {
    const created = makeRequest();
    authGuardMock.tryAuthenticate.mockResolvedValue({ db_user_id: 7 });
    commissionsMock.create.mockResolvedValue(created);

    const input = makeInput();
    await expect(
      resolver.createCommissionRequest(input, context),
    ).resolves.toBe(created);
    expect(commissionsMock.create).toHaveBeenCalledWith(input, 7);
  });

  it("accepts a brief from a visitor who is not signed in", async () => {
    authGuardMock.tryAuthenticate.mockResolvedValue(null);
    commissionsMock.create.mockResolvedValue(makeRequest());

    await resolver.createCommissionRequest(makeInput(), context);

    expect(commissionsMock.create).toHaveBeenCalledWith(
      expect.anything(),
      null,
    );
  });

  it("asks the service for the shelf's own sizes and glazes", async () => {
    const options = { piece_types: ["Mugs"], sizes: [], glazes: [] };
    commissionsMock.options.mockResolvedValue(options);

    await expect(resolver.commissionOptions()).resolves.toBe(options);
  });

  it("passes the piece limit straight through", async () => {
    commissionsMock.pieces.mockResolvedValue([]);

    await resolver.commissionPieces(3);

    expect(commissionsMock.pieces).toHaveBeenCalledWith(3);
  });

  it("defaults the brief list bounds to the service", async () => {
    const result = {
      items: [],
      page_info: { total: 0, page: 1, limit: 20, has_more: false },
    };
    commissionsMock.list.mockResolvedValue(result);

    await expect(resolver.commissionRequests(null)).resolves.toBe(result);
    expect(commissionsMock.list).toHaveBeenCalledWith({});
  });

  it("leaves the brief form and its option lists open to anyone", () => {
    for (const field of [
      "createCommissionRequest",
      "commissionOptions",
      "commissionPieces",
    ]) {
      expect(guardsOn(CommissionsResolver.prototype, field)).toEqual([]);
    }
  });

  it("keeps the brief inbox behind the administrator guard", () => {
    for (const field of [
      "commissionRequests",
      "markCommissionRequestRead",
      "setCommissionRequestStatus",
    ]) {
      expect(guardsOn(CommissionsResolver.prototype, field)).toEqual([
        AdminGuard,
      ]);
    }
  });
});
