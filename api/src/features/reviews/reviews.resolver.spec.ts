import { Test } from "@nestjs/testing";
import { UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthGuard } from "@/common/guards/auth.guard";
import type {
  AppRequest,
  AppResponse,
  GqlContext,
} from "@/common/types/express";
import type { Event } from "@/features/events/events.type";
import type { Product } from "@/features/products/products.type";
import {
  EventReviewEligibilityResolver,
  ProductReviewEligibilityResolver,
} from "./reviews.resolver";
import { ReviewsService } from "./reviews.service";
import type { ReviewEligibility } from "./reviews.type";

function gqlContext(): GqlContext {
  return { req: {} as AppRequest, res: {} as AppResponse };
}

// The eligibility fields only read the parent's id.
const product = (id: number): Product => ({ id }) as Product;
const event = (id: number): Event => ({ id }) as Event;

const open: ReviewEligibility = {
  can_review: true,
  reason: null,
  my_review: null,
};

const reviewsMock = {
  eligibilityFor: vi.fn<ReviewsService["eligibilityFor"]>(),
};

const authGuardMock = {
  tryAuthenticate: vi.fn<AuthGuard["tryAuthenticate"]>(),
};

describe("review eligibility fields", () => {
  let products: ProductReviewEligibilityResolver;
  let events: EventReviewEligibilityResolver;

  beforeEach(async () => {
    vi.clearAllMocks();
    reviewsMock.eligibilityFor.mockImplementation((_kind, ids) =>
      Promise.resolve(new Map(ids.map((id) => [id, open]))),
    );
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProductReviewEligibilityResolver,
        EventReviewEligibilityResolver,
        { provide: ReviewsService, useValue: reviewsMock },
        { provide: AuthGuard, useValue: authGuardMock },
      ],
    }).compile();
    products = moduleRef.get(ProductReviewEligibilityResolver);
    events = moduleRef.get(EventReviewEligibilityResolver);
  });

  it("answers a whole list of pieces for the signed-in visitor in one call", async () => {
    authGuardMock.tryAuthenticate.mockResolvedValue({
      db_user_id: 7,
      role: UserRole.USER,
      auth_id: "user_7",
    });
    const context = gqlContext();

    await Promise.all(
      [1, 2, 2].map((id) => products.review_eligibility(product(id), context)),
    );

    expect(reviewsMock.eligibilityFor).toHaveBeenCalledTimes(1);
    expect(reviewsMock.eligibilityFor).toHaveBeenCalledWith(
      "product_id",
      [1, 2],
      7,
    );
  });

  it("asks with no user when nobody is signed in", async () => {
    authGuardMock.tryAuthenticate.mockResolvedValue(null);
    const context = gqlContext();

    await Promise.all([
      events.review_eligibility(event(4), context),
      events.review_eligibility(event(5), context),
    ]);

    expect(reviewsMock.eligibilityFor).toHaveBeenCalledWith(
      "event_id",
      [4, 5],
      null,
    );
  });
});
