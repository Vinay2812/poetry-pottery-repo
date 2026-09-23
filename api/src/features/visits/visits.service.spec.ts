import { BadRequestException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { Prisma } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { env } from "@/config/env";
import { MailService } from "@/mail/mail.service";
import { PrismaService } from "@/prisma/prisma.service";
import {
  addDays,
  fromWallClock,
  toWallClock,
} from "@/features/workshops/schedule";
import { VISIT_SLOT_MINUTES, VisitsService } from "./visits.service";
import type { StudioVisitInput } from "./visits.type";

// Vitest matchers are typed `any`; narrowing keeps the lint rule honest.
const containing = (value: Record<string, unknown>): unknown =>
  expect.objectContaining(value);

const prismaMock = {
  workshopConfig: { findFirst: vi.fn() },
  workshopBlackout: { findMany: vi.fn() },
  studioVisit: {
    findMany: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};
const mailMock = { enqueue: vi.fn<MailService["enqueue"]>() };

const NOW = new Date("2026-09-17T03:30:00.000Z");
const STUDIO = {
  timezone: "Asia/Kolkata",
  opening_minutes: 720,
  closing_minutes: 1140,
  closed_weekdays: [],
};

// A window two days out, on the opening grid, well clear of the lead time.
function window(offsetDays = 2, index = 0): Date {
  const today = toWallClock(NOW, STUDIO.timezone).date;
  return fromWallClock(
    addDays(today, offsetDays),
    STUDIO.opening_minutes + index * VISIT_SLOT_MINUTES,
    STUDIO.timezone,
  );
}

function input(overrides: Partial<StudioVisitInput> = {}): StudioVisitInput {
  return {
    starts_at: window(),
    name: "Maya",
    phone: "+91 91234-56789",
    ...overrides,
  };
}

describe("VisitsService", () => {
  let service: VisitsService;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    prismaMock.workshopConfig.findFirst.mockResolvedValue(STUDIO);
    prismaMock.workshopBlackout.findMany.mockResolvedValue([]);
    prismaMock.studioVisit.findMany.mockResolvedValue([]);
    const moduleRef = await Test.createTestingModule({
      providers: [
        VisitsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: MailService, useValue: mailMock },
      ],
    }).compile();
    service = moduleRef.get(VisitsService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("takes the studio's own hours, in half-hour windows, one visitor each", async () => {
    await expect(service.config()).resolves.toMatchObject({
      timezone: "Asia/Kolkata",
      opening_minutes: 720,
      closing_minutes: 1140,
      slot_minutes: VISIT_SLOT_MINUTES,
      capacity_per_slot: 1,
    });
  });

  it("falls back to sensible hours when no wheel session is configured", async () => {
    prismaMock.workshopConfig.findFirst.mockResolvedValue(null);

    await expect(service.config()).resolves.toMatchObject({
      timezone: "Asia/Kolkata",
      capacity_per_slot: 1,
    });
  });

  it("lays the day out in half hours between opening and closing", async () => {
    const days = await service.availability(null, 1);

    expect(days).toHaveLength(1);
    // 12:00 to 19:00 in half hours.
    expect(days[0]?.windows).toHaveLength(14);
  });

  it("turns away a date it cannot read instead of failing on it", async () => {
    // An omitted argument arrives as undefined and means today, like null.
    await expect(service.availability(undefined, 1)).resolves.toHaveLength(1);
    await expect(service.availability("today", 1)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.availability("2026-13-40", 1)).rejects.toThrow(
      "from must be a YYYY-MM-DD date",
    );
  });

  it("closes a window someone has already taken", async () => {
    const taken = window(1, 0);
    prismaMock.studioVisit.findMany.mockResolvedValue([
      {
        starts_at: taken,
        ends_at: new Date(taken.getTime() + VISIT_SLOT_MINUTES * 60_000),
      },
    ]);

    const days = await service.availability(
      toWallClock(taken, STUDIO.timezone).date,
      1,
    );
    const match = days[0]?.windows.find(
      (slot) => slot.starts_at.getTime() === taken.getTime(),
    );

    expect(match?.is_available).toBe(false);
    expect(match?.reason).toBe("Fully booked");
  });

  it("books a window and tells the studio someone is coming", async () => {
    const starts = window();
    const row = {
      id: "visit1",
      starts_at: starts,
      ends_at: new Date(starts.getTime() + VISIT_SLOT_MINUTES * 60_000),
      name: "Maya",
      phone: "9123456789",
      note: null,
      user_id: null,
      created_at: NOW,
    };
    prismaMock.studioVisit.create.mockResolvedValue(row);
    env.BUSINESS_EMAIL = "studio@example.com";

    try {
      await expect(service.book(input(), 7)).resolves.toBe(row);
    } finally {
      env.BUSINESS_EMAIL = undefined;
    }

    expect(prismaMock.studioVisit.create).toHaveBeenCalledWith({
      data: containing({ phone: "9123456789", user_id: 7 }),
    });
    expect(mailMock.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ to: "studio@example.com" }),
    );
  });

  it("refuses a time that is not on the half-hour grid", async () => {
    await expect(
      service.book(
        input({ starts_at: new Date(window().getTime() + 7 * 60_000) }),
        null,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prismaMock.studioVisit.create).not.toHaveBeenCalled();
  });

  it("refuses a time outside the studio's hours", async () => {
    const today = toWallClock(NOW, STUDIO.timezone).date;
    await expect(
      service.book(
        input({
          starts_at: fromWallClock(addDays(today, 2), 1140, STUDIO.timezone),
        }),
        null,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("refuses a phone number that is not ten Indian digits", async () => {
    await expect(
      service.book(input({ phone: "12345" }), null),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("turns the lost half of a race into a sentence a visitor can act on", async () => {
    prismaMock.studioVisit.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("unique", {
        code: "P2002",
        clientVersion: "7",
      }),
    );

    await expect(service.book(input(), null)).rejects.toThrow(
      "Someone just took that window, pick another",
    );
  });

  describe("cancel", () => {
    const visit = {
      id: "VIS123",
      starts_at: window(),
      ends_at: window(),
      name: "Maya",
      phone: "9123456789",
      note: null,
      cancelled_at: null,
      user_id: 7,
      created_at: NOW,
    };

    it("stamps the cancellation and mails the visitor who signed in", async () => {
      prismaMock.studioVisit.findUnique.mockResolvedValue({
        ...visit,
        user: { email: "maya@example.com" },
      });
      prismaMock.studioVisit.update.mockResolvedValue({
        ...visit,
        cancelled_at: NOW,
      });

      await service.cancel("VIS123", "  The kiln is running  ");

      expect(prismaMock.studioVisit.update).toHaveBeenCalledWith(
        containing({ where: { id: "VIS123" } }),
      );
      const call = prismaMock.studioVisit.update.mock.calls[0]?.[0] as {
        data: { cancelled_at: Date };
      };
      expect(call.data.cancelled_at).toBeInstanceOf(Date);
      expect(mailMock.enqueue).toHaveBeenCalledWith(
        containing({ to: "maya@example.com" }),
      );
    });

    it("says nothing to a visitor who left no address", async () => {
      prismaMock.studioVisit.findUnique.mockResolvedValue({
        ...visit,
        user_id: null,
        user: null,
      });
      prismaMock.studioVisit.update.mockResolvedValue({
        ...visit,
        cancelled_at: NOW,
      });

      await service.cancel("VIS123", null);

      expect(
        mailMock.enqueue.mock.calls.every(
          ([message]) => message.to !== "maya@example.com",
        ),
      ).toBe(true);
    });

    it("leaves an already cancelled window alone", async () => {
      prismaMock.studioVisit.findUnique.mockResolvedValue({
        ...visit,
        cancelled_at: NOW,
        user: { email: "maya@example.com" },
      });

      await service.cancel("VIS123", null);

      expect(prismaMock.studioVisit.update).not.toHaveBeenCalled();
      expect(mailMock.enqueue).not.toHaveBeenCalled();
    });

    it("stops counting a cancelled window as taken", async () => {
      prismaMock.studioVisit.findMany.mockResolvedValue([]);

      await service.availability(null, 1);

      expect(prismaMock.studioVisit.findMany).toHaveBeenCalledWith(
        containing({ where: containing({ cancelled_at: null }) }),
      );
    });
  });
});
