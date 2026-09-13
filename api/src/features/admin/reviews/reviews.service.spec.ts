import { NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "@/prisma/prisma.service";
import { ReviewsService } from "@/features/reviews/reviews.service";
import { AdminReviewsService, toAdminReview } from "./reviews.service";
import { ReviewSubjectKind } from "./reviews.type";

const row = {
  id: 11,
  user_id: 7,
  product_id: 3,
  event_id: null,
  rating: 5,
  body: "Lovely glaze.",
  image_urls: [],
  is_hidden: false,
  created_at: new Date(),
  updated_at: new Date(),
  user: {
    id: 7,
    name: "Maya",
    email: "maya@example.com",
    image: null,
  },
  product: { name: "Slate morning mug", slug: "slate-morning-mug" },
  event: null,
};

const prismaMock = {
  review: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  },
  withTransaction: vi.fn((fn: () => Promise<unknown>) => fn()),
};
const reviewsMock = { refreshRating: vi.fn(), remove: vi.fn() };

describe("toAdminReview", () => {
  it("labels the subject and never marks a review as the admin's own", () => {
    const admin = toAdminReview(row);

    expect(admin.subject_kind).toBe(ReviewSubjectKind.PRODUCT);
    expect(admin.review.is_mine).toBe(false);
    expect(admin.customer.email).toBe("maya@example.com");
  });
});

describe("AdminReviewsService", () => {
  let service: AdminReviewsService;

  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock.review.findMany.mockResolvedValue([row]);
    prismaMock.review.count.mockResolvedValue(1);
    prismaMock.review.findUnique.mockResolvedValue(row);
    prismaMock.review.update.mockResolvedValue({ ...row, is_hidden: true });
    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminReviewsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ReviewsService, useValue: reviewsMock },
      ],
    }).compile();
    service = moduleRef.get(AdminReviewsService);
  });

  it("lists hidden reviews too", async () => {
    const result = await service.list({ is_hidden: true });

    expect(result.items).toHaveLength(1);
    expect(prismaMock.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { is_hidden: true } }),
    );
  });

  it("filters product reviews apart from event reviews", async () => {
    await service.list({ subject_kind: ReviewSubjectKind.EVENT });

    expect(prismaMock.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { event_id: { not: null } } }),
    );
  });

  it("searches the body and the reviewer's email", async () => {
    await service.list({ search: "glaze" });

    const call = prismaMock.review.findMany.mock.calls[0]?.[0] as {
      where: { OR: unknown[] };
    };
    expect(call.where.OR).toHaveLength(2);
  });

  it("hides a review and refreshes the piece's rating", async () => {
    const result = await service.setHidden(11, true);

    expect(result.is_hidden).toBe(true);
    expect(reviewsMock.refreshRating).toHaveBeenCalledWith({ product_id: 3 });
  });

  it("unhides a review and refreshes again", async () => {
    prismaMock.review.update.mockResolvedValue({ ...row, is_hidden: false });

    await service.setHidden(11, false);

    expect(prismaMock.review.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { is_hidden: false } }),
    );
    expect(reviewsMock.refreshRating).toHaveBeenCalled();
  });

  it("reports a missing review", async () => {
    prismaMock.review.findUnique.mockResolvedValue(null);

    await expect(service.setHidden(99, true)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("hard deletes through the shared admin path", async () => {
    reviewsMock.remove.mockResolvedValue(true);

    await expect(service.remove(11)).resolves.toBe(true);
    expect(reviewsMock.remove).toHaveBeenCalledWith(11, 0, true);
  });
});
