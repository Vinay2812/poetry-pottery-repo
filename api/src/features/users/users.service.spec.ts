import { UnauthorizedException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { UserRole, type User } from "@prisma/client";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LockNamespace } from "@/prisma/lock";
import { PrismaService } from "@/prisma/prisma.service";
import { EMAIL_TAKEN_MESSAGE, UsersService } from "./users.service";

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

const prismaMock = {
  user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  $executeRaw: vi.fn(),
  withTransaction: vi.fn(),
  afterCommit: vi.fn(),
  lock: vi.fn(),
};

const loggerMock = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

async function createService(): Promise<UsersService> {
  // resetAllMocks drops implementations, so the transaction passthrough is restored here.
  prismaMock.withTransaction.mockImplementation((fn: () => Promise<unknown>) =>
    fn(),
  );
  const moduleRef = await Test.createTestingModule({
    providers: [
      UsersService,
      { provide: PrismaService, useValue: prismaMock },
      { provide: WINSTON_MODULE_PROVIDER, useValue: loggerMock },
    ],
  }).compile();
  return moduleRef.get(UsersService);
}

describe("UsersService", () => {
  let service: UsersService;

  beforeEach(async () => {
    vi.resetAllMocks();
    service = await createService();
  });

  describe("findByAuth", () => {
    it("looks the user up by the unique auth id", async () => {
      const user = makeUser();
      prismaMock.user.findUnique.mockResolvedValue(user);

      await expect(service.findByAuth("user_1")).resolves.toEqual(user);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { auth_id: "user_1" },
      });
    });
  });

  describe("provisionUser", () => {
    const input = {
      auth_id: "user_dev",
      email: "potter@example.com",
      name: "Potter",
      image: null,
      can_adopt: true,
    };

    it("takes a lock on the auth id before it looks anything up", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(makeUser());

      await service.provisionUser(input);

      expect(prismaMock.withTransaction).toHaveBeenCalled();
      expect(prismaMock.lock).toHaveBeenCalledWith(
        LockNamespace.USER_PROVISION,
        "user_dev",
      );
    });

    it("creates a row when neither the auth id nor the email is known", async () => {
      const created = makeUser({ id: 9, auth_id: "user_dev" });
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(created);

      await expect(service.provisionUser(input)).resolves.toEqual(created);
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          auth_id: "user_dev",
          email: "potter@example.com",
          name: "Potter",
          image: null,
        },
      });
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it("adopts the imported row when only the email matches, keeping its role", async () => {
      // The imported row carries the production Clerk id; this sign-in is a dev instance one.
      const imported = makeUser({
        id: 4,
        auth_id: "user_prod",
        role: UserRole.ADMIN,
      });
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(imported);
      prismaMock.user.update.mockResolvedValue({
        ...imported,
        auth_id: "user_dev",
      });

      const result = await service.provisionUser(input);

      expect(prismaMock.user.findUnique).toHaveBeenNthCalledWith(1, {
        where: { auth_id: "user_dev" },
      });
      expect(prismaMock.user.findUnique).toHaveBeenNthCalledWith(2, {
        where: { email: "potter@example.com" },
      });
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 4 },
        data: { auth_id: "user_dev", name: "Potter", image: null },
      });
      expect(prismaMock.user.create).not.toHaveBeenCalled();
      expect(result.role).toBe(UserRole.ADMIN);
      expect(loggerMock.info).toHaveBeenCalledWith(
        "adopted a user row by verified email",
        expect.objectContaining({ user_id: 4, previous_auth_id: "user_prod" }),
      );
    });

    it("refuses to adopt a row when the email is not a verified primary one", async () => {
      // Signing up with someone else's address must never hand over their account.
      const owner = makeUser({ id: 4, role: UserRole.ADMIN });
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(owner);

      const failure: unknown = await service
        .provisionUser({ ...input, can_adopt: false })
        .catch((error: unknown) => error);

      expect(failure).toBeInstanceOf(UnauthorizedException);
      expect(failure).toHaveProperty("message", EMAIL_TAKEN_MESSAGE);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
      expect(prismaMock.user.create).not.toHaveBeenCalled();
      expect(loggerMock.warn).toHaveBeenCalled();
    });

    it("refreshes the profile when the auth id is already known", async () => {
      const existing = makeUser({ id: 2, auth_id: "user_dev" });
      prismaMock.user.findUnique.mockResolvedValueOnce(existing);
      prismaMock.user.update.mockResolvedValue(existing);

      await expect(service.provisionUser(input)).resolves.toEqual(existing);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: {
          email: "potter@example.com",
          name: "Potter",
          image: null,
        },
      });
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    });
  });
});
