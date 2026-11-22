import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EventStatus, Prisma, RegistrationStatus } from "@prisma/client";

import { clampPage, toPageInfo } from "@/common/pagination/pagination";
import { PrismaService } from "@/prisma/prisma.service";
import {
  EventsService,
  registrationInclude,
  toEvent,
  toRegistration,
} from "@/features/events/events.service";
import { canTransition as canEventTransition } from "@/features/events/event-status";
import {
  assertNotLateAdmission,
  assertNotPaymentStepForFreeSeat,
  nextAdminStatuses,
  SEAT_HOLDING,
} from "@/features/events/registration-status";
import type { Event } from "@/features/events/events.type";
import { SearchService } from "@/features/search/search.service";
import { searchTerm, toUserRef, trimmed } from "../admin.type";
import { slugify, uniqueSlug } from "../slug";
import { UploadsService } from "@/uploads/uploads.service";
import { UploadPurpose } from "@/uploads/uploads.type";
import type {
  AdminEventInput,
  AdminEventsFilterInput,
  AdminEventsResult,
  AdminRegistration,
  AdminRegistrationsFilterInput,
  AdminRegistrationsResult,
} from "./events.type";

const MAX_LIMIT = 60;

const adminRegistrationInclude = {
  ...registrationInclude,
  user: { select: { id: true, name: true, email: true, image: true } },
} satisfies Prisma.EventRegistrationInclude;

type AdminRegistrationRow = Prisma.EventRegistrationGetPayload<{
  include: typeof adminRegistrationInclude;
}>;

// What duplicate() leaves on a fresh copy: "<title>-copy", or "-copy-2" when that is taken.
const COPY_SLUG = /-copy(-\d+)?$/;

export function toAdminRegistration(
  row: AdminRegistrationRow,
  now = new Date(),
): AdminRegistration {
  return {
    registration: toRegistration(row, now),
    customer: toUserRef(row.user),
    next_statuses: nextAdminStatuses(
      row.status,
      row.total,
      row.event.starts_at,
      now,
    ),
  };
}

// Waiting on the studio means a seat request for an evening that has not begun; the dashboard counts the same.
export function waitingRegistrationWhere(
  now: Date,
): Prisma.EventRegistrationWhereInput {
  return {
    status: RegistrationStatus.PENDING,
    event: { starts_at: { gte: now } },
  };
}

export function assertSchedule(input: {
  starts_at: Date;
  ends_at: Date;
  price: number;
  total_seats: number;
}): void {
  if (input.ends_at <= input.starts_at) {
    throw new BadRequestException("An event must end after it starts");
  }
  if (!Number.isInteger(input.price) || input.price < 0) {
    throw new BadRequestException("Price must be a whole number of rupees");
  }
  if (!Number.isInteger(input.total_seats) || input.total_seats < 1) {
    throw new BadRequestException("An event needs at least one seat");
  }
}

