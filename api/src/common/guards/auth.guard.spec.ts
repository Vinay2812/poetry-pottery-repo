import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { getAuth, type User as ClerkUser } from "@clerk/express";
import { UserRole, type User } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createHttpExecutionContext } from "@test/helpers/execution-context";
import { PrismaService } from "@/prisma/prisma.service";
import { UsersService } from "@/users/users.service";
import { ClerkService } from "@/common/clerk/clerk.service";
import type { AuthUser } from "@/common/clerk/clerk.type";
import { AdminGuard } from "./admin.guard";
import { AuthGuard } from "./auth.guard";

vi.mock("@clerk/express", () => ({
  getAuth: vi.fn(),
  clerkMiddleware: vi.fn(),
  clerkClient: {},
}));

const getAuthMock = vi.mocked(getAuth);

function mockAuth(value: {
  isAuthenticated: boolean;
  userId?: string;
  sessionClaims?: { dbUserId?: number; role?: UserRole };
}): void {
  getAuthMock.mockReturnValue(value as unknown as ReturnType<typeof getAuth>);
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
    subscribed_to_newsletter: false,
    newsletter_subscribed_at: null,
    created_at: new Date("2026-01-01T00:00:00.000Z"),
    updated_at: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

const clerkUserStub = {} as ClerkUser;

const clerkMock = {
  getUser: vi.fn(),
  getPrimaryEmail: vi.fn(),
  getFullName: vi.fn(),
  getImageUrl: vi.fn(),
  updatePublicMetadata: vi.fn(),
};

const prismaMock = {
  user: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  withTransaction: vi.fn(),
};

type FakeRequest = { authenticatedUser?: AuthUser };

async function createGuard<T extends AuthGuard>(guardClass: {
  new (clerk: ClerkService, users: UsersService, prisma: PrismaService): T;
}): Promise<T> {
  // resetAllMocks drops implementations, so the transaction passthrough is restored here.
  prismaMock.withTransaction.mockImplementation((fn: () => Promise<unknown>) =>
    fn(),
  );
  const moduleRef = await Test.createTestingModule({
    providers: [
      guardClass,
      UsersService,
      { provide: ClerkService, useValue: clerkMock },
      { provide: PrismaService, useValue: prismaMock },
    ],
  }).compile();
  return moduleRef.get(guardClass);
}

describe("AuthGuard", () => {
  let authGuard: AuthGuard;

  beforeEach(async () => {
    vi.resetAllMocks();
    authGuard = await createGuard(AuthGuard);
  });

  it("rejects unauthenticated requests", async () => {
    mockAuth({ isAuthenticated: false });
    const request: FakeRequest = {};

    await expect(
      authGuard.canActivate(createHttpExecutionContext({ request })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prismaMock.user.upsert).not.toHaveBeenCalled();
  });

  it("trusts complete session claims without touching Clerk or the database", async () => {
    mockAuth({
      isAuthenticated: true,
      userId: "user_1",
      sessionClaims: { dbUserId: 42, role: UserRole.USER },
    });

    const request: FakeRequest = {};
    await expect(
      authGuard.canActivate(createHttpExecutionContext({ request })),
    ).resolves.toBe(true);

    expect(clerkMock.getUser).not.toHaveBeenCalled();
    expect(prismaMock.user.upsert).not.toHaveBeenCalled();
    expect(request.authenticatedUser).toEqual({
      db_user_id: 42,
      role: UserRole.USER,
      auth_id: "user_1",
    });
  });

  it("provisions on incomplete claims and caches the database role in the metadata", async () => {
    const created = makeUser({ id: 7, auth_id: "user_7" });
    mockAuth({ isAuthenticated: true, userId: "user_7", sessionClaims: {} });
    clerkMock.getUser.mockResolvedValue(clerkUserStub);
    clerkMock.getPrimaryEmail.mockReturnValue("potter@example.com");
    clerkMock.getFullName.mockReturnValue("Potter");
    clerkMock.getImageUrl.mockReturnValue(undefined);
    prismaMock.user.upsert.mockResolvedValue(created);

    const request: FakeRequest = {};
    await authGuard.canActivate(createHttpExecutionContext({ request }));

    // The role never comes from the claims: create leaves it to the schema default, update omits it.
    expect(prismaMock.user.upsert).toHaveBeenCalledWith({
      where: { auth_id: "user_7" },
      create: {
        auth_id: "user_7",
        email: "potter@example.com",
        name: "Potter",
        image: null,
      },
      update: { email: "potter@example.com", name: "Potter", image: null },
    });
    expect(clerkMock.updatePublicMetadata).toHaveBeenCalledWith("user_7", {
      dbUserId: created.id,
      role: created.role,
    });
    expect(request.authenticatedUser).toEqual({
      db_user_id: created.id,
      role: created.role,
      auth_id: "user_7",
    });
  });

  it("rejects when the Clerk profile has no email address", async () => {
    mockAuth({ isAuthenticated: true, userId: "user_9", sessionClaims: {} });
    clerkMock.getUser.mockResolvedValue(clerkUserStub);
    clerkMock.getPrimaryEmail.mockReturnValue(undefined);

    await expect(
      authGuard.canActivate(createHttpExecutionContext({ request: {} })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prismaMock.user.upsert).not.toHaveBeenCalled();
  });

  it("caches the authentication for the lifetime of a single request", async () => {
    mockAuth({
      isAuthenticated: true,
      userId: "user_1",
      sessionClaims: { dbUserId: 1, role: UserRole.USER },
    });

    const context = createHttpExecutionContext({ request: {} });
    await authGuard.canActivate(context);
    await authGuard.canActivate(context);

    expect(getAuthMock).toHaveBeenCalledTimes(1);
  });
});

describe("AdminGuard", () => {
  let adminGuard: AdminGuard;

  beforeEach(async () => {
    vi.resetAllMocks();
    adminGuard = await createGuard(AdminGuard);
  });

  it("allows administrators", async () => {
    mockAuth({
      isAuthenticated: true,
      userId: "user_1",
      sessionClaims: { dbUserId: 1, role: UserRole.ADMIN },
    });

    await expect(
      adminGuard.canActivate(createHttpExecutionContext({ request: {} })),
    ).resolves.toBe(true);
  });

  it("rejects non-administrators", async () => {
    mockAuth({
      isAuthenticated: true,
      userId: "user_1",
      sessionClaims: { dbUserId: 1, role: UserRole.USER },
    });

    await expect(
      adminGuard.canActivate(createHttpExecutionContext({ request: {} })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
