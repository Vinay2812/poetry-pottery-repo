import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EventStatus, Prisma, RegistrationStatus } from "@prisma/client";

import { newPublicId } from "@/common/ids/public-id";
import { clampPage, toPageInfo } from "@/common/pagination/pagination";
import { env } from "@/config/env";
import { MailService } from "@/mail/mail.service";
import {
  registrationPlacedCustomerMail,
  registrationPlacedStudioMail,
  registrationStatusMail,
} from "@/mail/templates/events";
import { PrismaService } from "@/prisma/prisma.service";
import { SearchService } from "@/features/search/search.service";
import {
  canTransition,
  CUSTOMER_CANCELLABLE,
  releasesSeats,
  STATUS_TIMESTAMP,
  takesSeats,
} from "./registration-status";
import {
  type Event,
  type EventsFilterInput,
  type EventsResult,
  EventWhen,
  type RegisterForEventInput,
  type Registration,
  type RegistrationsResult,
} from "./events.type";

export const MAX_SEATS_PER_REGISTRATION = 4;
const SEARCH_CANDIDATES = 100;

type EventRow = Prisma.EventGetPayload<Record<string, never>>;

export const registrationInclude = {
  event: true,
} satisfies Prisma.EventRegistrationInclude;
type RegistrationRow = Prisma.EventRegistrationGetPayload<{
  include: typeof registrationInclude;
}>;

export function isPastEvent(
  event: Pick<EventRow, "status" | "ends_at">,
  now = new Date(),
): boolean {
  return event.status === EventStatus.COMPLETED || event.ends_at < now;
}

export function toEvent(row: EventRow, now = new Date()): Event {
  return { ...row, is_past: isPastEvent(row, now) };
}

export function toRegistration(
  row: RegistrationRow,
  now = new Date(),
): Registration {
  return {
    id: row.id,
    event: toEvent(row.event, now),
    seats: row.seats,
    unit_price: row.unit_price,
    discount: row.discount,
    total: row.total,
    status: row.status,
    note: row.note,
    cancel_reason: row.cancel_reason,
    can_cancel:
      CUSTOMER_CANCELLABLE.includes(row.status) && row.event.starts_at > now,
    created_at: row.created_at,
    approved_at: row.approved_at,
    confirmed_at: row.confirmed_at,
    rejected_at: row.rejected_at,
    cancelled_at: row.cancelled_at,
  };
}

