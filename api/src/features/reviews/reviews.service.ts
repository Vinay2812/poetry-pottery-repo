import {
  BadRequestException,
  ConflictException,
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

const MAX_BODY = 1000;
const MAX_IMAGES = 3;
const ALREADY_REVIEWED =
  "You have already reviewed this. Edit your review instead.";

export const reviewInclude = {
  user: { select: { name: true, email: true, image: true } },
  product: { select: { name: true, slug: true } },
  event: { select: { title: true, slug: true } },
} satisfies Prisma.ReviewInclude;

type ReviewRow = Prisma.ReviewGetPayload<{ include: typeof reviewInclude }>;

export type ReviewSubject = { product_id: number } | { event_id: number };

// A row always carries exactly one of the two foreign keys; the schema allows both to be null.
export function subjectOf(row: {
  product_id: number | null;
  event_id: number | null;
}): ReviewSubject {
  if (row.product_id !== null) {
    return { product_id: row.product_id };
  }
  if (row.event_id !== null) {
    return { event_id: row.event_id };
  }
  throw new NotFoundException("Review is not attached to a piece or an event");
}

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

export function summariseCounts(
  buckets: { rating: number; count: number }[],
): RatingSummary {
  const distribution = [0, 0, 0, 0, 0];
  let count = 0;
  let total = 0;
  for (const bucket of buckets) {
    const index = Math.min(5, Math.max(1, bucket.rating)) - 1;
    distribution[index] = (distribution[index] ?? 0) + bucket.count;
    count += bucket.count;
    total += bucket.rating * bucket.count;
  }
  const average = count === 0 ? 0 : Math.round((total / count) * 10) / 10;
  return { average, count, distribution };
}

export function summarise(ratings: number[]): RatingSummary {
  return summariseCounts(ratings.map((rating) => ({ rating, count: 1 })));
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
    // Hidden reviews leave the storefront entirely, counts and summary included.
    const where: Prisma.ReviewWhereInput = { ...subject, is_hidden: false };
    // One grouped count instead of reading every rating row for the summary.
    const [rows, buckets] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: reviewInclude,
        orderBy: { created_at: "desc" },
        skip: bounds.skip,
        take: bounds.limit,
      }),
      this.prisma.review.groupBy({
        by: ["rating"],
        where,
        _count: { _all: true },
      }),
    ]);
    const summary = summariseCounts(
      buckets.map((bucket) => ({
        rating: bucket.rating,
        count: bucket._count._all,
      })),
    );
    return {
      items: rows.map((row) => toReview(row, viewerId)),
      page_info: toPageInfo(bounds, summary.count),
      summary,
    };
  }

  // The home row only carries reviews whose piece or event is still on the site.
  async recent(limit: number): Promise<Review[]> {
    const rows = await this.prisma.review.findMany({
      where: {
        rating: { gte: 4 },
        body: { not: null },
        is_hidden: false,
        OR: [
          { product: { is_active: true } },
          {
            event: {
              status: { in: [EventStatus.PUBLISHED, EventStatus.COMPLETED] },
            },
          },
        ],
      },
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
    const row = await this.prisma
      .withTransaction(async () => {
        const reason = await this.ineligibleReason(subject, userId);
        if (reason) {
          throw new ForbiddenException(reason);
        }
        const existing = await this.prisma.review.findFirst({
          where: { ...subject, user_id: userId },
        });
        if (existing) {
          throw new ConflictException(ALREADY_REVIEWED);
        }
        const created = await this.prisma.review.create({
          data: { ...subject, user_id: userId, ...data },
          include: reviewInclude,
        });
        await this.refreshRating(subject);
        return created;
      })
      .catch((error: unknown) => {
        // Two submissions in flight land on the unique index rather than the read above.
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw new ConflictException(ALREADY_REVIEWED);
        }
        throw error;
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
      await this.refreshRating(subjectOf(current));
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
      const subject = subjectOf(current);
      await this.prisma.review.delete({ where: { id } });
      await this.refreshRating(subject);
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
    const body = input.body?.trim() || null;
    if (body && body.length > MAX_BODY) {
      throw new BadRequestException(
        `Reviews are limited to ${MAX_BODY} characters`,
      );
    }
    const image_urls = [
      ...new Set(
        (input.image_urls ?? [])
          .map((url) => url.trim())
          .filter((url) => url.length > 0),
      ),
    ];
    if (image_urls.length > MAX_IMAGES) {
      throw new BadRequestException(
        `A review can carry up to ${MAX_IMAGES} photos`,
      );
    }
    for (const url of image_urls) {
      if (!this.storage.isOwnUrl(url)) {
        throw new BadRequestException(
          "Review photos must be uploaded through the site",
        );
      }
    }
    return { rating, body, image_urls };
  }

  // Denormalised averages keep cards and sorting cheap; moderation calls this after hiding a review.
  async refreshRating(subject: ReviewSubject): Promise<void> {
    const aggregate = await this.prisma.review.aggregate({
      where: { ...subject, is_hidden: false },
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
