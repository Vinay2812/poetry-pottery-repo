import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, RegistrationStatus } from "@prisma/client";

import { newPublicId } from "@/common/ids/public-id";
import { clampPage, toPageInfo } from "@/common/pagination/pagination";
import { env } from "@/config/env";
import { MailService } from "@/mail/mail.service";
import {
  bookingPlacedCustomerMail,
  bookingPlacedStudioMail,
  bookingStatusMail,
} from "@/mail/templates/workshops";
import { PrismaService } from "@/prisma/prisma.service";
import {
  canTransition,
  CUSTOMER_CANCELLABLE,
  SEAT_HOLDING,
  STATUS_TIMESTAMP,
} from "@/features/events/registration-status";
import {
  addDays,
  buildAvailability,
  checkSlots,
  type Occupant,
  slotBounds,
  type SlotRequest,
} from "./schedule";
import type {
  BookWorkshopInput,
  RescheduleWorkshopInput,
  WorkshopAvailabilityInput,
  WorkshopBooking,
  WorkshopBookingsResult,
  WorkshopConfig,
  WorkshopDay,
} from "./workshops.type";

const MAX_AVAILABILITY_DAYS = 31;
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

export const configInclude = {
  tiers: { orderBy: { hours: "asc" } },
} satisfies Prisma.WorkshopConfigInclude;
type ConfigRow = Prisma.WorkshopConfigGetPayload<{
  include: typeof configInclude;
}>;

export const bookingInclude = {
  config: { include: configInclude },
  slots: { orderBy: { starts_at: "asc" } },
} satisfies Prisma.WorkshopBookingInclude;
type BookingRow = Prisma.WorkshopBookingGetPayload<{
  include: typeof bookingInclude;
}>;

export function toConfig(row: ConfigRow): WorkshopConfig {
  return row;
}

export function toBooking(row: BookingRow, now = new Date()): WorkshopBooking {
  const changeable =
    CUSTOMER_CANCELLABLE.includes(row.status) && row.starts_at > now;
  return {
    id: row.id,
    config: toConfig(row.config),
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    slots: row.slots.map((slot) => ({
      starts_at: slot.starts_at,
      ends_at: slot.ends_at,
    })),
    hours: row.hours,
    participants: row.participants,
    price_per_person: row.price_per_person,
    pieces_per_person: row.pieces_per_person,
    subtotal: row.subtotal,
    discount: row.discount,
    total: row.total,
    status: row.status,
    note: row.note,
    cancel_reason: row.cancel_reason,
    can_cancel: changeable,
    can_reschedule:
      changeable ||
      (row.status === RegistrationStatus.CONFIRMED && row.starts_at > now),
    created_at: row.created_at,
    approved_at: row.approved_at,
    confirmed_at: row.confirmed_at,
    rejected_at: row.rejected_at,
    cancelled_at: row.cancelled_at,
  };
}

