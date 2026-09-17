import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { clampPage, toPageInfo } from "@/common/pagination/pagination";
import { PrismaService } from "@/prisma/prisma.service";
import type { StudioVisit } from "@/features/visits/visits.type";
import { VisitsService } from "@/features/visits/visits.service";
import { searchTerm, toUserRef } from "../admin.type";
import type {
  AdminStudioVisitsFilterInput,
  AdminStudioVisitsResult,
} from "./visits.type";

const MAX_LIMIT = 60;

@Injectable()
export class AdminVisitsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly visits: VisitsService,
  ) {}

  // The studio reads this as a day sheet, so the earliest window comes first.
  async list(
    filter: AdminStudioVisitsFilterInput,
  ): Promise<AdminStudioVisitsResult> {
    const bounds = clampPage(filter.page, filter.limit, MAX_LIMIT);
    const term = searchTerm(filter.search);
    const where: Prisma.StudioVisitWhereInput = {
      ...(filter.include_cancelled ? {} : { cancelled_at: null }),
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
              { name: { contains: term, mode: "insensitive" } },
              { phone: { contains: term } },
            ],
          }
        : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.studioVisit.findMany({
        where,
        orderBy: { starts_at: "asc" },
        skip: bounds.skip,
        take: bounds.limit,
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      }),
      this.prisma.studioVisit.count({ where }),
    ]);
    return {
      items: rows.map(({ user, ...visit }) => ({
        visit,
        customer: user ? toUserRef(user) : null,
        created_at: visit.created_at,
      })),
      page_info: toPageInfo(bounds, total),
    };
  }

  cancel(id: string, reason: string | null): Promise<StudioVisit> {
    return this.visits.cancel(id, reason);
  }
}
