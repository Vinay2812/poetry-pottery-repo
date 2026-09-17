import { Test } from "@nestjs/testing";
import { UserRole, type User } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "@/prisma/prisma.service";
import { MAX_PAGE_SIZE } from "@/common/pagination/pagination";
import { UsersService } from "./users.service";

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
  user: {
    findMany: vi.fn(),
    count: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  $executeRaw: vi.fn(),
  withTransaction: vi.fn(),
};

async function createService(): Promise<UsersService> {
  // resetAllMocks drops implementations, so the transaction passthrough is restored here.
  prismaMock.withTransaction.mockImplementation((fn: () => Promise<unknown>) =>
    fn(),
  );
  const moduleRef = await Test.createTestingModule({
    providers: [UsersService, { provide: PrismaService, useValue: prismaMock }],
  }).compile();
  return moduleRef.get(UsersService);
}

describe("UsersService", () => {
  let service: UsersService;

  beforeEach(async () => {
    vi.resetAllMocks();
    service = await createService();
  });

  describe("findPaginated", () => {
    it("returns items with pagination metadata", async () => {
      const user = makeUser();
      prismaMock.user.findMany.mockResolvedValue([user]);
      prismaMock.user.count.mockResolvedValue(1);

      const result = await service.findPaginated(1, 20);

      expect(result).toEqual({ items: [user], total: 1, page: 1, limit: 20 });
      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        orderBy: { created_at: "desc" },
      });
    });

    it("computes the skip offset from the page", async () => {
      prismaMock.user.findMany.mockResolvedValue([]);
      prismaMock.user.count.mockResolvedValue(0);

      await service.findPaginated(3, 10);

      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        skip: 20,
        take: 10,
        orderBy: { created_at: "desc" },
      });
    });

    it("clamps out-of-range pagination input", async () => {
      prismaMock.user.findMany.mockResolvedValue([]);
      prismaMock.user.count.mockResolvedValue(0);

      const result = await service.findPaginated(-5, 5000);

      expect(result.page).toBe(1);
      expect(result.limit).toBe(MAX_PAGE_SIZE);
    });
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
    };

    it("takes a lock on the auth id before it looks anything up", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(makeUser());

      await service.provisionUser(input);

      expect(prismaMock.withTransaction).toHaveBeenCalled();
      expect(prismaMock.$executeRaw).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.stringContaining("pg_advisory_xact_lock"),
        ]),
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
