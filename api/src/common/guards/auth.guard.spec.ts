import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { UserRole, type User } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createHttpExecutionContext } from "@test/helpers/execution-context";
import { PrismaService } from "@/prisma/prisma.service";
import { UsersService } from "@/users/users.service";
import { ClerkService } from "@/common/clerk/clerk.service";
import { AdminGuard } from "./admin.guard";
import { AuthGuard } from "./auth.guard";

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    auth_id: "user_1",
    email: "potter@example.com",
    phone: null,
    name: "Potter",
    image: null,
    role: UserRole.USER,
    subscribed_to_newsletter: false,
    newsletter_subscribed_at: null,
    created_at: new Date("2026-01-01T00:00:00.000Z"),
    updated_at: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

const clerkMock = {
  getAuthId: vi.fn(),
  fetchProfile: vi.fn(),
};

const prismaMock = {
  user: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
};

describe("AuthGuard", () => {
  let authGuard: AuthGuard;

  beforeEach(async () => {
    vi.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthGuard,
        UsersService,
        { provide: ClerkService, useValue: clerkMock },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    authGuard = moduleRef.get(AuthGuard);
  });

  it("rejects unauthenticated requests", async () => {
    clerkMock.getAuthId.mockReturnValue(null);
    const request: { currentUser?: User } = {};

    await expect(
      authGuard.canActivate(createHttpExecutionContext({ request })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it("provisions the user on first sight and attaches it to the request", async () => {
    const created = makeUser({ id: 42, auth_id: "user_42" });
    clerkMock.getAuthId.mockReturnValue("user_42");
    clerkMock.fetchProfile.mockResolvedValue({
      email: "potter@example.com",
      name: "Potter",
    });
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.upsert.mockResolvedValue(created);

    const request: { currentUser?: User } = {};
    await expect(
      authGuard.canActivate(createHttpExecutionContext({ request })),
    ).resolves.toBe(true);

    expect(clerkMock.fetchProfile).toHaveBeenCalledWith("user_42");
    expect(prismaMock.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { auth_id: "user_42" },
      }),
    );
    expect(request.currentUser).toEqual(created);
  });

  it("reuses a known user without calling the auth provider profile api", async () => {
    const existing = makeUser();
    clerkMock.getAuthId.mockReturnValue("user_1");
    prismaMock.user.findUnique.mockResolvedValue(existing);

    const request: { currentUser?: User } = {};
    await authGuard.canActivate(createHttpExecutionContext({ request }));

    expect(clerkMock.fetchProfile).not.toHaveBeenCalled();
    expect(prismaMock.user.upsert).not.toHaveBeenCalled();
    expect(request.currentUser).toEqual(existing);
  });

  it("caches the lookup for the lifetime of a single request", async () => {
    const existing = makeUser();
    clerkMock.getAuthId.mockReturnValue("user_1");
    prismaMock.user.findUnique.mockResolvedValue(existing);

    const request: { currentUser?: User } = {};
    const context = createHttpExecutionContext({ request });
    await authGuard.canActivate(context);
    await authGuard.canActivate(context);

    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
  });
});

describe("AdminGuard", () => {
  let adminGuard: AdminGuard;

  beforeEach(async () => {
    vi.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminGuard,
        UsersService,
        { provide: ClerkService, useValue: clerkMock },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    adminGuard = moduleRef.get(AdminGuard);
  });

  it("allows administrators", async () => {
    clerkMock.getAuthId.mockReturnValue("user_1");
    prismaMock.user.findUnique.mockResolvedValue(
      makeUser({ role: UserRole.ADMIN }),
    );

    await expect(
      adminGuard.canActivate(createHttpExecutionContext({ request: {} })),
    ).resolves.toBe(true);
  });

  it("rejects non-administrators", async () => {
    clerkMock.getAuthId.mockReturnValue("user_1");
    prismaMock.user.findUnique.mockResolvedValue(
      makeUser({ role: UserRole.USER }),
    );

    await expect(
      adminGuard.canActivate(createHttpExecutionContext({ request: {} })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
