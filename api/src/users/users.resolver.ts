import { Args, Int, Query, Resolver } from "@nestjs/graphql";

import { AdminRequired } from "@/common/decorators/auth.decorators";
import { StrictThrottle } from "@/common/decorators/throttle.decorators";
import { UsersService } from "./users.service";
import { User, UsersResponse } from "./users.type";

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @AdminRequired()
  @StrictThrottle()
  @Query(() => UsersResponse)
  users(
    @Args("page", { type: () => Int, nullable: true, defaultValue: 1 })
    page: number,
    @Args("limit", { type: () => Int, nullable: true, defaultValue: 20 })
    limit: number,
  ): Promise<UsersResponse> {
    return this.usersService.findPaginated(page, limit);
  }
}
