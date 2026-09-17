import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "@/prisma/prisma.service";
import { AddressesService } from "./addresses.service";
import type { AddressInput } from "./addresses.type";

const containing = (value: Record<string, unknown>): unknown =>
  expect.objectContaining(value);

const prismaMock = {
  withTransaction: vi.fn((fn: () => Promise<unknown>) => fn()),
  address: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
  },
};

function row(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    user_id: 1,
    name: "Maya Iyer",
    phone: "9876543210",
    line1: "12 Kiln Lane",
    line2: null,
    landmark: null,
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
    is_default: false,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

function input(overrides: Partial<AddressInput> = {}): AddressInput {
  return {
    name: "Maya Iyer",
    phone: "+91 98765 43210",
    line1: "12 Kiln Lane",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
    ...overrides,
  };
}

describe("AddressesService", () => {
  let service: AddressesService;

  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock.address.create.mockResolvedValue(row());
    prismaMock.address.update.mockResolvedValue(row());
    const moduleRef = await Test.createTestingModule({
      providers: [
        AddressesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = moduleRef.get(AddressesService);
  });

  it("lists the default first and drops the columns the client never sees", async () => {
    prismaMock.address.findMany.mockResolvedValue([row({ is_default: true })]);

    const addresses = await service.list(1);

    expect(prismaMock.address.findMany).toHaveBeenCalledWith(
      containing({
        orderBy: [{ is_default: "desc" }, { created_at: "desc" }],
      }),
    );
    expect(addresses[0]).not.toHaveProperty("user_id");
  });

  it("makes the first address the default and stores normalised fields", async () => {
    prismaMock.address.count.mockResolvedValue(0);

    await service.create(1, input());

    expect(prismaMock.address.create).toHaveBeenCalledWith({
      data: containing({
        user_id: 1,
        phone: "9876543210",
        is_default: true,
      }),
    });
  });

  it("leaves later addresses alone unless the flag is asked for", async () => {
    prismaMock.address.count.mockResolvedValue(2);

    await service.create(1, input());
    expect(prismaMock.address.updateMany).not.toHaveBeenCalled();
    expect(prismaMock.address.create).toHaveBeenCalledWith({
      data: containing({ is_default: false }),
    });

    await service.create(1, input({ is_default: true }));
    expect(prismaMock.address.updateMany).toHaveBeenCalledWith(
      containing({ data: { is_default: false } }),
    );
  });

  it("refuses to touch an address owned by someone else", async () => {
    prismaMock.address.findFirst.mockResolvedValue(null);

    await expect(service.update(1, 9, input())).rejects.toThrow("not found");
    await expect(service.remove(1, 9)).rejects.toThrow("not found");
    await expect(service.setDefault(1, 9)).rejects.toThrow("not found");
    expect(prismaMock.address.delete).not.toHaveBeenCalled();
  });

  it("keeps the edited address default once it already is", async () => {
    prismaMock.address.findFirst.mockResolvedValue(row({ is_default: true }));

    await service.update(1, 1, input());

    expect(prismaMock.address.updateMany).toHaveBeenCalledWith(
      containing({
        where: containing({ id: { not: 1 } }),
      }),
    );
    expect(prismaMock.address.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: containing({ is_default: true }),
    });
  });

  it("promotes the newest remaining address when the default is deleted", async () => {
    prismaMock.address.findFirst
      .mockResolvedValueOnce(row({ id: 1, is_default: true }))
      .mockResolvedValueOnce(row({ id: 5 }));

    await expect(service.remove(1, 1)).resolves.toBe(true);

    expect(prismaMock.address.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(prismaMock.address.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: { is_default: true },
    });
  });

  it("promotes nothing when a non-default address is deleted", async () => {
    prismaMock.address.findFirst.mockResolvedValue(row({ id: 2 }));

    await service.remove(1, 2);

    expect(prismaMock.address.update).not.toHaveBeenCalled();
  });

  it("clears the other defaults when one is chosen", async () => {
    prismaMock.address.findFirst.mockResolvedValue(row({ id: 3 }));
    prismaMock.address.update.mockResolvedValue(
      row({ id: 3, is_default: true }),
    );

    const address = await service.setDefault(1, 3);

    expect(prismaMock.address.updateMany).toHaveBeenCalledWith({
      where: { user_id: 1, is_default: true, id: { not: 3 } },
      data: { is_default: false },
    });
    expect(address.is_default).toBe(true);
  });
});
