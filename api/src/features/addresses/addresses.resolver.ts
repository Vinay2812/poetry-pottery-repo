import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { AuthRequired } from "@/common/decorators/auth.decorators";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import type { AuthUser } from "@/common/clerk/clerk.type";
import { AddressesService } from "./addresses.service";
import { Address, AddressInput } from "./addresses.type";

@Resolver(() => Address)
export class AddressesResolver {
  constructor(private readonly addressesService: AddressesService) {}

  @AuthRequired()
  @Query(() => [Address])
  addresses(@CurrentUser() user: AuthUser): Promise<Address[]> {
    return this.addressesService.list(user.db_user_id);
  }

  @AuthRequired()
  @Mutation(() => Address)
  createAddress(
    @CurrentUser() user: AuthUser,
    @Args("input") input: AddressInput,
  ): Promise<Address> {
    return this.addressesService.create(user.db_user_id, input);
  }

  @AuthRequired()
  @Mutation(() => Address)
  updateAddress(
    @CurrentUser() user: AuthUser,
    @Args("id", { type: () => Int }) id: number,
    @Args("input") input: AddressInput,
  ): Promise<Address> {
    return this.addressesService.update(user.db_user_id, id, input);
  }

  @AuthRequired()
  @Mutation(() => Boolean)
  deleteAddress(
    @CurrentUser() user: AuthUser,
    @Args("id", { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.addressesService.remove(user.db_user_id, id);
  }

  @AuthRequired()
  @Mutation(() => Address)
  setDefaultAddress(
    @CurrentUser() user: AuthUser,
    @Args("id", { type: () => Int }) id: number,
  ): Promise<Address> {
    return this.addressesService.setDefault(user.db_user_id, id);
  }
}
