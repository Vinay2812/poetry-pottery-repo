import { Test } from "@nestjs/testing";
import { UserRole, type User } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "@/prisma/prisma.service";
import { MAX_PAGE_SIZE, UsersService } from "./users.service";

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

  describe("upsertUser", () => {
    it("passes the upsert through to prisma", async () => {
      const user = makeUser();
      prismaMock.user.upsert.mockResolvedValue(user);
      const input = {
        where: { auth_id: "user_1" },
        create: { auth_id: "user_1", email: user.email, name: user.name },
        update: { email: user.email, name: user.name },
      };

      await expect(service.upsertUser(input)).resolves.toEqual(user);
      expect(prismaMock.user.upsert).toHaveBeenCalledWith(input);
    });
  });
});
