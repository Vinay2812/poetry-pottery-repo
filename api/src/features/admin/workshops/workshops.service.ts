import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, RegistrationStatus } from "@prisma/client";

import { clampPage, toPageInfo } from "@/common/pagination/pagination";
import { PrismaService } from "@/prisma/prisma.service";
import { canTransition } from "@/features/events/registration-status";
import {
  bookingInclude,
  configInclude,
  toBooking,
  toConfig,
  WorkshopsService,
} from "@/features/workshops/workshops.service";
import type { WorkshopConfig } from "@/features/workshops/workshops.type";
import { searchTerm, toUserRef, trimmed } from "../admin.type";
import { rethrowMissing } from "../missing-row";
import { UploadsService } from "../uploads/uploads.service";
import { UploadPurpose } from "../uploads/uploads.type";
import type {
  AdminWorkshopBlackout,
  AdminWorkshopBlackoutInput,
  AdminWorkshopBooking,
  AdminWorkshopBookingsFilterInput,
  AdminWorkshopBookingsResult,
  AdminWorkshopConfigInput,
  AdminWorkshopTierInput,
} from "./workshops.type";

const MAX_LIMIT = 60;
const DAY_MINUTES = 24 * 60;

const adminBookingInclude = {
  ...bookingInclude,
  user: { select: { id: true, name: true, email: true, image: true } },
} satisfies Prisma.WorkshopBookingInclude;

type AdminBookingRow = Prisma.WorkshopBookingGetPayload<{
  include: typeof adminBookingInclude;
}>;

export function toAdminBooking(
  row: AdminBookingRow,
  now = new Date(),
): AdminWorkshopBooking {
  return {
    booking: toBooking(row, now),
    customer: toUserRef(row.user),
    next_statuses: Object.values(RegistrationStatus).filter((to) =>
      canTransition(row.status, to),
    ),
  };
}

// The studio day has to hold at least one slot, and a slot has to fit inside it.
export function assertHours(input: {
  opening_minutes: number;
  closing_minutes: number;
  slot_minutes: number;
}): void {
  const { opening_minutes, closing_minutes, slot_minutes } = input;
  if (opening_minutes < 0 || closing_minutes > DAY_MINUTES) {
    throw new BadRequestException("Opening hours must sit inside one day");
  }
  if (closing_minutes <= opening_minutes) {
    throw new BadRequestException("The studio must close after it opens");
  }
  if (slot_minutes < 15 || slot_minutes > closing_minutes - opening_minutes) {
    throw new BadRequestException(
      "A slot must be at least 15 minutes and fit inside the studio day",
    );
  }
}

export function assertWeekdays(days: readonly number[]): void {
  if (days.some((day) => !Number.isInteger(day) || day < 0 || day > 6)) {
    throw new BadRequestException("Closed weekdays run from 0 to 6");
  }
}

// The scheduler formats every slot in this zone, so a typo here would turn every availability,
// booking and status call for the studio into a RangeError.
export function assertTimezone(value: string): void {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date());
  } catch {
    throw new BadRequestException(
      "Timezone must be an IANA name such as Asia/Kolkata",
    );
  }
}

