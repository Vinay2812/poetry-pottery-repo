import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, UserRole } from "@prisma/client";

import { clampPage, toPageInfo } from "@/common/pagination/pagination";
import { PrismaService } from "@/prisma/prisma.service";
import { searchTerm, toUserRef } from "../admin.type";
import type {
  AdminUser,
  AdminUsersFilterInput,
  AdminUsersResult,
} from "./users.type";

const MAX_LIMIT = 60;

const userCounts = {
  _count: {
    select: {
      orders: true,
      workshop_bookings: true,
      event_registrations: true,
      reviews: true,
    },
  },
} satisfies Prisma.UserInclude;

type UserRow = Prisma.UserGetPayload<{ include: typeof userCounts }>;

export function toAdminUser(row: UserRow): AdminUser {
  return {
    user: toUserRef(row),
    role: row.role,
    phone: row.phone,
    created_at: row.created_at,
    orders_count: row._count.orders,
    bookings_count: row._count.workshop_bookings,
    registrations_count: row._count.event_registrations,
    reviews_count: row._count.reviews,
  };
}

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filter: AdminUsersFilterInput): Promise<AdminUsersResult> {
    const bounds = clampPage(filter.page, filter.limit, MAX_LIMIT);
    const term = searchTerm(filter.search);
    const where: Prisma.UserWhereInput = {
      ...(filter.role ? { role: filter.role } : {}),
      ...(term
        ? {
            OR: [
              { email: { contains: term, mode: "insensitive" } },
              { name: { contains: term, mode: "insensitive" } },
              { phone: { contains: term } },
            ],
          }
        : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: userCounts,
        orderBy: { created_at: "desc" },
        skip: bounds.skip,
        take: bounds.limit,
      }),
      this.prisma.user.count({ where }),
    ]);
    return {
      items: rows.map(toAdminUser),
      page_info: toPageInfo(bounds, total),
    };
  }

  async byId(id: number): Promise<AdminUser> {
    const row = await this.prisma.user.findUnique({
      where: { id },
      include: userCounts,
    });
    if (!row) {
      throw new NotFoundException("Person not found");
    }
    return toAdminUser(row);
  }

  // Locking yourself out of the console is the one mistake this screen must not allow.
  async setRole(
    id: number,
    role: UserRole,
    actingUserId: number,
  ): Promise<AdminUser> {
    if (id === actingUserId && role !== UserRole.ADMIN) {
      throw new BadRequestException("You cannot take away your own access");
    }
    await this.byId(id);
    const row = await this.prisma.user.update({
      where: { id },
      data: { role },
      include: userCounts,
    });
    return toAdminUser(row);
  }
}