@Injectable()
export class WorkshopsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async configs(): Promise<WorkshopConfig[]> {
    const rows = await this.prisma.workshopConfig.findMany({
      where: { is_active: true },
      include: configInclude,
      orderBy: { id: "asc" },
    });
    return rows.map(toConfig);
  }

  async configBySlug(slug: string): Promise<ConfigRow> {
    const row = await this.prisma.workshopConfig.findFirst({
      where: { slug, is_active: true },
      include: configInclude,
    });
    if (!row) {
      throw new NotFoundException("Workshop not found");
    }
    return row;
  }

  // A foreign or unknown booking id is ignored, so the answer is never more than the public view.
  async availability(
    input: WorkshopAvailabilityInput,
    viewerId: number | null = null,
  ): Promise<WorkshopDay[]> {
    if (!DATE_KEY.test(input.from)) {
      throw new BadRequestException("from must be a YYYY-MM-DD date");
    }
    const config = await this.configBySlug(input.config_slug);
    const days = Math.min(
      MAX_AVAILABILITY_DAYS,
      Math.max(1, Math.trunc(input.days)),
    );
    const now = new Date();
    const rangeStart = new Date(`${input.from}T00:00:00.000Z`);
    rangeStart.setUTCDate(rangeStart.getUTCDate() - 1);
    const rangeEnd = new Date(`${addDays(input.from, days + 1)}T00:00:00.000Z`);
    const excluded =
      input.exclude_booking_id && viewerId !== null
        ? await this.prisma.workshopBooking.findFirst({
            where: {
              id: input.exclude_booking_id,
              user_id: viewerId,
              config_id: config.id,
            },
            select: { id: true },
          })
        : null;
    const [blackouts, occupants] = await Promise.all([
      this.prisma.workshopBlackout.findMany({
        where: {
          config_id: config.id,
          starts_at: { lt: rangeEnd },
          ends_at: { gt: rangeStart },
        },
      }),
      this.activeBookings(
        config.id,
        rangeStart,
        rangeEnd,
        excluded?.id ?? null,
      ),
    ]);
    return buildAvailability({
      config,
      from: input.from,
      days,
      now,
      blackouts,
      occupants,
    });
  }

  async book(
    userId: number,
    input: BookWorkshopInput,
  ): Promise<WorkshopBooking> {
    const note = input.note?.trim().slice(0, 500) || null;
    const row = await this.prisma.withTransaction(async () => {
      const config = await this.configBySlug(input.config_slug);
      await this.lock(config.id);
      const tier = config.tiers.find(
        (candidate) => candidate.hours === input.hours,
      );
      if (!tier) {
        throw new BadRequestException(
          `Choose ${config.tiers.map((t) => t.hours).join(", ")} hour sessions`,
        );
      }
      const request = {
        slot_starts: [...input.slot_starts].sort(
          (a, b) => a.getTime() - b.getTime(),
        ),
        hours: input.hours,
        participants: Math.trunc(input.participants),
      };
      await this.assertSlots(config, request, null);
      const bounds = slotBounds(request.slot_starts, config.slot_minutes);
      const subtotal = tier.price_per_person * request.participants;
      return this.prisma.workshopBooking.create({
        data: {
          id: newPublicId("WS"),
          config_id: config.id,
          user_id: userId,
          starts_at: bounds.starts_at,
          ends_at: bounds.ends_at,
          hours: input.hours,
          participants: request.participants,
          price_per_person: tier.price_per_person,
          pieces_per_person: tier.pieces_per_person,
          subtotal,
          discount: 0,
          total: subtotal,
          note,
          slots: { create: this.toSlotRows(request.slot_starts, config) },
        },
        include: bookingInclude,
      });
    });
    const booking = toBooking(row);
    await this.notifyPlaced(userId, booking);
    return booking;
  }

  async reschedule(
    userId: number,
    input: RescheduleWorkshopInput,
  ): Promise<WorkshopBooking> {
    const row = await this.prisma.withTransaction(async () => {
      const current = await this.prisma.workshopBooking.findFirst({
        where: { id: input.booking_id, user_id: userId },
        include: bookingInclude,
      });
      if (!current) {
        throw new NotFoundException("Booking not found");
      }
      if (!toBooking(current).can_reschedule) {
        throw new BadRequestException(
          "This booking can no longer be moved online. Message us on WhatsApp and we will help.",
        );
      }
      await this.lock(current.config_id);
      const request = {
        slot_starts: [...input.slot_starts].sort(
          (a, b) => a.getTime() - b.getTime(),
        ),
        hours: current.hours,
        participants: current.participants,
      };
      await this.assertSlots(current.config, request, current.id);
      const bounds = slotBounds(
        request.slot_starts,
        current.config.slot_minutes,
      );
      // Predicated on the status we read, so a cancellation landing mid-move is not overwritten.
      const moved = await this.prisma.workshopBooking.updateMany({
        where: { id: current.id, status: current.status },
        data: { starts_at: bounds.starts_at, ends_at: bounds.ends_at },
      });
      if (moved.count === 0) {
        throw new ConflictException(
          "This booking was just updated, refresh and try again",
        );
      }
      // The whole set is replaced, so a move can drop, add or shuffle days at once.
      await this.prisma.workshopBookingSlot.deleteMany({
        where: { booking_id: current.id },
      });
      return this.prisma.workshopBooking.update({
        where: { id: current.id },
        data: {
          slots: {
            create: this.toSlotRows(request.slot_starts, current.config),
          },
        },
        include: bookingInclude,
      });
    });
    const booking = toBooking(row);
    await this.notifyStatus(userId, booking, "rescheduled");
    return booking;
  }

  async myBookings(
    userId: number,
    page: number | null,
    limit: number | null,
  ): Promise<WorkshopBookingsResult> {
    const bounds = clampPage(page, limit, 20);
    const where = { user_id: userId };
    const [rows, total] = await Promise.all([
      this.prisma.workshopBooking.findMany({
        where,
        include: bookingInclude,
        orderBy: { starts_at: "desc" },
        skip: bounds.skip,
        take: bounds.limit,
      }),
      this.prisma.workshopBooking.count({ where }),
    ]);
    return {
      items: rows.map((row) => toBooking(row)),
      page_info: toPageInfo(bounds, total),
    };
  }

  async bookingById(userId: number, id: string): Promise<WorkshopBooking> {
    const row = await this.prisma.workshopBooking.findFirst({
      where: { id, user_id: userId },
      include: bookingInclude,
    });
    if (!row) {
      throw new NotFoundException("Booking not found");
    }
    return toBooking(row);
  }

  async cancel(
    userId: number,
    id: string,
    reason: string | null | undefined,
  ): Promise<WorkshopBooking> {
    const row = await this.prisma.withTransaction(async () => {
      const current = await this.prisma.workshopBooking.findFirst({
        where: { id, user_id: userId },
        include: bookingInclude,
      });
      if (!current) {
        throw new NotFoundException("Booking not found");
      }
      if (!toBooking(current).can_cancel) {
        throw new BadRequestException(
          "This booking can no longer be cancelled online. Message us on WhatsApp and we will help.",
        );
      }
      return this.applyStatus(
        current,
        RegistrationStatus.CANCELLED,
        reason?.trim().slice(0, 300) || "Cancelled by the guest",
        "USER",
      );
    });
    const booking = toBooking(row);
    await this.notifyStatus(userId, booking, "status");
    return booking;
  }

  // Shared with the admin console; occupancy is derived from status, so no counters to adjust.
  async applyStatus(
    current: BookingRow,
    next: RegistrationStatus,
    cancelReason: string | null,
    cancelledBy: "USER" | "ADMIN" | "SYSTEM" | null = null,
  ): Promise<BookingRow> {
    if (!canTransition(current.status, next)) {
      throw new BadRequestException(
        `A booking cannot move from ${current.status.toLowerCase()} to ${next.toLowerCase()}`,
      );
    }
    return this.prisma.withTransaction(async () => {
      if (
        !SEAT_HOLDING.includes(current.status) &&
        SEAT_HOLDING.includes(next)
      ) {
        await this.lock(current.config_id);
        await this.assertSlots(
          current.config,
          {
            slot_starts: current.slots.map((slot) => slot.starts_at),
            hours: current.hours,
            participants: current.participants,
          },
          current.id,
        );
      }
      const stamp = STATUS_TIMESTAMP[next];
      const closing =
        next === RegistrationStatus.CANCELLED ||
        next === RegistrationStatus.REJECTED;
      // Predicated on the status we read, so concurrent transitions cannot both apply.
      const moved = await this.prisma.workshopBooking.updateMany({
        where: { id: current.id, status: current.status },
        data: {
          status: next,
          ...(stamp ? { [stamp]: new Date() } : {}),
          ...(closing
            ? {
                cancel_reason: cancelReason,
                cancelled_by: cancelledBy ?? "ADMIN",
              }
            : {}),
        },
      });
      if (moved.count === 0) {
        throw new ConflictException(
          "This booking was just updated, refresh and try again",
        );
      }
      return this.prisma.workshopBooking.findUniqueOrThrow({
        where: { id: current.id },
        include: bookingInclude,
      });
    });
  }

  async notifyStatus(
    userId: number,
    booking: WorkshopBooking,
    kind: "status" | "rescheduled",
  ): Promise<void> {
    const mail = bookingStatusMail(booking, kind);
    if (!mail) return;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (user) await this.mail.enqueue({ to: user.email, ...mail });
  }

  private async notifyPlaced(
    userId: number,
    booking: WorkshopBooking,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });
    if (!user) return;
    await this.mail.enqueue({
      to: user.email,
      ...bookingPlacedCustomerMail(booking),
    });
    if (env.BUSINESS_EMAIL) {
      await this.mail.enqueue({
        to: env.BUSINESS_EMAIL,
        ...bookingPlacedStudioMail(
          booking,
          user.name ?? user.email,
          user.email,
        ),
      });
    }
  }

  // Serialises bookings per studio so two people cannot take the last wheel at once.
  private async lock(configId: number): Promise<void> {
    await this.prisma.$executeRaw`SELECT pg_advisory_xact_lock(${configId})`;
  }

  private toSlotRows(
    starts: Date[],
    config: Pick<ConfigRow, "slot_minutes">,
  ): { starts_at: Date; ends_at: Date }[] {
    return starts.map((starts_at) => ({
      starts_at,
      ends_at: new Date(starts_at.getTime() + config.slot_minutes * 60_000),
    }));
  }

  private async assertSlots(
    config: ConfigRow,
    request: SlotRequest,
    excludeBookingId: string | null,
  ): Promise<void> {
    if (request.slot_starts.length === 0) {
      throw new BadRequestException("Pick at least one hour");
    }
    const times = request.slot_starts.map((start) => start.getTime());
    const rangeStart = new Date(Math.min(...times) - 86_400_000);
    const rangeEnd = new Date(
      Math.max(...times) + config.slot_minutes * 60_000 + 86_400_000,
    );
    const [blackouts, occupants] = await Promise.all([
      this.prisma.workshopBlackout.findMany({
        where: {
          config_id: config.id,
          starts_at: { lt: rangeEnd },
          ends_at: { gt: rangeStart },
        },
      }),
      this.activeBookings(config.id, rangeStart, rangeEnd, excludeBookingId),
    ]);
    const check = checkSlots(request, config, new Date(), blackouts, occupants);
    if (!check.ok) {
      throw new BadRequestException(check.reason);
    }
  }

  // Seats are held hour by hour, so occupancy comes from the slot rows of live bookings.
  private async activeBookings(
    configId: number,
    from: Date,
    to: Date,
    excludeBookingId: string | null = null,
  ): Promise<Occupant[]> {
    const rows = await this.prisma.workshopBookingSlot.findMany({
      where: {
        starts_at: { lt: to },
        ends_at: { gt: from },
        booking: {
          config_id: configId,
          status: { in: [...SEAT_HOLDING] },
          ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
        },
      },
      select: {
        starts_at: true,
        ends_at: true,
        booking: { select: { participants: true } },
      },
    });
    return rows.map((row) => ({
      starts_at: row.starts_at,
      ends_at: row.ends_at,
      participants: row.booking.participants,
    }));
  }
}
