import { Args, Int, Query, Resolver } from "@nestjs/graphql";
import type { User as DbUser } from "@prisma/client";

import {
  AdminRequired,
  AuthRequired,
} from "@/common/decorators/auth.decorators";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { StrictThrottle } from "@/common/decorators/throttle.decorators";
import { UsersService } from "./users.service";
import { User, UsersResponse } from "./users.type";
import { Throttle } from "@nestjs/throttler";

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @AuthRequired()
  @Throttle({
    short: {
      limit: 10,
      ttl: 1000,
    },
  })
  @Query(() => User)
  me(@CurrentUser() user: DbUser): DbUser {
    return user;
  }

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
