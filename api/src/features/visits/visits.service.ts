import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { env } from "@/config/env";
import { MailService } from "@/mail/mail.service";
import { studioVisitMail } from "@/mail/templates/visits";
import { PrismaService } from "@/prisma/prisma.service";
import { normalisePhone } from "@/features/addresses/address-validation";
import {
  addDays,
  buildAvailability,
  checkSlots,
  type Occupant,
  type ScheduleConfig,
  toWallClock,
} from "@/features/workshops/schedule";
import type { StudioVisit, StudioVisitInput, VisitDay } from "./visits.type";

// Half an hour is long enough to see the studio and short enough to give away for free.
export const VISIT_SLOT_MINUTES = 30;
const VISIT_WINDOW_DAYS = 14;
const MAX_DAYS = 21;
const MINUTE = 60_000;

// Used when the studio has no wheel-session config to take its hours from.
const FALLBACK_HOURS = {
  timezone: "Asia/Kolkata",
  opening_minutes: 720,
  closing_minutes: 1140,
  closed_weekdays: [] as number[],
};

const visitSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be 80 characters or fewer"),
  phone: z
    .string()
    .trim()
    .transform((value, ctx) => {
      const phone = normalisePhone(value);
      if (phone === null) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a valid 10-digit phone number",
        });
        return z.NEVER;
      }
      return phone;
    }),
  note: z
    .string()
    .trim()
    .max(500, "Note must be 500 characters or fewer")
    .nullish()
    .transform((value) => value || null),
});

export type VisitFields = z.infer<typeof visitSchema>;

export function parseVisitInput(input: StudioVisitInput): VisitFields {
  const result = visitSchema.safeParse(input);
  if (!result.success) {
    throw new BadRequestException(
      result.error.issues[0]?.message ?? "Check the visit details",
    );
  }
  return result.data;
}

@Injectable()
export class VisitsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  // Visits run on the studio's own opening hours, one person per window.
  async config(): Promise<ScheduleConfig> {
    const studio = await this.prisma.workshopConfig.findFirst({
      where: { is_active: true },
      orderBy: { id: "asc" },
      select: {
        timezone: true,
        opening_minutes: true,
        closing_minutes: true,
        closed_weekdays: true,
      },
    });
    const hours = studio ?? FALLBACK_HOURS;
    return {
      timezone: hours.timezone,
      opening_minutes: hours.opening_minutes,
      closing_minutes: hours.closing_minutes,
      slot_minutes: VISIT_SLOT_MINUTES,
      capacity_per_slot: 1,
      booking_window_days: VISIT_WINDOW_DAYS,
      slot_span_days: 1,
      closed_weekdays: hours.closed_weekdays,
    };
  }

  async availability(
    from: string | null,
    days: number | null,
  ): Promise<VisitDay[]> {
    const config = await this.config();
    const now = new Date();
    const start = from ?? toWallClock(now, config.timezone).date;
    const span = Math.min(MAX_DAYS, Math.max(1, days ?? 7));
    const rangeStart = new Date(now.getTime() - MINUTE);
    const rangeEnd = new Date(
      Date.parse(`${addDays(start, span)}T00:00:00Z`) + 86_400_000,
    );
    const [blackouts, taken] = await Promise.all([
      this.prisma.workshopBlackout.findMany({
        where: { starts_at: { lt: rangeEnd }, ends_at: { gt: rangeStart } },
        select: { starts_at: true, ends_at: true, reason: true },
      }),
      this.occupants(rangeStart, rangeEnd),
    ]);

    return buildAvailability({
      config,
      from: start,
      days: span,
      now,
      blackouts,
      occupants: taken,
    }).map((day) => ({
      date: day.date,
      weekday: day.weekday,
      is_closed: day.is_closed,
      reason: day.reason,
      windows: day.slots.map((slot) => ({
        starts_at: slot.starts_at,
        ends_at: slot.ends_at,
        is_available: slot.is_available,
        reason: slot.reason,
      })),
    }));
  }

  async book(
    input: StudioVisitInput,
    userId: number | null,
  ): Promise<StudioVisit> {
    const fields = parseVisitInput(input);
    const startsAt = new Date(input.starts_at);
    if (Number.isNaN(startsAt.getTime())) {
      throw new BadRequestException("Pick a window from the calendar");
    }
    const config = await this.config();
    const endsAt = new Date(startsAt.getTime() + VISIT_SLOT_MINUTES * MINUTE);
    const blackouts = await this.prisma.workshopBlackout.findMany({
      where: { starts_at: { lt: endsAt }, ends_at: { gt: startsAt } },
      select: { starts_at: true, ends_at: true, reason: true },
    });
    // Hours, grid, lead time and blackouts are checked here; whether the window is free is
    // left to the unique start, so a taken window always comes back with the same sentence.
    const check = checkSlots(
      { slot_starts: [startsAt], participants: 1, hours: 0.5 },
      config,
      new Date(),
      blackouts,
      [],
    );
    if (!check.ok) throw new BadRequestException(check.reason);

    // The unique start is the whole race: two people reaching for one window, one insert wins.
    try {
      const visit = await this.prisma.studioVisit.create({
        data: {
          starts_at: startsAt,
          ends_at: endsAt,
          user_id: userId,
          ...fields,
        },
      });
      if (env.BUSINESS_EMAIL) {
        await this.mail.enqueue({
          to: env.BUSINESS_EMAIL,
          ...studioVisitMail(visit, config.timezone),
        });
      }
      return visit;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new BadRequestException(
          "Someone just took that window, pick another",
        );
      }
      throw error;
    }
  }

  private async occupants(from: Date, to: Date): Promise<Occupant[]> {
    const rows = await this.prisma.studioVisit.findMany({
      where: { starts_at: { lt: to }, ends_at: { gt: from } },
      select: { starts_at: true, ends_at: true },
    });
    return rows.map((row) => ({ ...row, participants: 1 }));
  }
}
