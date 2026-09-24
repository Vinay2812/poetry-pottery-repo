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
import { QueueService } from "@/queue/queue.service";
import { RedisService } from "@/redis/redis.service";
import { StorageService, type UploadTarget } from "@/storage/storage.service";
import type {
  RatingSummary,
  Review,
  ReviewEligibility,
  ReviewInput,
  ReviewsResult,
  ReviewUploadInput,
} from "./reviews.type";

const MAX_BODY = 1000;
const MAX_IMAGES = 3;
const REVIEW_FOLDER = "reviews";
// A photo waits a day for the review it belongs to; after that it is an orphan in the bucket.
const PENDING_UPLOAD_SECONDS = 24 * 60 * 60;
const MAX_PENDING_UPLOADS = 12;
const ALREADY_REVIEWED =
  "You have already reviewed this. Edit your review instead.";

function pendingUploadsKey(userId: number): string {
  return `reviews:uploads:${userId}`;
}

export const reviewInclude = {
  user: { select: { name: true, image: true } },
  product: { select: { name: true, slug: true } },
  event: { select: { title: true, slug: true } },
} satisfies Prisma.ReviewInclude;

type ReviewRow = Prisma.ReviewGetPayload<{ include: typeof reviewInclude }>;

export type ReviewSubject = { product_id: number } | { event_id: number };
export type ReviewSubjectKind = "product_id" | "event_id";

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
export function displayName(name: string | null): string {
  const first = name?.trim().split(/\s+/)[0];
  return first && first.length > 0 ? first : "A customer";
}

