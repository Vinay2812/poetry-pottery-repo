import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  EventStatus,
  OrderStatus,
  Prisma,
  RegistrationStatus,
} from "@prisma/client";

import { clampPage, toPageInfo } from "@/common/pagination/pagination";
import { PrismaService } from "@/prisma/prisma.service";
import { StorageService, type UploadTarget } from "@/storage/storage.service";
import type {
  RatingSummary,
  Review,
  ReviewEligibility,
  ReviewInput,
  ReviewsResult,
} from "./reviews.type";

const MAX_BODY = 1500;
const MAX_IMAGES = 3;

export const reviewInclude = {
  user: { select: { name: true, email: true, image: true } },
  product: { select: { name: true, slug: true } },
  event: { select: { title: true, slug: true } },
} satisfies Prisma.ReviewInclude;

type ReviewRow = Prisma.ReviewGetPayload<{ include: typeof reviewInclude }>;

export type ReviewSubject = { product_id: number } | { event_id: number };

// Reviewers show as a first name so the shelf stays personal without exposing full identities.
export function displayName(name: string | null, email: string): string {
  const first = name?.trim().split(/\s+/)[0];
  return first && first.length > 0
    ? first
    : email.split("@")[0] || "A customer";
}

export function toReview(row: ReviewRow, viewerId: number | null): Review {
  return {
    id: row.id,
    rating: row.rating,
    body: row.body,
    image_urls: row.image_urls,
    created_at: row.created_at,
    author: {
      name: displayName(row.user.name, row.user.email),
      image: row.user.image,
    },
    is_mine: viewerId !== null && row.user_id === viewerId,
    subject_name: row.product?.name ?? row.event?.title ?? null,
    subject_href: row.product
      ? `/products/${row.product.slug}`
      : row.event
        ? `/events/${row.event.slug}`
        : null,
  };
}

