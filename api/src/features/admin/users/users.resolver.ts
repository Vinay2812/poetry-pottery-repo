import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UserRole } from "@prisma/client";

import { AdminRequired } from "@/common/decorators/auth.decorators";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import type { AuthUser } from "@/common/clerk/clerk.type";
import { AdminUsersService } from "./users.service";
import {
  AdminUser,
  AdminUsersFilterInput,
  AdminUsersResult,
} from "./users.type";

@Resolver(() => AdminUser)
export class AdminUsersResolver {
  constructor(private readonly users: AdminUsersService) {}

  @AdminRequired()
  @Query(() => AdminUsersResult)
  adminUsers(
    @Args("filter", { type: () => AdminUsersFilterInput, nullable: true })
    filter: AdminUsersFilterInput | null,
  ): Promise<AdminUsersResult> {
    return this.users.list(filter ?? {});
  }

  @AdminRequired()
  @Query(() => AdminUser)
  adminUser(@Args("id", { type: () => Int }) id: number): Promise<AdminUser> {
    return this.users.byId(id);
  }

  @AdminRequired()
  @Mutation(() => AdminUser)
  setUserRole(
    @CurrentUser() actor: AuthUser,
    @Args("id", { type: () => Int }) id: number,
    @Args("role", { type: () => UserRole }) role: UserRole,
  ): Promise<AdminUser> {
    return this.users.setRole(id, role, actor.db_user_id);
  }
}
