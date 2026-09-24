import { BadRequestException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { Prisma, UploadPurpose } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "@/prisma/prisma.service";
import { UploadsService } from "@/uploads/uploads.service";
import {
  displayName,
  ReviewsService,
  subjectOf,
  summariseCounts,
} from "./reviews.service";

const containing = (value: Record<string, unknown>): unknown =>
  expect.objectContaining(value);

const prismaMock = {
  withTransaction: vi.fn((fn: () => Promise<unknown>) => fn()),
  afterCommit: vi.fn((fn: () => Promise<void> | void) => Promise.resolve(fn())),
  $executeRaw: vi.fn(),
  review: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    aggregate: vi.fn(),
    groupBy: vi.fn(),
  },
  orderItem: { count: vi.fn(), findMany: vi.fn() },
  eventRegistration: { count: vi.fn(), findMany: vi.fn() },
  product: { update: vi.fn() },
  event: { update: vi.fn() },
};
const uploadsMock = { issue: vi.fn(), claim: vi.fn(), release: vi.fn() };

function reviewRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    user_id: 7,
    product_id: 3,
    event_id: null,
    rating: 5,
    body: "Lovely glaze",
    image_urls: [],
    created_at: new Date(),
    updated_at: new Date(),
    user: { name: "Maya Iyer", image: null },
    product: { name: "Mug", slug: "mug" },
    event: null,
    ...overrides,
  };
}

describe("review helpers", () => {
  it("summarises grouped counts without reading every row", () => {
    expect(
      summariseCounts([
        { rating: 5, count: 2 },
        { rating: 4, count: 1 },
        { rating: 2, count: 1 },
      ]),
    ).toEqual({ average: 4, count: 4, distribution: [0, 1, 0, 1, 2] });
    expect(summariseCounts([])).toEqual({
      average: 0,
      count: 0,
      distribution: [0, 0, 0, 0, 0],
    });
  });

  it("shows a first name and never an email local part", () => {
    expect(displayName("Maya Iyer")).toBe("Maya");
    expect(displayName(null)).toBe("A customer");
    expect(displayName("   ")).toBe("A customer");
  });

  it("reads the subject off a row and refuses a dangling one", () => {
    expect(subjectOf({ product_id: 3, event_id: null })).toEqual({
      product_id: 3,
    });
    expect(subjectOf({ product_id: null, event_id: 9 })).toEqual({
      event_id: 9,
    });
    expect(() => subjectOf({ product_id: null, event_id: null })).toThrow(
      "not attached",
    );
  });
});

