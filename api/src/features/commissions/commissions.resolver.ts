import { Args, Context, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { AdminRequired } from "@/common/decorators/auth.decorators";
import { StrictThrottle } from "@/common/decorators/throttle.decorators";
import { AuthGuard } from "@/common/guards/auth.guard";
import type { GqlContext } from "@/common/types/express";
import { Product } from "@/features/products/products.type";

import { CommissionsService } from "./commissions.service";
import {
  CommissionOptions,
  CommissionRequest,
  CommissionRequestInput,
  CommissionRequestsFilterInput,
  CommissionRequestsResult,
} from "./commissions.type";

@Resolver(() => CommissionRequest)
export class CommissionsResolver {
  constructor(
    private readonly commissions: CommissionsService,
    private readonly authGuard: AuthGuard,
  ) {}

  @Query(() => CommissionOptions)
  commissionOptions(): Promise<CommissionOptions> {
    return this.commissions.options();
  }

  @Query(() => [Product])
  commissionPieces(
    @Args("limit", { type: () => Int, nullable: true, defaultValue: 6 })
    limit: number,
  ): Promise<Product[]> {
    return this.commissions.pieces(limit);
  }

  // Anyone can brief a piece; a signed-in visitor gets theirs filed against their account.
  @StrictThrottle()
  @Mutation(() => CommissionRequest)
  async createCommissionRequest(
    @Args("input") input: CommissionRequestInput,
    @Context() context: GqlContext,
  ): Promise<CommissionRequest> {
    const user = await this.authGuard.tryAuthenticate(context.req);
    return this.commissions.create(input, user?.db_user_id ?? null);
  }

  @AdminRequired()
  @Query(() => CommissionRequestsResult)
  commissionRequests(
    @Args("filter", {
      type: () => CommissionRequestsFilterInput,
      nullable: true,
    })
    filter: CommissionRequestsFilterInput | null,
  ): Promise<CommissionRequestsResult> {
    return this.commissions.list(filter ?? {});
  }

  @AdminRequired()
  @Mutation(() => CommissionRequest)
  markCommissionRequestRead(
    @Args("id") id: string,
  ): Promise<CommissionRequest> {
    return this.commissions.markRead(id);
  }
}
