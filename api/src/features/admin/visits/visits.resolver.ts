import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";

import { AdminRequired } from "@/common/decorators/auth.decorators";
import { StudioVisit } from "@/features/visits/visits.type";
import { AdminVisitsService } from "./visits.service";
import {
  AdminStudioVisit,
  AdminStudioVisitsFilterInput,
  AdminStudioVisitsResult,
} from "./visits.type";

@Resolver(() => AdminStudioVisit)
export class AdminVisitsResolver {
  constructor(private readonly visits: AdminVisitsService) {}

  @AdminRequired()
  @Query(() => AdminStudioVisitsResult)
  adminStudioVisits(
    @Args("filter", {
      type: () => AdminStudioVisitsFilterInput,
      nullable: true,
    })
    filter: AdminStudioVisitsFilterInput | null,
  ): Promise<AdminStudioVisitsResult> {
    return this.visits.list(filter ?? {});
  }

  @AdminRequired()
  @Mutation(() => StudioVisit)
  cancelStudioVisit(
    @Args("id") id: string,
    @Args("reason", { type: () => String, nullable: true })
    reason: string | null,
  ): Promise<StudioVisit> {
    return this.visits.cancel(id, reason);
  }
}
