import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { clampPage, toPageInfo } from "@/common/pagination/pagination";
import { PrismaService } from "@/prisma/prisma.service";
import {
  reviewInclude,
  ReviewsService,
  subjectOf,
  toReview,
} from "@/features/reviews/reviews.service";
import { searchTerm, toUserRef } from "../admin.type";
import {
  type AdminReview,
  type AdminReviewsFilterInput,
  type AdminReviewsResult,
  ReviewSubjectKind,
} from "./reviews.type";

const MAX_LIMIT = 60;

const adminReviewInclude = {
  ...reviewInclude,
  user: { select: { id: true, name: true, email: true, image: true } },
} satisfies Prisma.ReviewInclude;

type AdminReviewRow = Prisma.ReviewGetPayload<{
  include: typeof adminReviewInclude;
}>;

export function toAdminReview(row: AdminReviewRow): AdminReview {
  return {
    // The console sees every review as its author's, so is_mine stays false.
    review: toReview(row, null),
    customer: toUserRef(row.user),
    is_hidden: row.is_hidden,
    subject_kind:
      row.product_id === null
        ? ReviewSubjectKind.EVENT
        : ReviewSubjectKind.PRODUCT,
  };
}

@Injectable()
export class AdminReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reviews: ReviewsService,
  ) {}

  async list(filter: AdminReviewsFilterInput): Promise<AdminReviewsResult> {
    const bounds = clampPage(filter.page, filter.limit, MAX_LIMIT);
    const term = searchTerm(filter.search);
    const where: Prisma.ReviewWhereInput = {
      ...(filter.subject_kind === ReviewSubjectKind.PRODUCT
        ? { product_id: { not: null } }
        : {}),
      ...(filter.subject_kind === ReviewSubjectKind.EVENT
        ? { event_id: { not: null } }
        : {}),
      ...(filter.rating ? { rating: filter.rating } : {}),
      ...(filter.is_hidden == null ? {} : { is_hidden: filter.is_hidden }),
      ...(term
        ? {
            OR: [
              { body: { contains: term, mode: "insensitive" } },
              { user: { email: { contains: term, mode: "insensitive" } } },
            ],
          }
        : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: adminReviewInclude,
        orderBy: { created_at: "desc" },
        skip: bounds.skip,
        take: bounds.limit,
      }),
      this.prisma.review.count({ where }),
    ]);
    return {
      items: rows.map(toAdminReview),
      page_info: toPageInfo(bounds, total),
    };
  }

  // Hiding leaves the row in place but takes it out of the storefront and the rating average.
  async setHidden(id: number, isHidden: boolean): Promise<AdminReview> {
    const row = await this.prisma.withTransaction(async () => {
      const current = await this.prisma.review.findUnique({ where: { id } });
      if (!current) {
        throw new NotFoundException("Review not found");
      }
      const subject = subjectOf(current);
      // Moderation recounts the same average the customer paths do, so it takes the same row lock.
      await this.reviews.lockSubject(subject);
      const updated = await this.prisma.review.update({
        where: { id },
        data: { is_hidden: isHidden },
        include: adminReviewInclude,
      });
      await this.reviews.refreshRating(subject);
      return updated;
    });
    return toAdminReview(row);
  }

  remove(id: number): Promise<boolean> {
    return this.reviews.remove(id, 0, true);
  }
}
