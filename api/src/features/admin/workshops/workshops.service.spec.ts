import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { RegistrationStatus } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "@/prisma/prisma.service";
import { WorkshopsService } from "@/features/workshops/workshops.service";
import { missingRow } from "@test/helpers/prisma-errors";
import { UploadsService } from "../uploads/uploads.service";
import {
  AdminWorkshopsService,
  assertHours,
  assertTiersFit,
  assertWeekdays,
  assertTimezone,
} from "./workshops.service";

const containing = (value: Record<string, unknown>): unknown =>
  expect.objectContaining(value);

const notContaining = (value: Record<string, unknown>): unknown =>
  expect.not.objectContaining(value);

const anything = (): unknown => expect.anything();

const configRow = {
  id: 1,
  slug: "open-studio",
  name: "Open studio",
  description: null,
  image_url: null,
  is_active: true,
  timezone: "Asia/Kolkata",
  opening_minutes: 780,
  closing_minutes: 1140,
  slot_minutes: 60,
  capacity_per_slot: 6,
  booking_window_days: 60,
  slot_span_days: 1,
  closed_weekdays: [],
  tiers: [],
};

const bookingRow = {
  id: "WS-ABC1234567",
  config_id: 1,
  user_id: 7,
  starts_at: new Date("2026-10-01T08:00:00.000Z"),
  ends_at: new Date("2026-10-01T10:00:00.000Z"),
  hours: 2,
  participants: 2,
  price_per_person: 1200,
  pieces_per_person: 2,
  subtotal: 2400,
  discount: 0,
  total: 2400,
  status: RegistrationStatus.PENDING,
  note: null,
  cancel_reason: null,
  created_at: new Date(),
  approved_at: null,
  confirmed_at: null,
  rejected_at: null,
  cancelled_at: null,
  config: configRow,
  slots: [],
  user: { id: 7, name: "Maya", email: "maya@example.com", image: null },
};

const prismaMock = {
  workshopConfig: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
  },
  workshopPricingTier: { upsert: vi.fn(), delete: vi.fn() },
  workshopBlackout: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  workshopBooking: { findMany: vi.fn(), findUnique: vi.fn(), count: vi.fn() },
};
const workshopsMock = { applyStatus: vi.fn() };
const uploadsMock = { assertConfirmed: vi.fn() };

describe("assertTiersFit", () => {
  it("accepts tiers that are whole numbers of slots", () => {
    expect(() => assertTiersFit(30, [1, 2, 3])).not.toThrow();
    expect(() => assertTiersFit(90, [3])).not.toThrow();
  });

  it("refuses a tier that would run short or long of its hours", () => {
    expect(() => assertTiersFit(90, [2])).toThrow(
      "A 2-hour session does not divide into 90-minute slots",
    );
  });
});

describe("assertHours", () => {
  it("accepts a normal studio day", () => {
    expect(() =>
      assertHours({
        opening_minutes: 600,
        closing_minutes: 1200,
        slot_minutes: 60,
      }),
    ).not.toThrow();
  });

  it("refuses a day that closes before it opens", () => {
    expect(() =>
      assertHours({
        opening_minutes: 1200,
        closing_minutes: 600,
        slot_minutes: 60,
      }),
    ).toThrow(BadRequestException);
  });

  it("refuses a slot longer than the day", () => {
    expect(() =>
      assertHours({
        opening_minutes: 600,
        closing_minutes: 660,
        slot_minutes: 120,
      }),
    ).toThrow(BadRequestException);
  });
});

describe("assertWeekdays", () => {
  it("only accepts 0 to 6", () => {
    expect(() => assertWeekdays([0, 6])).not.toThrow();
    expect(() => assertWeekdays([7])).toThrow(BadRequestException);
  });
});

describe("assertTimezone", () => {
  it("accepts a zone the scheduler can format in", () => {
    expect(() => assertTimezone("Asia/Kolkata")).not.toThrow();
    expect(() => assertTimezone("UTC")).not.toThrow();
  });

  it("refuses a misspelled zone and an empty one", () => {
    expect(() => assertTimezone("Asia/Kolkatta")).toThrow(BadRequestException);
    expect(() => assertTimezone("")).toThrow(BadRequestException);
  });
});

