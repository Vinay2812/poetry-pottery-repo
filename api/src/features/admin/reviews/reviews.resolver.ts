import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { AdminRequired } from "@/common/decorators/auth.decorators";
import { AdminReviewsService } from "./reviews.service";
import {
  AdminReview,
  AdminReviewsFilterInput,
  AdminReviewsResult,
} from "./reviews.type";

@Resolver(() => AdminReview)
export class AdminReviewsResolver {
  constructor(private readonly reviews: AdminReviewsService) {}

  @AdminRequired()
  @Query(() => AdminReviewsResult)
  adminReviews(
    @Args("filter", { type: () => AdminReviewsFilterInput, nullable: true })
    filter: AdminReviewsFilterInput | null,
  ): Promise<AdminReviewsResult> {
    return this.reviews.list(filter ?? {});
  }

  @AdminRequired()
  @Mutation(() => AdminReview)
  setReviewHidden(
    @Args("id", { type: () => Int }) id: number,
    @Args("is_hidden") isHidden: boolean,
  ): Promise<AdminReview> {
    return this.reviews.setHidden(id, isHidden);
  }

  @AdminRequired()
  @Mutation(() => Boolean)
  deleteReviewAsAdmin(
    @Args("id", { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.reviews.remove(id);
  }
}
