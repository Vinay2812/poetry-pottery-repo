import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { getAuth, type User as ClerkUser } from "@clerk/express";
import { UserRole, type User } from "@prisma/client";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createHttpExecutionContext } from "@test/helpers/execution-context";
import { PrismaService } from "@/prisma/prisma.service";
import { UsersService } from "@/features/users/users.service";
import { ClerkService } from "@/common/clerk/clerk.service";
import type { AuthUser } from "@/common/clerk/clerk.type";
import type { AppRequest } from "@/common/types/express";
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
    created_at: new Date("2026-01-01T00:00:00.000Z"),
    updated_at: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

const clerkUserStub = {} as ClerkUser;

const clerkMock = {
  getUser: vi.fn(() => Promise.resolve(clerkUserStub)),
  getPrimaryEmail: vi.fn(),
  hasVerifiedPrimaryEmail: vi.fn(),
  getFullName: vi.fn(),
  getImageUrl: vi.fn(),
  updatePublicMetadata: vi.fn(() => Promise.resolve()),
};

const prismaMock = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(() => Promise.resolve({ count: 1 })),
  },
  $executeRaw: vi.fn(),
  withTransaction: vi.fn(),
  afterCommit: vi.fn(),
  lock: vi.fn(),
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
      {
        provide: WINSTON_MODULE_PROVIDER,
        useValue: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
      },
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
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("accepts session claims that match the row owning the auth id", async () => {
    mockAuth({
      isAuthenticated: true,
      userId: "user_1",
      sessionClaims: { dbUserId: 42, role: UserRole.USER },
    });
    prismaMock.user.findUnique.mockResolvedValue(
      makeUser({ id: 42, auth_id: "user_1" }),
    );

    const request: FakeRequest = {};
    await expect(
      authGuard.canActivate(createHttpExecutionContext({ request })),
    ).resolves.toBe(true);

    expect(clerkMock.getUser).not.toHaveBeenCalled();
    expect(clerkMock.updatePublicMetadata).not.toHaveBeenCalled();
    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(request.authenticatedUser).toEqual({
      db_user_id: 42,
      role: UserRole.USER,
      auth_id: "user_1",
    });
  });

  it("ignores a stale dbUserId claim pointing at another account", async () => {
    // The claim survived a database reset and now names someone else's row.
    mockAuth({
      isAuthenticated: true,
      userId: "user_1",
      sessionClaims: { dbUserId: 42, role: UserRole.USER },
    });
    prismaMock.user.findUnique.mockResolvedValue(
      makeUser({ id: 3, auth_id: "user_1" }),
    );

    const request: FakeRequest = {};
    await authGuard.canActivate(createHttpExecutionContext({ request }));

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { auth_id: "user_1" },
    });
    expect(request.authenticatedUser).toEqual({
      db_user_id: 3,
      role: UserRole.USER,
      auth_id: "user_1",
    });
    expect(clerkMock.updatePublicMetadata).toHaveBeenCalledWith("user_1", {
      dbUserId: 3,
      role: UserRole.USER,
    });
  });

  it("still authenticates when refreshing the Clerk metadata fails", async () => {
    mockAuth({
      isAuthenticated: true,
      userId: "user_1",
      sessionClaims: {},
    });
    prismaMock.user.findUnique.mockResolvedValue(
      makeUser({ id: 3, auth_id: "user_1" }),
    );
    clerkMock.updatePublicMetadata.mockRejectedValueOnce(new Error("429"));

    const request: FakeRequest = {};
    await expect(
      authGuard.canActivate(createHttpExecutionContext({ request })),
    ).resolves.toBe(true);
    expect(request.authenticatedUser?.db_user_id).toBe(3);
  });

  it("fills a name that Clerk gained after the first sign-in, once per user", async () => {
    mockAuth({
      isAuthenticated: true,
      userId: "user_9",
      sessionClaims: { dbUserId: 9, role: UserRole.USER },
    });
    prismaMock.user.findUnique.mockResolvedValue(
      makeUser({ id: 9, auth_id: "user_9", name: null }),
    );
    clerkMock.getFullName.mockReturnValue("Maya Iyer");
    clerkMock.getImageUrl.mockReturnValue(undefined);

    await authGuard.canActivate(createHttpExecutionContext({ request: {} }));
    await authGuard.canActivate(createHttpExecutionContext({ request: {} }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(clerkMock.getUser).toHaveBeenCalledTimes(1);
    expect(prismaMock.user.updateMany).toHaveBeenCalledWith({
      where: { id: 9, name: null },
      data: { name: "Maya Iyer" },
    });
  });

  it("ignores an admin role claim the database does not back", async () => {
    mockAuth({
      isAuthenticated: true,
      userId: "user_1",
      sessionClaims: { dbUserId: 1, role: UserRole.ADMIN },
    });
    prismaMock.user.findUnique.mockResolvedValue(
      makeUser({ id: 1, auth_id: "user_1", role: UserRole.USER }),
    );

    const request: FakeRequest = {};
    await authGuard.canActivate(createHttpExecutionContext({ request }));

    expect(request.authenticatedUser?.role).toBe(UserRole.USER);
    expect(clerkMock.updatePublicMetadata).toHaveBeenCalledWith("user_1", {
      dbUserId: 1,
      role: UserRole.USER,
    });
  });

  it("keeps a first sign-in when Clerk cannot take the metadata", async () => {
    const created = makeUser({ id: 7, auth_id: "user_7" });
    mockAuth({ isAuthenticated: true, userId: "user_7", sessionClaims: {} });
    prismaMock.user.findUnique.mockResolvedValue(null);
    clerkMock.getUser.mockResolvedValue(clerkUserStub);
    clerkMock.getPrimaryEmail.mockReturnValue("potter@example.com");
    prismaMock.user.create.mockResolvedValue(created);
    clerkMock.updatePublicMetadata.mockRejectedValueOnce(new Error("503"));

    const request: FakeRequest = {};
    await expect(
      authGuard.canActivate(createHttpExecutionContext({ request })),
    ).resolves.toBe(true);
    expect(request.authenticatedUser?.db_user_id).toBe(7);
  });

  it("provisions on incomplete claims and caches the database role in the metadata", async () => {
    const created = makeUser({ id: 7, auth_id: "user_7" });
    mockAuth({ isAuthenticated: true, userId: "user_7", sessionClaims: {} });
    prismaMock.user.findUnique.mockResolvedValue(null);
    clerkMock.getUser.mockResolvedValue(clerkUserStub);
    clerkMock.getPrimaryEmail.mockReturnValue("potter@example.com");
    clerkMock.getFullName.mockReturnValue("Potter");
    clerkMock.getImageUrl.mockReturnValue(undefined);
    prismaMock.user.create.mockResolvedValue(created);

    const request: FakeRequest = {};
    await authGuard.canActivate(createHttpExecutionContext({ request }));

    // The role never comes from the claims: the insert leaves it to the schema default.
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        auth_id: "user_7",
        email: "potter@example.com",
        name: "Potter",
        image: null,
      },
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

  it("adopts an imported row whose auth id came from another Clerk instance", async () => {
    const imported = makeUser({ id: 4, auth_id: "user_prod" });
    mockAuth({ isAuthenticated: true, userId: "user_dev", sessionClaims: {} });
    prismaMock.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(imported);
    clerkMock.getUser.mockResolvedValue(clerkUserStub);
    clerkMock.getPrimaryEmail.mockReturnValue("potter@example.com");
    clerkMock.hasVerifiedPrimaryEmail.mockReturnValue(true);
    clerkMock.getFullName.mockReturnValue("Potter");
    clerkMock.getImageUrl.mockReturnValue(undefined);
    prismaMock.user.update.mockResolvedValue({
      ...imported,
      auth_id: "user_dev",
    });

    const request: FakeRequest = {};
    await authGuard.canActivate(createHttpExecutionContext({ request }));

    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 4 },
      data: { auth_id: "user_dev", name: "Potter", image: null },
    });
    expect(request.authenticatedUser).toEqual({
      db_user_id: 4,
      role: UserRole.USER,
      auth_id: "user_dev",
    });
  });

  it("refuses to hand over an existing row to an unverified address", async () => {
    // The email is someone else's and this account has not proved it owns it.
    const owner = makeUser({
      id: 4,
      auth_id: "user_prod",
      role: UserRole.ADMIN,
    });
    mockAuth({ isAuthenticated: true, userId: "user_evil", sessionClaims: {} });
    prismaMock.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(owner);
    clerkMock.getUser.mockResolvedValue(clerkUserStub);
    clerkMock.getPrimaryEmail.mockReturnValue("potter@example.com");
    clerkMock.hasVerifiedPrimaryEmail.mockReturnValue(false);
    clerkMock.getFullName.mockReturnValue("Potter");
    clerkMock.getImageUrl.mockReturnValue(undefined);

    await expect(
      authGuard.canActivate(createHttpExecutionContext({ request: {} })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(clerkMock.updatePublicMetadata).not.toHaveBeenCalled();
  });

  it("rejects when the Clerk profile has no email address", async () => {
    mockAuth({ isAuthenticated: true, userId: "user_9", sessionClaims: {} });
    prismaMock.user.findUnique.mockResolvedValue(null);
    clerkMock.getUser.mockResolvedValue(clerkUserStub);
    clerkMock.getPrimaryEmail.mockReturnValue(undefined);

    await expect(
      authGuard.canActivate(createHttpExecutionContext({ request: {} })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("caches the authentication for the lifetime of a single request", async () => {
    mockAuth({
      isAuthenticated: true,
      userId: "user_1",
      sessionClaims: { dbUserId: 1, role: UserRole.USER },
    });
    prismaMock.user.findUnique.mockResolvedValue(
      makeUser({ id: 1, auth_id: "user_1" }),
    );

    const context = createHttpExecutionContext({ request: {} });
    await authGuard.canActivate(context);
    await authGuard.canActivate(context);

    expect(getAuthMock).toHaveBeenCalledTimes(1);
    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
  });

  it("shares one optional sign-in check between every row resolver on a request", async () => {
    mockAuth({
      isAuthenticated: true,
      userId: "user_1",
      sessionClaims: { dbUserId: 1, role: UserRole.USER },
    });
    prismaMock.user.findUnique.mockResolvedValue(
      makeUser({ id: 1, auth_id: "user_1" }),
    );
    const request = {} as AppRequest;

    const users = await Promise.all(
      [1, 2, 3].map(() => authGuard.tryAuthenticate(request)),
    );

    expect(users.map((user) => user?.db_user_id)).toEqual([1, 1, 1]);
    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    await expect(authGuard.tryAuthenticate({} as AppRequest)).resolves.toEqual(
      users[0],
    );
    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(2);
  });

  it("answers an anonymous request with null and keeps unexpected failures", async () => {
    mockAuth({ isAuthenticated: false });
    await expect(
      authGuard.tryAuthenticate({} as AppRequest),
    ).resolves.toBeNull();

    mockAuth({ isAuthenticated: true, userId: "user_1", sessionClaims: {} });
    prismaMock.user.findUnique.mockRejectedValue(new Error("database down"));
    await expect(authGuard.tryAuthenticate({} as AppRequest)).rejects.toThrow(
      "database down",
    );
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
    prismaMock.user.findUnique.mockResolvedValue(
      makeUser({ id: 1, auth_id: "user_1", role: UserRole.ADMIN }),
    );

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
    prismaMock.user.findUnique.mockResolvedValue(
      makeUser({ id: 1, auth_id: "user_1" }),
    );

    await expect(
      adminGuard.canActivate(createHttpExecutionContext({ request: {} })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
