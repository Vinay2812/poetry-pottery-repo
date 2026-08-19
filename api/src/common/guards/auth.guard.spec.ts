import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AuthProvider, Role, type User } from "@prisma/client";
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
    authId: "user_1",
    authProvider: AuthProvider.CLERK,
    email: "potter@example.com",
    name: "Potter",
    role: Role.USER,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

const clerkMock = {
  provider: AuthProvider.CLERK,
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
    clerkMock.provider = AuthProvider.CLERK;

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
    const created = makeUser({ id: 42, authId: "user_42" });
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
        where: {
          authProvider_authId: {
            authProvider: AuthProvider.CLERK,
            authId: "user_42",
          },
        },
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
    clerkMock.provider = AuthProvider.CLERK;

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
      makeUser({ role: Role.ADMIN }),
    );

    await expect(
      adminGuard.canActivate(createHttpExecutionContext({ request: {} })),
    ).resolves.toBe(true);
  });

  it("rejects non-administrators", async () => {
    clerkMock.getAuthId.mockReturnValue("user_1");
    prismaMock.user.findUnique.mockResolvedValue(makeUser({ role: Role.USER }));

    await expect(
      adminGuard.canActivate(createHttpExecutionContext({ request: {} })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
