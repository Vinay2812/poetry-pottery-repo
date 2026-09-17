import { Module } from "@nestjs/common";

import { ReviewsModule } from "@/features/reviews/reviews.module";
import { AdminReviewsResolver } from "./reviews.resolver";
import { AdminReviewsService } from "./reviews.service";

@Module({
  imports: [ReviewsModule],
  providers: [AdminReviewsService, AdminReviewsResolver],
})
export class AdminReviewsModule {}
