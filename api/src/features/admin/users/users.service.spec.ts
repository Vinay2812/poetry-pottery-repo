import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ClerkService } from "@/common/clerk/clerk.service";
import { PrismaService } from "@/prisma/prisma.service";
import { AdminUsersService } from "./users.service";

const row = {
  id: 7,
  auth_id: "user_7",
  name: "Maya",
  email: "maya@example.com",
  image: null,
  phone: "9123456789",
  role: UserRole.USER,
  created_at: new Date(),
  _count: {
    orders: 3,
    workshop_bookings: 1,
    event_registrations: 2,
    reviews: 4,
  },
};

const prismaMock = {
  user: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  },
  $executeRaw: vi.fn(),
  withTransaction: vi.fn((fn: () => Promise<unknown>) => fn()),
};

const clerkMock = { updatePublicMetadata: vi.fn(() => Promise.resolve()) };

describe("AdminUsersService", () => {
  let service: AdminUsersService;

  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock.user.findMany.mockResolvedValue([row]);
    prismaMock.user.count.mockResolvedValue(1);
    prismaMock.user.findUnique.mockResolvedValue(row);
    prismaMock.user.update.mockResolvedValue({ ...row, role: UserRole.ADMIN });
    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminUsersService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ClerkService, useValue: clerkMock },
      ],
    }).compile();
    service = moduleRef.get(AdminUsersService);
  });

  it("lists people with their order, booking and review counts", async () => {
    const result = await service.list({});

    expect(result.items[0]).toMatchObject({
      orders_count: 3,
      bookings_count: 1,
      registrations_count: 2,
      reviews_count: 4,
    });
    expect(result.page_info.total).toBe(1);
  });

  it("searches email, name and phone", async () => {
    await service.list({ search: "maya" });

    const call = prismaMock.user.findMany.mock.calls[0]?.[0] as {
      where: { OR: unknown[] };
    };
    expect(call.where.OR).toHaveLength(3);
  });

  it("filters by role", async () => {
    await service.list({ role: UserRole.ADMIN });

    expect(prismaMock.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { role: UserRole.ADMIN } }),
    );
  });

  it("promotes someone to admin", async () => {
    await service.setRole(7, UserRole.ADMIN, 1);

    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 7 },
        data: { role: UserRole.ADMIN },
      }),
    );
  });

  it("refuses to let an admin demote themselves", async () => {
    await expect(service.setRole(7, UserRole.USER, 7)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("refuses to demote the only admin", async () => {
    prismaMock.user.count.mockResolvedValue(0);

    await expect(service.setRole(7, UserRole.USER, 1)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prismaMock.user.count).toHaveBeenCalledWith({
      where: { role: UserRole.ADMIN, id: { not: 7 } },
    });
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("demotes an admin while another remains", async () => {
    prismaMock.user.count.mockResolvedValue(1);

    await service.setRole(7, UserRole.USER, 1);

    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { role: UserRole.USER } }),
    );
  });

  it("still allows an admin to reassert their own admin role", async () => {
    await expect(service.setRole(7, UserRole.ADMIN, 7)).resolves.toMatchObject({
      role: UserRole.ADMIN,
    });
  });

  it("takes the role-change lock and refreshes the Clerk metadata the dashboard reads", async () => {
    await service.setRole(7, UserRole.ADMIN, 1);

    expect(prismaMock.withTransaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1);
    expect(clerkMock.updatePublicMetadata).toHaveBeenCalledWith("user_7", {
      dbUserId: 7,
      role: UserRole.ADMIN,
    });
  });

  it("keeps the role change when Clerk cannot be reached", async () => {
    clerkMock.updatePublicMetadata.mockRejectedValueOnce(new Error("429"));

    await expect(service.setRole(7, UserRole.ADMIN, 1)).resolves.toMatchObject({
      role: UserRole.ADMIN,
    });
  });

  it("reports a missing person", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(service.byId(99)).rejects.toBeInstanceOf(NotFoundException);
  });
});
