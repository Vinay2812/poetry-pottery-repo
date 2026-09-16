import { Test } from "@nestjs/testing";
import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "@/prisma/prisma.service";
import { QueueService } from "@/queue/queue.service";
import { RedisService } from "@/redis/redis.service";
import { StorageService } from "@/storage/storage.service";
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
  orderItem: { count: vi.fn() },
  eventRegistration: { count: vi.fn() },
  product: { update: vi.fn() },
  event: { update: vi.fn() },
};
const storageMock = {
  isOwnUrl: vi.fn((url: string) => url.startsWith("https://cdn.test/")),
  keyFor: vi.fn((url: string) =>
    url.startsWith("https://cdn.test/")
      ? url.slice("https://cdn.test/".length)
      : null,
  ),
  createImageUpload: vi.fn(),
};
const redisMock = {
  trackPending: vi.fn(),
  sweepPending: vi.fn(),
  dropPending: vi.fn(),
};
const queueMock = { publish: vi.fn() };

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
    redisMock.sweepPending.mockResolvedValue({ expired: [], pending: 0 });
    const moduleRef = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: StorageService, useValue: storageMock },
        { provide: RedisService, useValue: redisMock },
        { provide: QueueService, useValue: queueMock },
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
      image_urls: ["https://cdn.test/reviews/a.jpg"],
    });

    expect(prismaMock.review.create).toHaveBeenCalledWith(
      containing({
        data: {
          product_id: 3,
          user_id: 7,
          rating: 5,
          body: "Lovely glaze",
          image_urls: ["https://cdn.test/reviews/a.jpg"],
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
      containing({ by: ["rating"], where: { product_id: 3 } }),
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

  it("rejects foreign image hosts, bad ratings and second reviews", async () => {
    await expect(
      service.create({ product_id: 3 }, 7, { rating: 6 }),
    ).rejects.toThrow("between 1 and 5");
    await expect(
      service.create({ product_id: 3 }, 7, {
        rating: 4,
        image_urls: ["https://evil.test/x.jpg"],
      }),
    ).rejects.toThrow("uploaded through the site");
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
          OR: [
            { product: { is_active: true } },
            { event: { status: { in: ["PUBLISHED", "COMPLETED"] } } },
          ],
        },
      }),
    );
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

    expect(redisMock.dropPending).toHaveBeenCalledWith("reviews:uploads:7", [
      "reviews/a.jpg",
    ]);
    expect(queueMock.publish).toHaveBeenCalledWith("storage.delete-object", {
      key: "reviews/b.jpg",
    });
  });

  it("only signs a review photo for someone who may review the subject", async () => {
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
    expect(storageMock.createImageUpload).not.toHaveBeenCalled();

    prismaMock.orderItem.count.mockResolvedValue(1);
    storageMock.createImageUpload.mockResolvedValue({
      upload_url: "https://upload.test/put",
      public_url: "https://cdn.test/reviews/a.jpg",
      key: "reviews/a.jpg",
    });
    const target = await service.createImageUpload(7, upload);

    expect(target.key).toBe("reviews/a.jpg");
    expect(redisMock.trackPending).toHaveBeenCalledWith(
      "reviews:uploads:7",
      "reviews/a.jpg",
      86_400,
    );
  });

  it("sweeps day-old keys and refuses a reviewer hoarding presigned uploads", async () => {
    prismaMock.review.findFirst.mockResolvedValue(null);
    prismaMock.orderItem.count.mockResolvedValue(1);
    redisMock.sweepPending.mockResolvedValue({
      expired: ["reviews/old.jpg"],
      pending: 12,
    });

    await expect(
      service.createImageUpload(7, {
        product_id: 3,
        filename: "a.jpg",
        content_type: "image/jpeg",
        size: 2048,
      }),
    ).rejects.toThrow("waiting on a review");
    expect(queueMock.publish).toHaveBeenCalledWith("storage.delete-object", {
      key: "reviews/old.jpg",
    });
    expect(storageMock.createImageUpload).not.toHaveBeenCalled();
  });

  it("reclaims the photos a removed review pointed at", async () => {
    prismaMock.review.findFirst.mockResolvedValue(
      reviewRow({ image_urls: ["https://cdn.test/reviews/a.jpg"] }),
    );
    await service.remove(1, 7);
    expect(queueMock.publish).toHaveBeenCalledWith("storage.delete-object", {
      key: "reviews/a.jpg",
    });
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
