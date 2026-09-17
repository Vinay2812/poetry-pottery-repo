import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { CouponKind } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "@/prisma/prisma.service";
import { missingRow } from "@test/helpers/prisma-errors";
import { AdminCouponsService, parseCoupon } from "./coupons.service";

const containing = (value: Record<string, unknown>): unknown =>
  expect.objectContaining(value);

const row = {
  id: 1,
  code: "MONSOON10",
  kind: CouponKind.PERCENT,
  value: 10,
  min_order: 0,
  max_uses: null,
  uses_count: 0,
  starts_at: null,
  expires_at: null,
  is_active: true,
  created_at: new Date(),
};

const prismaMock = {
  coupon: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

function input(overrides: Record<string, unknown> = {}) {
  return {
    code: "monsoon10",
    kind: CouponKind.PERCENT,
    value: 10,
    ...overrides,
  };
}

describe("parseCoupon", () => {
  it("upper-cases the code", () => {
    expect(parseCoupon(input()).code).toBe("MONSOON10");
  });

  it("refuses a code that is too short or has odd characters", () => {
    expect(() => parseCoupon(input({ code: "ab" }))).toThrow(
      BadRequestException,
    );
    expect(() => parseCoupon(input({ code: "ten off!" }))).toThrow(
      BadRequestException,
    );
  });

  it("caps a percentage at 100 and rejects a worthless code", () => {
    expect(() => parseCoupon(input({ value: 120 }))).toThrow(
      BadRequestException,
    );
    expect(() => parseCoupon(input({ value: 0 }))).toThrow(BadRequestException);
  });

  it("allows a fixed code above 100 rupees", () => {
    expect(
      parseCoupon(input({ kind: CouponKind.FIXED, value: 300 })).value,
    ).toBe(300);
  });

  it("refuses a negative minimum and a use limit below one", () => {
    expect(() => parseCoupon(input({ min_order: -1 }))).toThrow(
      BadRequestException,
    );
    expect(() => parseCoupon(input({ max_uses: 0 }))).toThrow(
      BadRequestException,
    );
  });

  it("refuses a window that expires before it starts", () => {
    expect(() =>
      parseCoupon(
        input({
          starts_at: new Date("2026-10-01"),
          expires_at: new Date("2026-09-01"),
        }),
      ),
    ).toThrow(BadRequestException);
  });

  it("defaults to active with no limits", () => {
    expect(parseCoupon(input())).toMatchObject({
      min_order: 0,
      max_uses: null,
      is_active: true,
    });
  });
});

describe("AdminCouponsService", () => {
  let service: AdminCouponsService;

  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock.coupon.findMany.mockResolvedValue([row]);
    prismaMock.coupon.count.mockResolvedValue(1);
    prismaMock.coupon.findUnique.mockResolvedValue(row);
    prismaMock.coupon.create.mockResolvedValue(row);
    prismaMock.coupon.delete.mockResolvedValue(row);
    prismaMock.coupon.update.mockResolvedValue(row);
    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminCouponsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = moduleRef.get(AdminCouponsService);
  });

  it("searches codes case-insensitively by upper-casing the term", async () => {
    await service.list({ search: "monsoon" });

    expect(prismaMock.coupon.findMany).toHaveBeenCalledWith(
      containing({
        where: { code: { contains: "MONSOON" } },
      }),
    );
  });

  it("creates a code with normalised fields", async () => {
    await service.create(input());

    expect(prismaMock.coupon.create).toHaveBeenCalledWith({
      data: containing({ code: "MONSOON10", value: 10 }),
    });
  });

  it("never writes uses_count from the edit form", async () => {
    await service.update(1, input({ value: 15 }));

    const data = (
      prismaMock.coupon.update.mock.calls[0]?.[0] as {
        data: Record<string, unknown>;
      }
    ).data;
    expect(data).not.toHaveProperty("uses_count");
  });

  it("reports a missing code", async () => {
    prismaMock.coupon.findUnique.mockResolvedValue(null);

    await expect(service.update(9, input())).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("deletes a code", async () => {
    await expect(service.remove(1)).resolves.toBe(true);
  });

  it("answers not found when the code was already deleted", async () => {
    prismaMock.coupon.delete.mockRejectedValue(missingRow());

    await expect(service.remove(1)).rejects.toBeInstanceOf(NotFoundException);
  });
});
