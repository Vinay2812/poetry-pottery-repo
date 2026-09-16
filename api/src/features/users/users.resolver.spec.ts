import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Test } from "@nestjs/testing";
import { UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminGuard } from "@/common/guards/admin.guard";
import { UsersResolver } from "./users.resolver";
import { UsersService } from "./users.service";
import type { User, UsersResponse } from "./users.type";

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

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    auth_id: "user_1",
    email: "potter@example.com",
    phone: null,
    name: "Potter",
    image: null,
    role: UserRole.USER,
    created_at: new Date("2026-01-01T00:00:00.000Z"),
    updated_at: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

function makeResponse(overrides: Partial<UsersResponse> = {}): UsersResponse {
  return { items: [makeUser()], total: 1, page: 1, limit: 20, ...overrides };
}

const usersMock = {
  findPaginated: vi.fn<UsersService["findPaginated"]>(),
};

describe("UsersResolver", () => {
  let resolver: UsersResolver;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersResolver,
        { provide: UsersService, useValue: usersMock },
      ],
    })
      // Nest instantiates the guard named in the UseGuards metadata, so it is stubbed out.
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();
    resolver = moduleRef.get(UsersResolver);
  });

  it("reads the first page of twenty the schema defaults to", async () => {
    const response = makeResponse();
    usersMock.findPaginated.mockResolvedValue(response);

    await expect(resolver.users(1, 20)).resolves.toBe(response);
    expect(usersMock.findPaginated).toHaveBeenCalledWith(1, 20);
  });

  it("passes the page ahead of the limit, never the other way round", async () => {
    usersMock.findPaginated.mockResolvedValue(makeResponse({ page: 3 }));

    await resolver.users(3, 50);

    expect(usersMock.findPaginated).toHaveBeenCalledWith(3, 50);
    expect(usersMock.findPaginated).not.toHaveBeenCalledWith(50, 3);
  });

  it("keeps the directory behind the administrator guard", () => {
    expect(guardsOn(UsersResolver.prototype, "users")).toEqual([AdminGuard]);
  });
});