// Past means finished or marked complete; upcoming is the exact complement, so an evening
// that is running right now still shows on the upcoming tab rather than falling out of both.
export function eventWhenWhere(
  when: EventWhen,
  now: Date,
): Prisma.EventWhereInput {
  if (when === EventWhen.PAST) {
    return {
      status: { in: [EventStatus.PUBLISHED, EventStatus.COMPLETED] },
      OR: [{ status: EventStatus.COMPLETED }, { ends_at: { lt: now } }],
    };
  }
  return { status: EventStatus.PUBLISHED, ends_at: { gte: now } };
}

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly search: SearchService,
    private readonly mail: MailService,
  ) {}

  async list(filter: EventsFilterInput): Promise<EventsResult> {
    const now = new Date();
    const bounds = clampPage(filter.page, filter.limit, 24);
    const when = filter.when ?? EventWhen.UPCOMING;
    const term = filter.search?.trim() ?? "";
    const rankedIds = term
      ? await this.search.rankEvents(term, SEARCH_CANDIDATES)
      : null;
    if (rankedIds && rankedIds.length === 0) {
      return { items: [], page_info: toPageInfo(bounds, 0) };
    }
    const where: Prisma.EventWhereInput = {
      ...eventWhenWhere(when, now),
      ...(rankedIds ? { id: { in: rankedIds } } : {}),
      ...(filter.event_type ? { event_type: filter.event_type } : {}),
      ...(filter.level ? { level: filter.level } : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        orderBy:
          when === EventWhen.PAST
            ? [{ starts_at: "desc" }]
            : [{ starts_at: "asc" }],
        skip: bounds.skip,
        take: bounds.limit,
      }),
      this.prisma.event.count({ where }),
    ]);
    return {
      items: rows.map((row) => toEvent(row, now)),
      page_info: toPageInfo(bounds, total),
    };
  }

  async bySlug(slug: string): Promise<Event> {
    const row = await this.prisma.event.findFirst({
      where: { slug, status: { not: EventStatus.DRAFT } },
    });
    if (!row) {
      throw new NotFoundException("Event not found");
    }
    return toEvent(row);
  }

  async upcoming(limit: number): Promise<Event[]> {
    const now = new Date();
    const rows = await this.prisma.event.findMany({
      where: eventWhenWhere(EventWhen.UPCOMING, now),
      orderBy: { starts_at: "asc" },
      take: Math.min(12, Math.max(1, limit)),
    });
    return rows.map((row) => toEvent(row, now));
  }

  async registrationFor(
    userId: number,
    eventId: number,
  ): Promise<Registration | null> {
    const row = await this.prisma.eventRegistration.findUnique({
      where: { event_id_user_id: { event_id: eventId, user_id: userId } },
      include: registrationInclude,
    });
    return row ? toRegistration(row) : null;
  }

  async register(
    userId: number,
    input: RegisterForEventInput,
  ): Promise<Registration> {
    const seats = Math.trunc(input.seats);
    if (seats < 1 || seats > MAX_SEATS_PER_REGISTRATION) {
      throw new BadRequestException(
        `You can reserve between 1 and ${MAX_SEATS_PER_REGISTRATION} seats`,
      );
    }
    const note = input.note?.trim().slice(0, 500) || null;

    const row = await this.prisma.withTransaction(async () => {
      const event = await this.prisma.event.findUnique({
        where: { id: input.event_id },
      });
      if (!event || event.status === EventStatus.DRAFT) {
        throw new NotFoundException("Event not found");
      }
      if (
        event.status !== EventStatus.PUBLISHED ||
        event.starts_at <= new Date()
      ) {
        throw new BadRequestException(
          "Registrations for this event have closed",
        );
      }
      const existing = await this.prisma.eventRegistration.findUnique({
        where: { event_id_user_id: { event_id: event.id, user_id: userId } },
      });
      if (existing && CUSTOMER_CANCELLABLE.includes(existing.status)) {
        throw new BadRequestException(
          "You already have a seat request for this event",
        );
      }
      if (existing?.status === RegistrationStatus.CONFIRMED) {
        throw new BadRequestException(
          "You are already confirmed for this event",
        );
      }

      // Conditional decrement is the overbooking guard: the last seat cannot be taken twice.
      // The status is part of the condition too, so a guest waiting behind a cancellation
      // cannot take a seat on an evening that has just been called off.
      const held = await this.prisma.event.updateMany({
        where: {
          id: event.id,
          status: EventStatus.PUBLISHED,
          available_seats: { gte: seats },
        },
        data: { available_seats: { decrement: seats } },
      });
      if (held.count === 0) {
        const fresh = await this.prisma.event.findUnique({
          where: { id: event.id },
          select: { status: true, available_seats: true },
        });
        if (!fresh || fresh.status !== EventStatus.PUBLISHED) {
          throw new BadRequestException(
            "Registrations for this event have closed",
          );
        }
        throw new BadRequestException(
          fresh.available_seats > 0
            ? `Only ${fresh.available_seats} seats left`
            : "This event is full",
        );
      }

      const data = {
        seats,
        unit_price: event.price,
        discount: 0,
        total: event.price * seats,
        status: RegistrationStatus.PENDING,
        note,
        cancel_reason: null,
        approved_at: null,
        confirmed_at: null,
        rejected_at: null,
        cancelled_at: null,
      };
      // A cancelled or rejected row is reused so one person keeps one row per event.
      if (existing) {
        // Predicated on the status we read: two rebookings of the same row would each have
        // held seats above, and the loser rolls its hold back with the transaction.
        const rebooked = await this.prisma.eventRegistration.updateMany({
          where: { id: existing.id, status: existing.status },
          data,
        });
        if (rebooked.count === 0) {
          throw new ConflictException(
            "This registration was just updated, refresh and try again",
          );
        }
        return this.prisma.eventRegistration.findUniqueOrThrow({
          where: { id: existing.id },
          include: registrationInclude,
        });
      }
      return this.prisma.eventRegistration.create({
        data: {
          id: newPublicId("EV"),
          event_id: event.id,
          user_id: userId,
          ...data,
        },
        include: registrationInclude,
      });
    });

    const registration = toRegistration(row);
    await this.notifyPlaced(userId, registration);
    return registration;
  }

  async myRegistrations(
    userId: number,
    page: number | null,
    limit: number | null,
  ): Promise<RegistrationsResult> {
    const bounds = clampPage(page, limit, 20);
    const where = { user_id: userId };
    const [rows, total] = await Promise.all([
      this.prisma.eventRegistration.findMany({
        where,
        include: registrationInclude,
        orderBy: { event: { starts_at: "desc" } },
        skip: bounds.skip,
        take: bounds.limit,
      }),
      this.prisma.eventRegistration.count({ where }),
    ]);
    return {
      items: rows.map((row) => toRegistration(row)),
      page_info: toPageInfo(bounds, total),
    };
  }

  async registrationById(userId: number, id: string): Promise<Registration> {
    const row = await this.prisma.eventRegistration.findFirst({
      where: { id, user_id: userId },
      include: registrationInclude,
    });
    if (!row) {
      throw new NotFoundException("Registration not found");
    }
    return toRegistration(row);
  }

  async cancel(
    userId: number,
    id: string,
    reason: string | null | undefined,
  ): Promise<Registration> {
    const row = await this.prisma.withTransaction(async () => {
      const current = await this.prisma.eventRegistration.findFirst({
        where: { id, user_id: userId },
        include: registrationInclude,
      });
      if (!current) {
        throw new NotFoundException("Registration not found");
      }
      if (!toRegistration(current).can_cancel) {
        throw new BadRequestException(
          "This registration can no longer be cancelled online. Message us on WhatsApp and we will help.",
        );
      }
      return this.applyStatus(
        current,
        RegistrationStatus.CANCELLED,
        reason?.trim().slice(0, 300) || "Cancelled by the guest",
      );
    });
    const registration = toRegistration(row);
    await this.notifyStatus(userId, registration);
    return registration;
  }

  // Shared with the admin console; seat counts follow the holding states.
  async applyStatus(
    current: RegistrationRow,
    next: RegistrationStatus,
    cancelReason: string | null = null,
  ): Promise<RegistrationRow> {
    if (!canTransition(current.status, next)) {
      throw new BadRequestException(
        `A registration cannot move from ${current.status.toLowerCase()} to ${next.toLowerCase()}`,
      );
    }
    return this.prisma.withTransaction(async () => {
      const stamp = STATUS_TIMESTAMP[next];
      const closing =
        next === RegistrationStatus.CANCELLED ||
        next === RegistrationStatus.REJECTED;
      // Predicated on the status we read, so seats are never released or taken twice.
      const moved = await this.prisma.eventRegistration.updateMany({
        where: { id: current.id, status: current.status },
        data: {
          status: next,
          ...(stamp ? { [stamp]: new Date() } : {}),
          ...(closing ? { cancel_reason: cancelReason } : {}),
        },
      });
      if (moved.count === 0) {
        throw new ConflictException(
          "This registration was just updated, refresh and try again",
        );
      }
      if (releasesSeats(current.status, next)) {
        await this.prisma.event.update({
          where: { id: current.event_id },
          data: { available_seats: { increment: current.seats } },
        });
      } else if (takesSeats(current.status, next)) {
        const held = await this.prisma.event.updateMany({
          where: {
            id: current.event_id,
            available_seats: { gte: current.seats },
          },
          data: { available_seats: { decrement: current.seats } },
        });
        if (held.count === 0) {
          throw new BadRequestException(
            "Not enough seats left to reopen this registration",
          );
        }
      }
      return this.prisma.eventRegistration.findUniqueOrThrow({
        where: { id: current.id },
        include: registrationInclude,
      });
    });
  }

  async notifyStatus(
    userId: number,
    registration: Registration,
  ): Promise<void> {
    const mail = registrationStatusMail(registration);
    if (!mail) return;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (user) await this.mail.enqueue({ to: user.email, ...mail });
  }

  private async notifyPlaced(
    userId: number,
    registration: Registration,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });
    if (!user) return;
    await this.mail.enqueue({
      to: user.email,
      ...registrationPlacedCustomerMail(registration),
    });
    if (env.BUSINESS_EMAIL) {
      await this.mail.enqueue({
        to: env.BUSINESS_EMAIL,
        ...registrationPlacedStudioMail(
          registration,
          user.name ?? user.email,
          user.email,
        ),
      });
    }
  }
}