describe("AdminWorkshopsService", () => {
  let service: AdminWorkshopsService;

  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock.workshopConfig.findMany.mockResolvedValue([configRow]);
    prismaMock.workshopConfig.findUnique.mockResolvedValue(configRow);
    prismaMock.workshopConfig.findUniqueOrThrow.mockResolvedValue(configRow);
    prismaMock.workshopConfig.update.mockResolvedValue(configRow);
    prismaMock.workshopPricingTier.upsert.mockResolvedValue({ id: 1 });
    prismaMock.workshopPricingTier.delete.mockResolvedValue({ id: 1 });
    prismaMock.workshopBlackout.create.mockResolvedValue({ id: 1 });
    prismaMock.workshopBlackout.update.mockResolvedValue({ id: 1 });
    prismaMock.workshopBlackout.delete.mockResolvedValue({ id: 1 });
    prismaMock.workshopBooking.findMany.mockResolvedValue([]);
    prismaMock.workshopBooking.count.mockResolvedValue(0);
    prismaMock.workshopBooking.findUnique.mockResolvedValue(bookingRow);
    workshopsMock.applyStatus.mockResolvedValue({
      ...bookingRow,
      status: RegistrationStatus.APPROVED,
    });
    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminWorkshopsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: WorkshopsService, useValue: workshopsMock },
        { provide: UploadsService, useValue: uploadsMock },
      ],
    }).compile();
    service = moduleRef.get(AdminWorkshopsService);
  });

  it("lists inactive studios too", async () => {
    await service.configs();

    expect(prismaMock.workshopConfig.findMany).toHaveBeenCalledWith(
      notContaining({ where: anything() }),
    );
  });

  it("saves the studio hours and closed weekdays", async () => {
    await service.updateConfig(1, {
      opening_minutes: 600,
      closing_minutes: 1200,
      closed_weekdays: [1],
      slot_span_days: 3,
    });

    expect(prismaMock.workshopConfig.update).toHaveBeenCalledWith(
      containing({
        data: containing({
          opening_minutes: 600,
          closing_minutes: 1200,
          closed_weekdays: [1],
          slot_span_days: 3,
        }),
      }),
    );
  });

  it("validates the new hours against the fields it is not changing", async () => {
    await expect(
      service.updateConfig(1, { closing_minutes: 700 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("refuses a capacity below one", async () => {
    await expect(
      service.updateConfig(1, { capacity_per_slot: 0 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("refuses a timezone the scheduler cannot read", async () => {
    await expect(
      service.updateConfig(1, { timezone: "Asia/Kolkatta" }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prismaMock.workshopConfig.update).not.toHaveBeenCalled();
  });

  it("saves a timezone the scheduler can read", async () => {
    await service.updateConfig(1, { timezone: " Europe/Lisbon " });

    expect(prismaMock.workshopConfig.update).toHaveBeenCalledWith(
      containing({ data: containing({ timezone: "Europe/Lisbon" }) }),
    );
  });

  it("reports a missing studio", async () => {
    prismaMock.workshopConfig.findUnique.mockResolvedValue(null);

    await expect(service.updateConfig(9, {})).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("upserts a pricing tier on its hours", async () => {
    await service.saveTier(1, {
      hours: 3,
      price_per_person: 2400,
      pieces_per_person: 3,
    });

    expect(prismaMock.workshopPricingTier.upsert).toHaveBeenCalledWith(
      containing({
        where: { config_id_hours: { config_id: 1, hours: 3 } },
      }),
    );
  });

  it("refuses a negative tier price", async () => {
    await expect(
      service.saveTier(1, {
        hours: 2,
        price_per_person: -1,
        pieces_per_person: 2,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("refuses a blackout that ends before it starts", async () => {
    await expect(
      service.createBlackout(1, {
        starts_at: new Date("2026-10-02"),
        ends_at: new Date("2026-10-01"),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("stores a blackout with a trimmed reason", async () => {
    prismaMock.workshopBlackout.create.mockResolvedValue({ id: 1 });

    await service.createBlackout(1, {
      starts_at: new Date("2026-10-01"),
      ends_at: new Date("2026-10-02"),
      reason: "  Diwali  ",
    });

    expect(prismaMock.workshopBlackout.create).toHaveBeenCalledWith(
      containing({
        data: containing({ reason: "Diwali" }),
      }),
    );
  });

  it("answers not found for a tier or blackout that is already gone", async () => {
    prismaMock.workshopPricingTier.delete.mockRejectedValue(missingRow());
    prismaMock.workshopBlackout.delete.mockRejectedValue(missingRow());

    await expect(service.deleteTier(9)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.deleteBlackout(9)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("answers not found when a tier is saved against a studio that went away", async () => {
    prismaMock.workshopPricingTier.upsert.mockRejectedValue(
      missingRow("P2003"),
    );

    await expect(
      service.saveTier(9, {
        hours: 2,
        price_per_person: 1200,
        pieces_per_person: 2,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("filters bookings by studio, status and date", async () => {
    const from = new Date("2026-10-01");

    await service.bookings({
      config_id: 1,
      status: RegistrationStatus.PENDING,
      from,
    });

    expect(prismaMock.workshopBooking.findMany).toHaveBeenCalledWith(
      containing({
        where: {
          config_id: 1,
          status: RegistrationStatus.PENDING,
          starts_at: { gte: from },
        },
      }),
    );
  });

  it("moves a booking through the shared transition, which mails the guest itself", async () => {
    const result = await service.setBookingStatus(
      bookingRow.id,
      RegistrationStatus.APPROVED,
      null,
    );

    expect(workshopsMock.applyStatus).toHaveBeenCalledWith(
      bookingRow,
      RegistrationStatus.APPROVED,
      null,
      "ADMIN",
    );
    expect(result.customer.email).toBe("maya@example.com");
  });
});
