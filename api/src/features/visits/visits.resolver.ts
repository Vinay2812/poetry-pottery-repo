import { Args, Context, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { StrictThrottle } from "@/common/decorators/throttle.decorators";
import { AuthGuard } from "@/common/guards/auth.guard";
import type { GqlContext } from "@/common/types/express";

import { VisitsService } from "./visits.service";
import { StudioVisit, StudioVisitInput, VisitDay } from "./visits.type";

@Resolver(() => StudioVisit)
export class VisitsResolver {
  constructor(
    private readonly visits: VisitsService,
    private readonly authGuard: AuthGuard,
  ) {}

  @Query(() => [VisitDay])
  studioVisitAvailability(
    @Args("from", { type: () => String, nullable: true }) from: string | null,
    @Args("days", { type: () => Int, nullable: true }) days: number | null,
  ): Promise<VisitDay[]> {
    return this.visits.availability(from, days);
  }

  // Anyone can say they are coming by; a signed-in visitor gets it filed against their account.
  @StrictThrottle()
  @Mutation(() => StudioVisit)
  async bookStudioVisit(
    @Args("input") input: StudioVisitInput,
    @Context() context: GqlContext,
  ): Promise<StudioVisit> {
    const user = await this.authGuard.tryAuthenticate(context.req);
    return this.visits.book(input, user?.db_user_id ?? null);
  }
}
