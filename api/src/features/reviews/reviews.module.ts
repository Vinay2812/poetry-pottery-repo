import { Module } from "@nestjs/common";

import { AuthGuard } from "@/common/guards/auth.guard";
import {
  EventReviewEligibilityResolver,
  ProductReviewEligibilityResolver,
  ReviewsResolver,
} from "./reviews.resolver";
import { ReviewsService } from "./reviews.service";

@Module({
  providers: [
    ReviewsService,
    ReviewsResolver,
    ProductReviewEligibilityResolver,
    EventReviewEligibilityResolver,
    AuthGuard,
  ],
  exports: [ReviewsService],
})
export class ReviewsModule {}