export function summarise(ratings: number[]): RatingSummary {
  const distribution = [0, 0, 0, 0, 0];
  for (const rating of ratings) {
    const index = Math.min(5, Math.max(1, rating)) - 1;
    distribution[index] = (distribution[index] ?? 0) + 1;
  }
  const count = ratings.length;
  const average =
    count === 0
      ? 0
      : Math.round(
          (ratings.reduce((sum, rating) => sum + rating, 0) / count) * 10,
        ) / 10;
  return { average, count, distribution };
}

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async list(
    subject: ReviewSubject,
    page: number | null,
    limit: number | null,
    viewerId: number | null,
  ): Promise<ReviewsResult> {
    const bounds = clampPage(page, limit, 20);
    const where: Prisma.ReviewWhereInput = subject;
    const [rows, ratings] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: reviewInclude,
        orderBy: { created_at: "desc" },
        skip: bounds.skip,
        take: bounds.limit,
      }),
      this.prisma.review.findMany({ where, select: { rating: true } }),
    ]);
    const summary = summarise(ratings.map((row) => row.rating));
    return {
      items: rows.map((row) => toReview(row, viewerId)),
      page_info: toPageInfo(bounds, summary.count),
      summary,
    };
  }

  async featured(limit: number): Promise<Review[]> {
    const rows = await this.prisma.review.findMany({
      where: { rating: { gte: 4 }, body: { not: null } },
      include: reviewInclude,
      orderBy: { created_at: "desc" },
      take: Math.min(12, Math.max(1, limit)),
    });
    return rows.map((row) => toReview(row, null));
  }

  async eligibility(
    subject: ReviewSubject,
    userId: number | null,
  ): Promise<ReviewEligibility> {
    if (userId === null) {
      return {
        can_review: false,
        reason: "Sign in to review",
        my_review: null,
      };
    }
    const existing = await this.prisma.review.findFirst({
      where: { ...subject, user_id: userId },
      include: reviewInclude,
    });
    if (existing) {
      return {
        can_review: true,
        reason: null,
        my_review: toReview(existing, userId),
      };
    }
    const reason = await this.ineligibleReason(subject, userId);
    return { can_review: reason === null, reason, my_review: null };
  }

  async create(
    subject: ReviewSubject,
    userId: number,
    input: ReviewInput,
  ): Promise<Review> {
    const data = this.validate(input);
    const reason = await this.ineligibleReason(subject, userId);
    if (reason) {
      throw new ForbiddenException(reason);
    }
    const existing = await this.prisma.review.findFirst({
      where: { ...subject, user_id: userId },
    });
    if (existing) {
      throw new BadRequestException(
        "You have already reviewed this. Edit your review instead.",
      );
    }
    const row = await this.prisma.withTransaction(async () => {
      const created = await this.prisma.review.create({
        data: { ...subject, user_id: userId, ...data },
        include: reviewInclude,
      });
      await this.refreshRating(subject);
      return created;
    });
    return toReview(row, userId);
  }

  async update(
    id: number,
    userId: number,
    input: ReviewInput,
  ): Promise<Review> {
    const data = this.validate(input);
    const row = await this.prisma.withTransaction(async () => {
      const current = await this.prisma.review.findFirst({
        where: { id, user_id: userId },
      });
      if (!current) {
        throw new NotFoundException("Review not found");
      }
      const updated = await this.prisma.review.update({
        where: { id },
        data,
        include: reviewInclude,
      });
      await this.refreshRating(
        current.product_id !== null
          ? { product_id: current.product_id }
          : { event_id: current.event_id ?? 0 },
      );
      return updated;
    });
    return toReview(row, userId);
  }

  async remove(id: number, userId: number, isAdmin = false): Promise<boolean> {
    await this.prisma.withTransaction(async () => {
      const current = await this.prisma.review.findFirst({
        where: isAdmin ? { id } : { id, user_id: userId },
      });
      if (!current) {
        throw new NotFoundException("Review not found");
      }
      await this.prisma.review.delete({ where: { id } });
      await this.refreshRating(
        current.product_id !== null
          ? { product_id: current.product_id }
          : { event_id: current.event_id ?? 0 },
      );
    });
    return true;
  }

  createImageUpload(input: {
    filename: string;
    content_type: string;
    size: number;
  }): Promise<UploadTarget> {
    return this.storage.createImageUpload({ folder: "reviews", ...input });
  }

  // Product reviews need a delivered order with the piece; event reviews need a confirmed seat at a past event.
  private async ineligibleReason(
    subject: ReviewSubject,
    userId: number,
  ): Promise<string | null> {
    if ("product_id" in subject) {
      const delivered = await this.prisma.orderItem.count({
        where: {
          product_id: subject.product_id,
          order: { user_id: userId, status: OrderStatus.DELIVERED },
        },
      });
      return delivered > 0
        ? null
        : "You can review a piece once it has been delivered to you";
    }
    const attended = await this.prisma.eventRegistration.count({
      where: {
        event_id: subject.event_id,
        user_id: userId,
        status: RegistrationStatus.CONFIRMED,
        event: {
          OR: [
            { status: EventStatus.COMPLETED },
            { ends_at: { lt: new Date() } },
          ],
        },
      },
    });
    return attended > 0 ? null : "You can review an event after attending it";
  }

  private validate(input: ReviewInput): {
    rating: number;
    body: string | null;
    image_urls: string[];
  } {
    const rating = Math.trunc(input.rating);
    if (rating < 1 || rating > 5) {
      throw new BadRequestException("Rating must be between 1 and 5 stars");
    }
    const body = input.body?.trim().slice(0, MAX_BODY) || null;
    const image_urls = (input.image_urls ?? [])
      .map((url) => url.trim())
      .filter((url) => url.length > 0)
      .slice(0, MAX_IMAGES);
    for (const url of image_urls) {
      if (!this.storage.isOwnUrl(url)) {
        throw new BadRequestException(
          "Review photos must be uploaded through the site",
        );
      }
    }
    return { rating, body, image_urls };
  }

  // Denormalised averages keep cards and sorting cheap.
  private async refreshRating(subject: ReviewSubject): Promise<void> {
    const aggregate = await this.prisma.review.aggregate({
      where: subject,
      _avg: { rating: true },
      _count: { rating: true },
    });
    const data = {
      rating_avg: Math.round((aggregate._avg.rating ?? 0) * 10) / 10,
      rating_count: aggregate._count.rating,
    };
    if ("product_id" in subject) {
      await this.prisma.product.update({
        where: { id: subject.product_id },
        data,
      });
    } else {
      await this.prisma.event.update({ where: { id: subject.event_id }, data });
    }
  }
}