describe("ReviewsService", () => {
  let service: ReviewsService;

  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock.review.aggregate.mockResolvedValue({
      _avg: { rating: 4.5 },
      _count: { rating: 2 },
    });
    prismaMock.review.create.mockResolvedValue(reviewRow());
    prismaMock.review.groupBy.mockResolvedValue([
      { rating: 5, _count: { _all: 2 } },
    ]);
    const moduleRef = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: UploadsService, useValue: uploadsMock },
      ],
    }).compile();
    service = moduleRef.get(ReviewsService);
  });

  it("only lets delivered buyers review a product and refreshes the denormalised rating", async () => {
    prismaMock.orderItem.count.mockResolvedValue(0);
    await expect(
      service.create({ product_id: 3 }, 7, { rating: 5 }),
    ).rejects.toThrow("delivered");

    prismaMock.orderItem.count.mockResolvedValue(1);
    prismaMock.review.findFirst.mockResolvedValue(null);
    const review = await service.create({ product_id: 3 }, 7, {
      rating: 5,
      body: "  Lovely glaze  ",
      image_urls: ["https://cdn.test/reviews/7/a.jpg"],
    });

    expect(prismaMock.review.create).toHaveBeenCalledWith(
      containing({
        data: {
          product_id: 3,
          user_id: 7,
          rating: 5,
          body: "Lovely glaze",
          image_urls: ["https://cdn.test/reviews/7/a.jpg"],
        },
      }),
    );
    expect(prismaMock.product.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { rating_avg: 4.5, rating_count: 2 },
    });
    expect(review.is_mine).toBe(true);
    expect(review.author.name).toBe("Maya");
  });

  it("pages reviews like every other list and summarises in one grouped query", async () => {
    prismaMock.review.findMany.mockResolvedValue([reviewRow()]);
    const result = await service.list({ product_id: 3 }, 2, 5, 7);

    expect(prismaMock.review.findMany).toHaveBeenCalledWith(
      containing({ skip: 5, take: 5, orderBy: { created_at: "desc" } }),
    );
    expect(prismaMock.review.groupBy).toHaveBeenCalledWith(
      containing({
        by: ["rating"],
        where: { product_id: 3, is_hidden: false },
      }),
    );
    expect(result.summary).toEqual({
      average: 5,
      count: 2,
      distribution: [0, 0, 0, 0, 2],
    });
    expect(result.page_info).toEqual({
      total: 2,
      page: 2,
      limit: 5,
      has_more: false,
    });
  });

  it("turns a lost duplicate race into a conflict", async () => {
    prismaMock.orderItem.count.mockResolvedValue(1);
    prismaMock.review.findFirst.mockResolvedValue(null);
    prismaMock.review.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("duplicate", {
        code: "P2002",
        clientVersion: "7",
      }),
    );
    await expect(
      service.create({ product_id: 3 }, 7, { rating: 5 }),
    ).rejects.toThrow("already reviewed");
  });

  it("refuses an over-long body and a fourth photo", async () => {
    await expect(
      service.create({ product_id: 3 }, 7, {
        rating: 5,
        body: "a".repeat(1001),
      }),
    ).rejects.toThrow("1000 characters");
    await expect(
      service.create({ product_id: 3 }, 7, {
        rating: 5,
        image_urls: [
          "https://cdn.test/a.jpg",
          "https://cdn.test/b.jpg",
          "https://cdn.test/c.jpg",
          "https://cdn.test/d.jpg",
        ],
      }),
    ).rejects.toThrow("up to 3 photos");
  });

  it("rejects bad ratings and second reviews", async () => {
    await expect(
      service.create({ product_id: 3 }, 7, { rating: 6 }),
    ).rejects.toThrow("between 1 and 5");
    prismaMock.orderItem.count.mockResolvedValue(1);
    prismaMock.review.findFirst.mockResolvedValue(reviewRow());
    await expect(
      service.create({ product_id: 3 }, 7, { rating: 4 }),
    ).rejects.toThrow("already reviewed");
  });

  it("requires a confirmed seat at a finished event", async () => {
    prismaMock.review.findFirst.mockResolvedValue(null);
    prismaMock.eventRegistration.count.mockResolvedValue(0);
    const eligibility = await service.eligibility({ event_id: 9 }, 7);
    expect(eligibility).toMatchObject({
      can_review: false,
      reason: "You can review an event after attending it",
    });
    expect(prismaMock.eventRegistration.count).toHaveBeenCalledWith(
      containing({
        where: containing({ event_id: 9, user_id: 7, status: "CONFIRMED" }),
      }),
    );
  });

  it("answers eligibility for a list of pieces in two queries, like one at a time", async () => {
    prismaMock.review.findMany.mockResolvedValue([
      reviewRow({ product_id: 3 }),
    ]);
    prismaMock.orderItem.findMany.mockResolvedValue([{ product_id: 4 }]);

    const found = await service.eligibilityFor("product_id", [3, 4, 5], 7);

    expect(found.get(3)).toMatchObject({ can_review: true, reason: null });
    expect(found.get(3)?.my_review?.id).toBe(1);
    expect(found.get(4)).toEqual({
      can_review: true,
      reason: null,
      my_review: null,
    });
    expect(found.get(5)).toEqual({
      can_review: false,
      reason: "You can review a piece once it has been delivered to you",
      my_review: null,
    });
    expect(prismaMock.review.findMany).toHaveBeenCalledWith(
      containing({ where: { user_id: 7, product_id: { in: [3, 4, 5] } } }),
    );
    expect(prismaMock.orderItem.findMany).toHaveBeenCalledWith(
      containing({
        where: {
          product_id: { in: [4, 5] },
          order: { user_id: 7, status: "DELIVERED" },
        },
      }),
    );
  });

  it("asks for a confirmed seat at a finished event across a list of events", async () => {
    prismaMock.review.findMany.mockResolvedValue([]);
    prismaMock.eventRegistration.findMany.mockResolvedValue([{ event_id: 9 }]);

    const found = await service.eligibilityFor("event_id", [9, 10], 7);

    expect(found.get(9)?.can_review).toBe(true);
    expect(found.get(10)).toEqual({
      can_review: false,
      reason: "You can review an event after attending it",
      my_review: null,
    });
    expect(prismaMock.eventRegistration.findMany).toHaveBeenCalledWith(
      containing({
        where: containing({
          event_id: { in: [9, 10] },
          user_id: 7,
          status: "CONFIRMED",
        }),
      }),
    );
  });

  it("skips the second query once every piece on the list is already reviewed", async () => {
    prismaMock.review.findMany.mockResolvedValue([
      reviewRow({ product_id: 3 }),
    ]);

    await service.eligibilityFor("product_id", [3], 7);

    expect(prismaMock.orderItem.findMany).not.toHaveBeenCalled();
  });

  it("tells a signed-out visitor to sign in without touching the database", async () => {
    const found = await service.eligibilityFor("event_id", [9], null);

    expect(found.get(9)).toEqual({
      can_review: false,
      reason: "Sign in to review",
      my_review: null,
    });
    expect(prismaMock.review.findMany).not.toHaveBeenCalled();
  });

  it("reports an existing review as editable", async () => {
    prismaMock.review.findFirst.mockResolvedValue(reviewRow());
    const eligibility = await service.eligibility({ product_id: 3 }, 7);
    expect(eligibility.can_review).toBe(true);
    expect(eligibility.my_review?.id).toBe(1);
  });

  it("only lets the owner edit, then pins the piece and refreshes its rating", async () => {
    prismaMock.review.findFirst.mockResolvedValue(null);
    await expect(service.update(1, 8, { rating: 3 })).rejects.toThrow(
      "Review not found",
    );
    expect(prismaMock.review.findFirst).toHaveBeenCalledWith({
      where: { id: 1, user_id: 8 },
    });
    expect(prismaMock.review.update).not.toHaveBeenCalled();

    prismaMock.review.findFirst.mockResolvedValue(reviewRow());
    prismaMock.review.update.mockResolvedValue(reviewRow({ rating: 3 }));
    const updated = await service.update(1, 7, { rating: 3 });

    expect(updated.rating).toBe(3);
    expect(prismaMock.$executeRaw).toHaveBeenCalledWith(
      expect.arrayContaining([expect.stringContaining("FOR UPDATE")]),
      3,
    );
    expect(prismaMock.product.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { rating_avg: 4.5, rating_count: 2 },
    });
  });

  it("only shelves warm reviews of pieces and events still on the site", async () => {
    prismaMock.review.findMany.mockResolvedValue([reviewRow()]);
    const rows = await service.recent(50);

    expect(rows).toHaveLength(1);
    expect(rows[0]?.is_mine).toBe(false);
    expect(prismaMock.review.findMany).toHaveBeenCalledWith(
      containing({
        take: 12,
        orderBy: { created_at: "desc" },
        where: {
          rating: { gte: 4 },
          body: { not: null },
          is_hidden: false,
          OR: [
            { product: { is_active: true } },
            { event: { status: { in: ["PUBLISHED", "COMPLETED"] } } },
          ],
        },
      }),
    );
  });

  it("claims the photos with the review, inside the write, and surfaces a refused claim", async () => {
    prismaMock.orderItem.count.mockResolvedValue(1);
    prismaMock.review.findFirst.mockResolvedValue(null);

    await service.create({ product_id: 3 }, 7, {
      rating: 5,
      image_urls: ["https://cdn.test/reviews/7/a.jpg"],
    });
    expect(uploadsMock.claim).toHaveBeenCalledWith(7, UploadPurpose.REVIEW, [
      "https://cdn.test/reviews/7/a.jpg",
    ]);
    expect(prismaMock.withTransaction).toHaveBeenCalled();

    uploadsMock.claim.mockRejectedValueOnce(
      new BadRequestException("That photo was not uploaded through the site"),
    );
    await expect(
      service.create({ product_id: 3 }, 7, {
        rating: 5,
        image_urls: ["https://cdn.test/reviews/8/theirs.jpg"],
      }),
    ).rejects.toThrow("not uploaded through the site");
  });

  it("releases the photos an edit dropped and keeps the ones it kept", async () => {
    prismaMock.review.findFirst.mockResolvedValue(
      reviewRow({
        image_urls: [
          "https://cdn.test/reviews/a.jpg",
          "https://cdn.test/reviews/b.jpg",
        ],
      }),
    );
    prismaMock.review.update.mockResolvedValue(reviewRow());
    await service.update(1, 7, {
      rating: 4,
      image_urls: ["https://cdn.test/reviews/a.jpg"],
    });

    // The kept photo is grandfathered in; only the dropped one is let go.
    expect(uploadsMock.claim).toHaveBeenCalledWith(
      7,
      UploadPurpose.REVIEW,
      ["https://cdn.test/reviews/a.jpg"],
      ["https://cdn.test/reviews/a.jpg", "https://cdn.test/reviews/b.jpg"],
    );
    expect(uploadsMock.release).toHaveBeenCalledWith([
      "https://cdn.test/reviews/b.jpg",
    ]);
  });

  it("only issues a review photo to someone who may review the subject", async () => {
    const upload = {
      product_id: 3,
      filename: "a.jpg",
      content_type: "image/jpeg",
      size: 2048,
    };
    prismaMock.review.findFirst.mockResolvedValue(null);
    prismaMock.orderItem.count.mockResolvedValue(0);
    await expect(service.createImageUpload(7, upload)).rejects.toThrow(
      "delivered",
    );
    expect(uploadsMock.issue).not.toHaveBeenCalled();

    prismaMock.orderItem.count.mockResolvedValue(1);
    uploadsMock.issue.mockResolvedValue({
      upload_url: "https://upload.test/put",
      public_url: "https://cdn.test/reviews/7/a.jpg",
      key: "reviews/7/a.jpg",
    });
    const target = await service.createImageUpload(7, upload);

    expect(target.key).toBe("reviews/7/a.jpg");
    expect(uploadsMock.issue).toHaveBeenCalledWith(7, UploadPurpose.REVIEW, {
      filename: "a.jpg",
      content_type: "image/jpeg",
      size: 2048,
    });
  });

  it("releases the photos a removed review pointed at", async () => {
    prismaMock.review.findFirst.mockResolvedValue(
      reviewRow({ image_urls: ["https://cdn.test/reviews/a.jpg"] }),
    );
    await service.remove(1, 7);
    expect(uploadsMock.release).toHaveBeenCalledWith([
      "https://cdn.test/reviews/a.jpg",
    ]);
  });

  it("lets admins delete any review but customers only their own", async () => {
    prismaMock.review.findFirst.mockResolvedValue(null);
    await expect(service.remove(1, 8)).rejects.toThrow("Review not found");
    expect(prismaMock.review.findFirst).toHaveBeenCalledWith({
      where: { id: 1, user_id: 8 },
    });

    prismaMock.review.findFirst.mockResolvedValue(reviewRow());
    await expect(service.remove(1, 8, true)).resolves.toBe(true);
    expect(prismaMock.review.findFirst).toHaveBeenLastCalledWith({
      where: { id: 1 },
    });
    expect(prismaMock.product.update).toHaveBeenCalled();
  });
});
