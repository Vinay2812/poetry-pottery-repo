import {
  Args,
  Context,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { UserRole } from "@prisma/client";

import { AuthRequired } from "@/common/decorators/auth.decorators";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { StrictThrottle } from "@/common/decorators/throttle.decorators";
import { AuthGuard } from "@/common/guards/auth.guard";
import type { AuthUser } from "@/common/clerk/clerk.type";
import type { GqlContext } from "@/common/types/express";
import { Event } from "@/features/events/events.type";
import { Product } from "@/features/products/products.type";
import { ReviewsService } from "./reviews.service";
import {
  Review,
  ReviewEligibility,
  ReviewInput,
  ReviewsResult,
  ReviewUploadInput,
  UploadTarget,
} from "./reviews.type";

@Resolver(() => Review)
export class ReviewsResolver {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly authGuard: AuthGuard,
  ) {}

  @Query(() => ReviewsResult)
  async productReviews(
    @Args("product_id", { type: () => Int }) productId: number,
    @Args("page", { type: () => Int, nullable: true }) page: number | null,
    @Args("limit", { type: () => Int, nullable: true }) limit: number | null,
    @Context() context: GqlContext,
  ): Promise<ReviewsResult> {
    const user = await this.authGuard.tryAuthenticate(context.req);
    return this.reviewsService.list(
      { product_id: productId },
      page,
      limit,
      user?.db_user_id ?? null,
    );
  }

  @Query(() => ReviewsResult)
  async eventReviews(
    @Args("event_id", { type: () => Int }) eventId: number,
    @Args("page", { type: () => Int, nullable: true }) page: number | null,
    @Args("limit", { type: () => Int, nullable: true }) limit: number | null,
    @Context() context: GqlContext,
  ): Promise<ReviewsResult> {
    const user = await this.authGuard.tryAuthenticate(context.req);
    return this.reviewsService.list(
      { event_id: eventId },
      page,
      limit,
      user?.db_user_id ?? null,
    );
  }

  @Query(() => [Review])
  recentReviews(
    @Args("limit", { type: () => Int, nullable: true, defaultValue: 6 })
    limit: number,
  ): Promise<Review[]> {
    return this.reviewsService.recent(limit);
  }

  @AuthRequired()
  @StrictThrottle()
  @Mutation(() => Review)
  createProductReview(
    @CurrentUser() user: AuthUser,
    @Args("product_id", { type: () => Int }) productId: number,
    @Args("input") input: ReviewInput,
  ): Promise<Review> {
    return this.reviewsService.create(
      { product_id: productId },
      user.db_user_id,
      input,
    );
  }

  @AuthRequired()
  @StrictThrottle()
  @Mutation(() => Review)
  createEventReview(
    @CurrentUser() user: AuthUser,
    @Args("event_id", { type: () => Int }) eventId: number,
    @Args("input") input: ReviewInput,
  ): Promise<Review> {
    return this.reviewsService.create(
      { event_id: eventId },
      user.db_user_id,
      input,
    );
  }

  @AuthRequired()
  @StrictThrottle()
  @Mutation(() => Review)
  updateReview(
    @CurrentUser() user: AuthUser,
    @Args("id", { type: () => Int }) id: number,
    @Args("input") input: ReviewInput,
  ): Promise<Review> {
    return this.reviewsService.update(id, user.db_user_id, input);
  }

  @AuthRequired()
  @Mutation(() => Boolean)
  deleteReview(
    @CurrentUser() user: AuthUser,
    @Args("id", { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.reviewsService.remove(
      id,
      user.db_user_id,
      user.role === UserRole.ADMIN,
    );
  }

  @AuthRequired()
  @StrictThrottle()
  @Mutation(() => UploadTarget)
  createReviewImageUpload(
    @Args("input") input: ReviewUploadInput,
  ): Promise<UploadTarget> {
    return this.reviewsService.createImageUpload(input);
  }
}

@Resolver(() => Product)
export class ProductReviewEligibilityResolver {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly authGuard: AuthGuard,
  ) {}

  // Only the product page asks for this, so the extra lookups never hit list queries.
  @ResolveField(() => ReviewEligibility)
  async review_eligibility(
    @Parent() product: Product,
    @Context() context: GqlContext,
  ): Promise<ReviewEligibility> {
    const user = await this.authGuard.tryAuthenticate(context.req);
    return this.reviewsService.eligibility(
      { product_id: product.id },
      user?.db_user_id ?? null,
    );
  }
}

@Resolver(() => Event)
export class EventReviewEligibilityResolver {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly authGuard: AuthGuard,
  ) {}

  @ResolveField(() => ReviewEligibility)
  async review_eligibility(
    @Parent() event: Event,
    @Context() context: GqlContext,
  ): Promise<ReviewEligibility> {
    const user = await this.authGuard.tryAuthenticate(context.req);
    return this.reviewsService.eligibility(
      { event_id: event.id },
      user?.db_user_id ?? null,
    );
  }
}