@Injectable()
export class AdminEventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
    private readonly search: SearchService,
    private readonly uploads: UploadsService,
  ) {}

  async list(
    filter: AdminEventsFilterInput,
    now = new Date(),
  ): Promise<AdminEventsResult> {
    const bounds = clampPage(filter.page, filter.limit, MAX_LIMIT);
    const term = searchTerm(filter.search);
    const registrationFilters: Prisma.EventWhereInput[] = [
      // A person's events are the ones they hold a registration for, whatever its state.
      ...(filter.user_id
        ? [{ registrations: { some: { user_id: filter.user_id } } }]
        : []),
      ...(filter.awaiting_approval
        ? [{ registrations: { some: waitingRegistrationWhere(now) } }]
        : []),
    ];
    const where: Prisma.EventWhereInput = {
      ...(registrationFilters.length > 0 ? { AND: registrationFilters } : {}),
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.event_type ? { event_type: filter.event_type } : {}),
      ...(term
        ? {
            OR: [
              { title: { contains: term, mode: "insensitive" } },
              { slug: { contains: term, mode: "insensitive" } },
              { location: { contains: term, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        // The waiting queue reads soonest first, the way the wheel requests do.
        orderBy: [
          { starts_at: filter.awaiting_approval ? "asc" : "desc" },
          { id: "asc" },
        ],
        skip: bounds.skip,
        take: bounds.limit,
      }),
      this.prisma.event.count({ where }),
    ]);
    return {
      items: rows.map((row) => toEvent(row)),
      page_info: toPageInfo(bounds, total),
    };
  }

  // Drafts are invisible to the storefront, so the console gets its own lookup.
  async byId(id: number): Promise<Event> {
    const row = await this.prisma.event.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException("Event not found");
    }
    return toEvent(row);
  }

  async create(input: AdminEventInput): Promise<Event> {
    assertSchedule(input);
    const gallery = (input.gallery ?? [])
      .map((url) => url.trim())
      .filter(Boolean);
    await this.uploads.claimConfirmed(
      [input.image_url, ...gallery],
      [],
      UploadPurpose.EVENT,
    );
    const row = await this.prisma.event.create({
      data: {
        slug: await this.freeSlug(input.title),
        title: input.title.trim(),
        description: input.description.trim(),
        ...(input.event_type ? { event_type: input.event_type } : {}),
        level: input.level ?? null,
        starts_at: input.starts_at,
        ends_at: input.ends_at,
        location: input.location.trim(),
        address: input.address.trim(),
        price: input.price,
        total_seats: input.total_seats,
        available_seats: input.total_seats,
        instructor: input.instructor?.trim() || null,
        image_url: input.image_url,
        gallery,
        includes: input.includes ?? [],
        highlights: input.highlights ?? [],
        performers: input.performers ?? [],
      },
    });
    await this.search.requestEventIndex(row.id);
    return toEvent(row);
  }

  // A repeat evening starts as a draft copy of the last one, so the owner edits the date and
  // publishes rather than typing the same brief again.
  async duplicate(id: number): Promise<Event> {
    const source = await this.prisma.event.findUnique({ where: { id } });
    if (!source) {
      throw new NotFoundException("Event not found");
    }
    const title = `${source.title} (copy)`;
    const row = await this.prisma.event.create({
      data: {
        slug: await this.freeSlug(title),
        title,
        description: source.description,
        event_type: source.event_type,
        level: source.level,
        starts_at: source.starts_at,
        ends_at: source.ends_at,
        location: source.location,
        address: source.address,
        price: source.price,
        total_seats: source.total_seats,
        available_seats: source.total_seats,
        instructor: source.instructor,
        image_url: source.image_url,
        gallery: source.gallery,
        includes: source.includes,
        highlights: source.highlights,
        performers: source.performers,
      },
    });
    return toEvent(row);
  }

  // Growing or shrinking the room moves available seats by the same delta, so seats taken
  // since the edit form was opened survive the save.
  async update(id: number, input: AdminEventInput): Promise<Event> {
    assertSchedule(input);
    const current = await this.prisma.event.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException("Event not found");
    }
    const gallery = (input.gallery ?? [])
      .map((url) => url.trim())
      .filter(Boolean);
    await this.uploads.claimConfirmed(
      [input.image_url, ...gallery],
      [current.image_url, ...current.gallery],
      UploadPurpose.EVENT,
    );
    const seatDelta = input.total_seats - current.total_seats;
    const slug = await this.followTitle(current, input.title.trim());
    const row = await this.prisma.withTransaction(async () => {
      // Predicated on the room size that was read, and on enough free seats to absorb a shrink.
      const moved = await this.prisma.event.updateMany({
        where: {
          id,
          total_seats: current.total_seats,
          ...(seatDelta < 0 ? { available_seats: { gte: -seatDelta } } : {}),
        },
        data: {
          title: input.title.trim(),
          ...(slug === null ? {} : { slug }),
          description: input.description.trim(),
          ...(input.event_type ? { event_type: input.event_type } : {}),
          level: input.level ?? null,
          starts_at: input.starts_at,
          ends_at: input.ends_at,
          location: input.location.trim(),
          address: input.address.trim(),
          price: input.price,
          total_seats: input.total_seats,
          ...(seatDelta === 0
            ? {}
            : { available_seats: { increment: seatDelta } }),
          instructor: input.instructor?.trim() || null,
          image_url: input.image_url,
          gallery,
          includes: input.includes ?? [],
          highlights: input.highlights ?? [],
          performers: input.performers ?? [],
        },
      });
      if (moved.count === 0) {
        await this.refuseSeatChange(id, current.total_seats);
      }
      return this.prisma.event.findUniqueOrThrow({ where: { id } });
    });
    await this.search.requestEventIndex(id);
    return toEvent(row);
  }

  // Publish, unpublish, complete and cancel all come through here, so one table decides
  // which moves exist and the write is predicated on the status that was read.
  async setStatus(id: number, status: EventStatus): Promise<Event> {
    const row = await this.prisma.withTransaction(async () => {
      const current = await this.requireStatus(id, status);
      const moved = await this.prisma.event.updateMany({
        where: { id, status: current },
        data: { status },
      });
      if (moved.count === 0) {
        throw new ConflictException(
          "This event was just updated, refresh and try again",
        );
      }
      return this.prisma.event.findUniqueOrThrow({ where: { id } });
    });
    await this.search.requestEventIndex(id);
    return toEvent(row);
  }

  // Calling off an evening gives every held seat back and mails the guests, through the shared
  // transitions. The whole sweep is one transaction that pins the event and flips it first, so a
  // guest reaching for a seat is refused rather than left holding one on a cancelled evening, and
  // a second admin waits on the lock and is then told there is nothing left to call off.
  async cancel(id: number, reason: string | null): Promise<Event> {
    // The admin console reads this exact text as who cancelled (frontend admin/ui/types.ts).
    const note = trimmed(reason, 300) ?? "The studio called this one off";
    const row = await this.prisma.withTransaction(async () => {
      await this.prisma
        .$executeRaw`SELECT id FROM events WHERE id = ${id} FOR UPDATE`;
      const current = await this.requireStatus(id, EventStatus.CANCELLED);
      const moved = await this.prisma.event.updateMany({
        where: { id, status: current },
        data: { status: EventStatus.CANCELLED },
      });
      if (moved.count === 0) {
        throw new ConflictException(
          "This event was just updated, refresh and try again",
        );
      }
      const live = await this.prisma.eventRegistration.findMany({
        where: { event_id: id, status: { in: [...SEAT_HOLDING] } },
        include: adminRegistrationInclude,
      });
      // Each transition mails its guest; the mail waits for this commit, so a rolled back sweep mails nobody.
      for (const registration of live) {
        await this.events.applyStatus(
          registration,
          RegistrationStatus.CANCELLED,
          note,
        );
      }
      return this.prisma.event.findUniqueOrThrow({ where: { id } });
    });
    await this.search.requestEventIndex(id);
    return toEvent(row);
  }

  async registrations(
    filter: AdminRegistrationsFilterInput,
  ): Promise<AdminRegistrationsResult> {
    const bounds = clampPage(filter.page, filter.limit, MAX_LIMIT);
    const term = searchTerm(filter.search);
    const where: Prisma.EventRegistrationWhereInput = {
      ...(filter.event_id ? { event_id: filter.event_id } : {}),
      ...(filter.user_id ? { user_id: filter.user_id } : {}),
      ...(filter.status ? { status: filter.status } : {}),
      ...(term
        ? {
            OR: [
              { id: { contains: term, mode: "insensitive" } },
              { user: { email: { contains: term, mode: "insensitive" } } },
              { event: { title: { contains: term, mode: "insensitive" } } },
            ],
          }
        : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.eventRegistration.findMany({
        where,
        include: adminRegistrationInclude,
        orderBy: { created_at: "desc" },
        skip: bounds.skip,
        take: bounds.limit,
      }),
      this.prisma.eventRegistration.count({ where }),
    ]);
    return {
      items: rows.map((row) => toAdminRegistration(row)),
      page_info: toPageInfo(bounds, total),
    };
  }

  async setRegistrationStatus(
    id: string,
    status: RegistrationStatus,
    reason: string | null,
  ): Promise<AdminRegistration> {
    const current = await this.prisma.eventRegistration.findUnique({
      where: { id },
      include: adminRegistrationInclude,
    });
    if (!current) {
      throw new NotFoundException("Registration not found");
    }
    assertNotPaymentStepForFreeSeat(status, current.total);
    assertNotLateAdmission(current.status, status, current.event.starts_at);
    const updated = await this.events.applyStatus(
      current,
      status,
      trimmed(reason, 300),
    );
    return toAdminRegistration({ ...updated, user: current.user });
  }

  // Reads the current status and refuses a move the event cannot make.
  private async requireStatus(
    id: number,
    next: EventStatus,
  ): Promise<EventStatus> {
    const current = await this.prisma.event.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!current) {
      throw new NotFoundException("Event not found");
    }
    if (!canEventTransition(current.status, next)) {
      throw new BadRequestException(
        `An event cannot move from ${current.status.toLowerCase()} to ${next.toLowerCase()}`,
      );
    }
    return current.status;
  }

  // Reached only when the guarded edit matched nothing, to say which of the two guards held.
  private async refuseSeatChange(
    id: number,
    readSeats: number,
  ): Promise<never> {
    const fresh = await this.prisma.event.findUnique({
      where: { id },
      select: { total_seats: true, available_seats: true },
    });
    if (!fresh) {
      throw new NotFoundException("Event not found");
    }
    if (fresh.total_seats !== readSeats) {
      throw new ConflictException(
        "This event was just updated, refresh and try again",
      );
    }
    throw new BadRequestException(
      `Only ${fresh.available_seats} of these seats are still free`,
    );
  }

  // Only an untouched duplicate renames its link: its slug still ends in the copy suffix, it is
  // a draft, and nobody has booked it. A draft that was once published under its own slug keeps
  // it when renamed. One exception: a copy published under its "-copy" slug, then unpublished
  // and renamed, still follows the title, since nothing here records that it was ever live.
  private async followTitle(
    current: { id: number; title: string; slug: string; status: EventStatus },
    title: string,
  ): Promise<string | null> {
    if (
      current.status !== EventStatus.DRAFT ||
      title === current.title ||
      !COPY_SLUG.test(current.slug)
    ) {
      return null;
    }
    const bookings = await this.prisma.eventRegistration.count({
      where: { event_id: current.id },
    });
    return bookings === 0 ? this.freeSlug(title, current.id) : null;
  }

  private async freeSlug(title: string, exceptId?: number): Promise<string> {
    const base = slugify(title);
    const siblings = await this.prisma.event.findMany({
      where: {
        slug: { startsWith: base },
        ...(exceptId === undefined ? {} : { id: { not: exceptId } }),
      },
      select: { slug: true },
    });
    return uniqueSlug(base, new Set(siblings.map((row) => row.slug)));
  }
}
