import { Test } from "@nestjs/testing";
import { UserRole, type User } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "@/prisma/prisma.service";
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
  user: { findUnique: vi.fn(), upsert: vi.fn() },
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