@Injectable()
export class AdminWorkshopsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workshops: WorkshopsService,
    private readonly uploads: UploadsService,
  ) {}

  // Inactive studios still show in the console so they can be switched back on.
  async configs(): Promise<WorkshopConfig[]> {
    const rows = await this.prisma.workshopConfig.findMany({
      include: configInclude,
      orderBy: { id: "asc" },
    });
    return rows.map(toConfig);
  }

  async updateConfig(
    id: number,
    input: AdminWorkshopConfigInput,
  ): Promise<WorkshopConfig> {
    const current = await this.prisma.workshopConfig.findUnique({
      where: { id },
      include: configInclude,
    });
    if (!current) {
      throw new NotFoundException("Workshop not found");
    }
    assertHours({
      opening_minutes: input.opening_minutes ?? current.opening_minutes,
      closing_minutes: input.closing_minutes ?? current.closing_minutes,
      slot_minutes: input.slot_minutes ?? current.slot_minutes,
    });
    if (input.closed_weekdays) {
      assertWeekdays(input.closed_weekdays);
    }
    const timezone = input.timezone?.trim();
    if (timezone != null) {
      assertTimezone(timezone);
    }
    this.assertPositive(input.capacity_per_slot, "Capacity");
    this.assertPositive(input.booking_window_days, "The booking window");
    this.assertPositive(input.slot_span_days, "The slot span");

    const image_url = input.image_url?.trim() || null;
    if (input.image_url !== undefined) {
      await this.uploads.assertConfirmed(
        image_url ? [image_url] : [],
        current.image_url ? [current.image_url] : [],
        UploadPurpose.HERO,
      );
    }

    const row = await this.prisma.workshopConfig.update({
      where: { id },
      data: {
        ...(input.name == null ? {} : { name: input.name.trim() }),
        ...(input.description === undefined
          ? {}
          : { description: input.description?.trim() || null }),
        ...(input.image_url === undefined ? {} : { image_url }),
        ...(input.is_active == null ? {} : { is_active: input.is_active }),
        ...(timezone == null ? {} : { timezone }),
        ...(input.opening_minutes == null
          ? {}
          : { opening_minutes: input.opening_minutes }),
        ...(input.closing_minutes == null
          ? {}
          : { closing_minutes: input.closing_minutes }),
        ...(input.slot_minutes == null
          ? {}
          : { slot_minutes: input.slot_minutes }),
        ...(input.capacity_per_slot == null
          ? {}
          : { capacity_per_slot: input.capacity_per_slot }),
        ...(input.booking_window_days == null
          ? {}
          : { booking_window_days: input.booking_window_days }),
        ...(input.slot_span_days == null
          ? {}
          : { slot_span_days: input.slot_span_days }),
        ...(input.closed_weekdays
          ? { closed_weekdays: input.closed_weekdays }
          : {}),
      },
      include: configInclude,
    });
    return toConfig(row);
  }

  // Tiers are keyed by hours, so saving the same length twice edits it rather than duplicating.
  async saveTier(
    configId: number,
    input: AdminWorkshopTierInput,
  ): Promise<WorkshopConfig> {
    if (!Number.isInteger(input.hours) || input.hours < 1) {
      throw new BadRequestException("A tier must last at least one hour");
    }
    if (input.price_per_person < 0 || input.pieces_per_person < 0) {
      throw new BadRequestException(
        "Tier prices and pieces cannot be negative",
      );
    }
    await this.prisma.workshopPricingTier
      .upsert({
        where: { config_id_hours: { config_id: configId, hours: input.hours } },
        create: { config_id: configId, ...input },
        update: {
          price_per_person: input.price_per_person,
          pieces_per_person: input.pieces_per_person,
        },
      })
      .catch(rethrowMissing("Workshop not found"));
    return this.configById(configId);
  }

  async deleteTier(id: number): Promise<boolean> {
    await this.prisma.workshopPricingTier
      .delete({ where: { id } })
      .catch(rethrowMissing("Tier not found"));
    return true;
  }

  blackouts(configId: number): Promise<AdminWorkshopBlackout[]> {
    return this.prisma.workshopBlackout.findMany({
      where: { config_id: configId },
      orderBy: { starts_at: "asc" },
      select: {
        id: true,
        config_id: true,
        starts_at: true,
        ends_at: true,
        reason: true,
      },
    });
  }

  async createBlackout(
    configId: number,
    input: AdminWorkshopBlackoutInput,
  ): Promise<AdminWorkshopBlackout> {
    this.assertBlackout(input);
    return await this.prisma.workshopBlackout
      .create({
        data: {
          config_id: configId,
          starts_at: input.starts_at,
          ends_at: input.ends_at,
          reason: trimmed(input.reason, 200),
        },
        select: {
          id: true,
          config_id: true,
          starts_at: true,
          ends_at: true,
          reason: true,
        },
      })
      .catch(rethrowMissing("Workshop not found"));
  }

  async updateBlackout(
    id: number,
    input: AdminWorkshopBlackoutInput,
  ): Promise<AdminWorkshopBlackout> {
    this.assertBlackout(input);
    return await this.prisma.workshopBlackout
      .update({
        where: { id },
        data: {
          starts_at: input.starts_at,
          ends_at: input.ends_at,
          reason: trimmed(input.reason, 200),
        },
        select: {
          id: true,
          config_id: true,
          starts_at: true,
          ends_at: true,
          reason: true,
        },
      })
      .catch(rethrowMissing("Blackout not found"));
  }

  async deleteBlackout(id: number): Promise<boolean> {
    await this.prisma.workshopBlackout
      .delete({ where: { id } })
      .catch(rethrowMissing("Blackout not found"));
    return true;
  }

  async bookings(
    filter: AdminWorkshopBookingsFilterInput,
  ): Promise<AdminWorkshopBookingsResult> {
    const bounds = clampPage(filter.page, filter.limit, MAX_LIMIT);
    const term = searchTerm(filter.search);
    const where: Prisma.WorkshopBookingWhereInput = {
      ...(filter.config_id ? { config_id: filter.config_id } : {}),
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.from || filter.to
        ? {
            starts_at: {
              ...(filter.from ? { gte: filter.from } : {}),
              ...(filter.to ? { lte: filter.to } : {}),
            },
          }
        : {}),
      ...(term
        ? {
            OR: [
              { id: { contains: term, mode: "insensitive" } },
              { user: { email: { contains: term, mode: "insensitive" } } },
            ],
          }
        : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.workshopBooking.findMany({
        where,
        include: adminBookingInclude,
        orderBy: { starts_at: "desc" },
        skip: bounds.skip,
        take: bounds.limit,
      }),
      this.prisma.workshopBooking.count({ where }),
    ]);
    return {
      items: rows.map((row) => toAdminBooking(row)),
      page_info: toPageInfo(bounds, total),
    };
  }

  async setBookingStatus(
    id: string,
    status: RegistrationStatus,
    reason: string | null,
  ): Promise<AdminWorkshopBooking> {
    const current = await this.prisma.workshopBooking.findUnique({
      where: { id },
      include: adminBookingInclude,
    });
    if (!current) {
      throw new NotFoundException("Booking not found");
    }
    const updated = await this.workshops.applyStatus(
      current,
      status,
      trimmed(reason, 300),
      "ADMIN",
    );
    await this.workshops.notifyStatus(
      current.user_id,
      toBooking(updated),
      "status",
    );
    return toAdminBooking({ ...updated, user: current.user });
  }

  private assertBlackout(input: AdminWorkshopBlackoutInput): void {
    if (input.ends_at <= input.starts_at) {
      throw new BadRequestException("A blackout must end after it starts");
    }
  }

  private assertPositive(
    value: number | null | undefined,
    label: string,
  ): void {
    if (value != null && (!Number.isInteger(value) || value < 1)) {
      throw new BadRequestException(`${label} must be at least one`);
    }
  }

  private async configById(id: number): Promise<WorkshopConfig> {
    return toConfig(
      await this.prisma.workshopConfig.findUniqueOrThrow({
        where: { id },
        include: configInclude,
      }),
    );
  }
}
