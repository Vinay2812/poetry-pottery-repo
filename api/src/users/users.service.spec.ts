import { Test } from "@nestjs/testing";
import { AuthProvider, Role, type User } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "@/prisma/prisma.service";
import { MAX_PAGE_SIZE, UsersService } from "./users.service";

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

const prismaMock = {
  user: {
    findMany: vi.fn(),
    count: vi.fn(),
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
};

async function createService(): Promise<UsersService> {
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
        orderBy: { createdAt: "desc" },
      });
    });

    it("computes the skip offset from the page", async () => {
      prismaMock.user.findMany.mockResolvedValue([]);
      prismaMock.user.count.mockResolvedValue(0);

      await service.findPaginated(3, 10);

      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        skip: 20,
        take: 10,
        orderBy: { createdAt: "desc" },
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
    it("looks the user up by the composite unique key", async () => {
      const user = makeUser();
      prismaMock.user.findUnique.mockResolvedValue(user);

      await expect(
        service.findByAuth(AuthProvider.CLERK, "user_1"),
      ).resolves.toEqual(user);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: {
          authProvider_authId: {
            authProvider: AuthProvider.CLERK,
            authId: "user_1",
          },
        },
      });
    });
  });

  describe("provisionFromAuth", () => {
    it("returns the existing user without loading a profile", async () => {
      const user = makeUser();
      prismaMock.user.findUnique.mockResolvedValue(user);
      const loadProfile = vi.fn();

      const result = await service.provisionFromAuth({
        provider: AuthProvider.CLERK,
        authId: "user_1",
        loadProfile,
      });

      expect(result).toEqual(user);
      expect(loadProfile).not.toHaveBeenCalled();
      expect(prismaMock.user.upsert).not.toHaveBeenCalled();
    });

    it("provisions a new user with the USER role on first sight", async () => {
      const created = makeUser({ id: 7, authId: "user_7" });
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.upsert.mockResolvedValue(created);
      const loadProfile = vi
        .fn()
        .mockResolvedValue({ email: "potter@example.com", name: "Potter" });

      const result = await service.provisionFromAuth({
        provider: AuthProvider.CLERK,
        authId: "user_7",
        loadProfile,
      });

      expect(result).toEqual(created);
      expect(loadProfile).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.upsert).toHaveBeenCalledWith({
        where: {
          authProvider_authId: {
            authProvider: AuthProvider.CLERK,
            authId: "user_7",
          },
        },
        create: {
          authProvider: AuthProvider.CLERK,
          authId: "user_7",
          email: "potter@example.com",
          name: "Potter",
          role: Role.USER,
        },
        update: { email: "potter@example.com", name: "Potter" },
      });
    });
  });
});
