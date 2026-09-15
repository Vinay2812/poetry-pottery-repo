import {
  BadRequestException,
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
import { canTransition } from "@/features/events/registration-status";
import type { Event } from "@/features/events/events.type";
import { SearchService } from "@/features/search/search.service";
import { searchTerm, toUserRef, trimmed } from "../admin.type";
import { slugify, uniqueSlug } from "../slug";
import { UploadsService } from "../uploads/uploads.service";
import { UploadPurpose } from "../uploads/uploads.type";
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

export function nextRegistrationStatuses(
  from: RegistrationStatus,
): RegistrationStatus[] {
  return Object.values(RegistrationStatus).filter((to) =>
    canTransition(from, to),
  );
}

export function toAdminRegistration(
  row: AdminRegistrationRow,
  now = new Date(),
): AdminRegistration {
  return {
    registration: toRegistration(row, now),
    customer: toUserRef(row.user),
    next_statuses: nextRegistrationStatuses(row.status),
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

  async list(filter: AdminEventsFilterInput): Promise<AdminEventsResult> {
    const bounds = clampPage(filter.page, filter.limit, MAX_LIMIT);
    const term = searchTerm(filter.search);
    const where: Prisma.EventWhereInput = {
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
        orderBy: { starts_at: "desc" },
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
    await this.uploads.assertConfirmed(
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

  // Growing or shrinking the room moves available seats by the same delta, never below zero.
  async update(id: number, input: AdminEventInput): Promise<Event> {
    assertSchedule(input);
    const current = await this.prisma.event.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException("Event not found");
    }
    const gallery = (input.gallery ?? [])
      .map((url) => url.trim())
      .filter(Boolean);
    await this.uploads.assertConfirmed(
      [input.image_url, ...gallery],
      [current.image_url, ...current.gallery],
      UploadPurpose.EVENT,
    );
    const seatDelta = input.total_seats - current.total_seats;
    const row = await this.prisma.event.update({
      where: { id },
      data: {
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
        available_seats: Math.max(0, current.available_seats + seatDelta),
        instructor: input.instructor?.trim() || null,
        image_url: input.image_url,
        gallery,
        includes: input.includes ?? [],
        highlights: input.highlights ?? [],
        performers: input.performers ?? [],
      },
    });
    await this.search.requestEventIndex(id);
    return toEvent(row);
  }

  async setStatus(id: number, status: EventStatus): Promise<Event> {
    const row = await this.prisma.event.update({
      where: { id },
      data: { status },
    });
    await this.search.requestEventIndex(id);
    return toEvent(row);
  }

  // Calling off an evening gives every held seat back and mails the guests, through the shared transitions.
  async cancel(id: number, reason: string | null): Promise<Event> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!event) {
      throw new NotFoundException("Event not found");
    }
    const note = trimmed(reason, 300) ?? "The studio called this one off";
    const live = await this.prisma.eventRegistration.findMany({
      where: {
        event_id: id,
        status: {
          in: [
            RegistrationStatus.PENDING,
            RegistrationStatus.APPROVED,
            RegistrationStatus.CONFIRMED,
          ],
        },
      },
      include: adminRegistrationInclude,
    });
    for (const registration of live) {
      const updated = await this.events.applyStatus(
        registration,
        RegistrationStatus.CANCELLED,
        note,
      );
      await this.events.notifyStatus(
        registration.user_id,
        toRegistration(updated),
      );
    }
    return this.setStatus(id, EventStatus.CANCELLED);
  }

  async registrations(
    filter: AdminRegistrationsFilterInput,
  ): Promise<AdminRegistrationsResult> {
    const bounds = clampPage(filter.page, filter.limit, MAX_LIMIT);
    const term = searchTerm(filter.search);
    const where: Prisma.EventRegistrationWhereInput = {
      ...(filter.event_id ? { event_id: filter.event_id } : {}),
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
    const updated = await this.events.applyStatus(
      current,
      status,
      trimmed(reason, 300),
    );
    await this.events.notifyStatus(current.user_id, toRegistration(updated));
    return toAdminRegistration({ ...updated, user: current.user });
  }

  private async freeSlug(title: string): Promise<string> {
    const base = slugify(title);
    const siblings = await this.prisma.event.findMany({
      where: { slug: { startsWith: base } },
      select: { slug: true },
    });
    return uniqueSlug(base, new Set(siblings.map((row) => row.slug)));
  }
}
