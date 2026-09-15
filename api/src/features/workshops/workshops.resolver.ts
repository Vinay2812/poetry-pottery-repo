import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { AuthRequired } from "@/common/decorators/auth.decorators";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { StrictThrottle } from "@/common/decorators/throttle.decorators";
import type { AuthUser } from "@/common/clerk/clerk.type";
import { toConfig, WorkshopsService } from "./workshops.service";
import {
  BookWorkshopInput,
  RescheduleWorkshopInput,
  WorkshopAvailabilityInput,
  WorkshopBooking,
  WorkshopBookingsResult,
  WorkshopConfig,
  WorkshopDay,
} from "./workshops.type";

@Resolver(() => WorkshopBooking)
export class WorkshopsResolver {
  constructor(private readonly workshopsService: WorkshopsService) {}

  @Query(() => [WorkshopConfig])
  workshops(): Promise<WorkshopConfig[]> {
    return this.workshopsService.configs();
  }

  @Query(() => WorkshopConfig)
  async workshop(@Args("slug") slug: string): Promise<WorkshopConfig> {
    return toConfig(await this.workshopsService.configBySlug(slug));
  }

  @Query(() => [WorkshopDay])
  workshopAvailability(
    @Args("input") input: WorkshopAvailabilityInput,
  ): Promise<WorkshopDay[]> {
    return this.workshopsService.availability(input);
  }

  @AuthRequired()
  @StrictThrottle()
  @Mutation(() => WorkshopBooking)
  bookWorkshop(
    @CurrentUser() user: AuthUser,
    @Args("input") input: BookWorkshopInput,
  ): Promise<WorkshopBooking> {
    return this.workshopsService.book(user.db_user_id, input);
  }

  @AuthRequired()
  @Mutation(() => WorkshopBooking)
  rescheduleWorkshopBooking(
    @CurrentUser() user: AuthUser,
    @Args("input") input: RescheduleWorkshopInput,
  ): Promise<WorkshopBooking> {
    return this.workshopsService.reschedule(user.db_user_id, input);
  }

  @AuthRequired()
  @Query(() => WorkshopBookingsResult)
  myWorkshopBookings(
    @CurrentUser() user: AuthUser,
    @Args("page", { type: () => Int, nullable: true }) page: number | null,
    @Args("limit", { type: () => Int, nullable: true }) limit: number | null,
  ): Promise<WorkshopBookingsResult> {
    return this.workshopsService.myBookings(user.db_user_id, page, limit);
  }

  @AuthRequired()
  @Query(() => WorkshopBooking)
  workshopBooking(
    @CurrentUser() user: AuthUser,
    @Args("id") id: string,
  ): Promise<WorkshopBooking> {
    return this.workshopsService.bookingById(user.db_user_id, id);
  }

  @AuthRequired()
  @Mutation(() => WorkshopBooking)
  cancelWorkshopBooking(
    @CurrentUser() user: AuthUser,
    @Args("id") id: string,
    @Args("reason", { type: () => String, nullable: true })
    reason: string | null,
  ): Promise<WorkshopBooking> {
    return this.workshopsService.cancel(user.db_user_id, id, reason);
  }
}
