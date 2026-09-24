import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, UserRole } from "@prisma/client";

import { ClerkService } from "@/common/clerk/clerk.service";
import { clampPage, toPageInfo } from "@/common/pagination/pagination";
import { LockNamespace } from "@/prisma/lock";
import { PrismaService } from "@/prisma/prisma.service";
import { searchTerm, toUserRef } from "../admin.type";
import type {
  AdminUser,
  AdminUsersFilterInput,
  AdminUsersResult,
} from "./users.type";

const MAX_LIMIT = 60;
const ROLE_CHANGE_LOCK = "admin-role-changes";

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
  private readonly logger = new Logger(AdminUsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly clerk: ClerkService,
  ) {}

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
    const row = await this.prisma.withTransaction(async () => {
      // Serialised, so two admins demoting each other at once cannot both count the other as the one left.
      await this.prisma.lock(LockNamespace.ROLE_CHANGE, ROLE_CHANGE_LOCK);
      // The studio must always have a way in, so the last admin cannot step down.
      if (role !== UserRole.ADMIN) {
        const others = await this.prisma.user.count({
          where: { role: UserRole.ADMIN, id: { not: id } },
        });
        if (others === 0) {
          throw new BadRequestException(
            "Make someone else an admin before this one steps down",
          );
        }
      }
      return this.prisma.user.update({
        where: { id },
        data: { role },
        include: userCounts,
      });
    });
    // The dashboard layout reads the role from Clerk, so it follows the change now rather than on their next API call.
    this.clerk
      .updatePublicMetadata(row.auth_id, { dbUserId: row.id, role: row.role })
      .catch((error: unknown) => {
        this.logger.warn(
          `Could not refresh Clerk metadata for user ${row.id}: ${String(error)}`,
        );
      });
    return toAdminUser(row);
  }
}