export function toReview(row: ReviewRow, viewerId: number | null): Review {
  return {
    id: row.id,
    rating: row.rating,
    body: row.body,
    image_urls: row.image_urls,
    created_at: row.created_at,
    author: { name: displayName(row.user.name), image: row.user.image },
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

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly redis: RedisService,
    private readonly queue: QueueService,
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

  // The rules of eligibility() for a whole list, in at most two queries; the integration suite checks they agree.
  async eligibilityFor(
    kind: ReviewSubjectKind,
    ids: number[],
    userId: number | null,
  ): Promise<Map<number, ReviewEligibility>> {
    if (userId === null) {
      return new Map(
        ids.map((id) => [
          id,
          { can_review: false, reason: "Sign in to review", my_review: null },
        ]),
      );
    }
    const reviews = await this.prisma.review.findMany({
      where: {
        user_id: userId,
        ...(kind === "product_id"
          ? { product_id: { in: ids } }
          : { event_id: { in: ids } }),
      },
      include: reviewInclude,
    });
    const found = new Map<number, ReviewEligibility>();
    for (const row of reviews) {
      const id = kind === "product_id" ? row.product_id : row.event_id;
      if (id !== null) {
        found.set(id, {
          can_review: true,
          reason: null,
          my_review: toReview(row, userId),
        });
      }
    }
    const unreviewed = ids.filter((id) => !found.has(id));
    if (unreviewed.length === 0) return found;
    const eligible =
      kind === "product_id"
        ? await this.deliveredProductIds(unreviewed, userId)
        : await this.attendedEventIds(unreviewed, userId);
    const reason =
      kind === "product_id"
        ? "You can review a piece once it has been delivered to you"
        : "You can review an event after attending it";
    for (const id of unreviewed) {
      found.set(
        id,
        eligible.has(id)
          ? { can_review: true, reason: null, my_review: null }
          : { can_review: false, reason, my_review: null },
      );
    }
    return found;
  }

  private async deliveredProductIds(
    productIds: number[],
    userId: number,
  ): Promise<Set<number>> {
    const lines = await this.prisma.orderItem.findMany({
      where: {
        product_id: { in: productIds },
        order: { user_id: userId, status: OrderStatus.DELIVERED },
      },
      select: { product_id: true },
      distinct: ["product_id"],
    });
    return new Set(lines.map((line) => line.product_id));
  }

  private async attendedEventIds(
    eventIds: number[],
    userId: number,
  ): Promise<Set<number>> {
    const seats = await this.prisma.eventRegistration.findMany({
      where: {
        event_id: { in: eventIds },
        user_id: userId,
        status: RegistrationStatus.CONFIRMED,
        event: {
          OR: [
            { status: EventStatus.COMPLETED },
            { ends_at: { lt: new Date() } },
          ],
        },
      },
      select: { event_id: true },
    });
    return new Set(seats.map((seat) => seat.event_id));
  }

  async create(
    subject: ReviewSubject,
    userId: number,
    input: ReviewInput,
  ): Promise<Review> {
    const data = this.validate(input);
    this.assertOwnPhotos(userId, data.image_urls, []);
    const row = await this.prisma
      .withTransaction(async () => {
        await this.lockSubject(subject);
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
    await this.settleImages(userId, data.image_urls, []);
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
      this.assertOwnPhotos(userId, data.image_urls, current.image_urls);
      await this.lockSubject(subjectOf(current));
      const updated = await this.prisma.review.update({
        where: { id },
        data,
        include: reviewInclude,
      });
      await this.refreshRating(subjectOf(current));
      // The photos it let go are only reclaimed once the new set is committed.
      await this.prisma.afterCommit(() =>
        this.settleImages(
          userId,
          data.image_urls,
          current.image_urls.filter((url) => !data.image_urls.includes(url)),
        ),
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
      const subject = subjectOf(current);
      await this.lockSubject(subject);
      await this.prisma.review.delete({ where: { id } });
      await this.refreshRating(subject);
      await this.prisma.afterCommit(() =>
        this.discardImages(current.image_urls),
      );
    });
    return true;
  }

  // A presigned URL is only minted for someone who may actually review this piece or event, and
  // every key is parked for a day so anything that never reaches a review can be swept.
  async createImageUpload(
    userId: number,
    input: ReviewUploadInput,
  ): Promise<UploadTarget> {
    const subject = subjectOf({
      product_id: input.product_id ?? null,
      event_id: input.event_id ?? null,
    });
    const [reason, existing] = await Promise.all([
      this.ineligibleReason(subject, userId),
      this.prisma.review.findFirst({
        where: { ...subject, user_id: userId },
        select: { id: true },
      }),
    ]);
    if (reason && !existing) {
      throw new ForbiddenException(reason);
    }
    const pendingKey = pendingUploadsKey(userId);
    const { expired, pending } = await this.redis.sweepPending(
      pendingKey,
      Date.now() - PENDING_UPLOAD_SECONDS * 1000,
    );
    await this.deleteObjects(expired);
    if (pending >= MAX_PENDING_UPLOADS) {
      throw new BadRequestException(
        "Too many photos are waiting on a review; post the ones you have first",
      );
    }
    const target = await this.storage.createImageUpload({
      folder: REVIEW_FOLDER,
      subfolder: String(userId),
      filename: input.filename,
      content_type: input.content_type,
      size: input.size,
    });
    await this.redis.trackPending(
      pendingKey,
      target.key,
      PENDING_UPLOAD_SECONDS,
    );
    return target;
  }

  // Photos that reached a review stop waiting to be swept; the ones it let go are reclaimed now.
  private async settleImages(
    userId: number,
    kept: string[],
    dropped: string[],
  ): Promise<void> {
    await this.redis.dropPending(pendingUploadsKey(userId), this.toKeys(kept));
    await this.discardImages(dropped);
  }

  private discardImages(urls: string[]): Promise<void> {
    return this.deleteObjects(this.toKeys(urls));
  }

  // Only review photos are ever reclaimed here, whatever URL a review row ended up holding.
  private toKeys(urls: string[]): string[] {
    return urls.flatMap((url) => {
      const key = this.storage.keyFor(url);
      return key?.startsWith(`${REVIEW_FOLDER}/`) ? [key] : [];
    });
  }

  // A review may carry photos this reviewer uploaded, or ones it already had; never someone else's object.
  private assertOwnPhotos(
    userId: number,
    urls: string[],
    attached: string[],
  ): void {
    const ownPrefix = `${REVIEW_FOLDER}/${userId}/`;
    for (const url of urls) {
      if (attached.includes(url)) continue;
      if (!this.storage.keyFor(url)?.startsWith(ownPrefix)) {
        throw new BadRequestException(
          "Review photos must be uploaded through the site",
        );
      }
    }
  }

  private async deleteObjects(keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.queue.publish("storage.delete-object", { key });
    }
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
    return { rating, body, image_urls };
  }

  // Pins the piece or event for the rest of the transaction, the way orders pin stock, so two
  // overlapping review writes cannot each aggregate without seeing the other. It has to come
  // before the insert: writing a review takes a share lock on the same row, and upgrading that
  // to an exclusive lock afterwards deadlocks a crowd posting at once.
  async lockSubject(subject: ReviewSubject): Promise<void> {
    if ("product_id" in subject) {
      await this.prisma
        .$executeRaw`SELECT id FROM products WHERE id = ${subject.product_id} FOR UPDATE`;
      return;
    }
    await this.prisma
      .$executeRaw`SELECT id FROM events WHERE id = ${subject.event_id} FOR UPDATE`;
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
