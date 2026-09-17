import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { AdminRequired } from "@/common/decorators/auth.decorators";
import { AdminGlazesService } from "./glazes.service";
import {
  AdminGlaze,
  AdminGlazeInput,
  AdminGlazesFilterInput,
  AdminGlazesResult,
} from "./glazes.type";

@Resolver(() => AdminGlaze)
export class AdminGlazesResolver {
  constructor(private readonly glazes: AdminGlazesService) {}

  @AdminRequired()
  @Query(() => AdminGlazesResult)
  adminGlazes(
    @Args("filter", { type: () => AdminGlazesFilterInput, nullable: true })
    filter: AdminGlazesFilterInput | null,
  ): Promise<AdminGlazesResult> {
    return this.glazes.list(filter ?? {});
  }

  @AdminRequired()
  @Mutation(() => AdminGlaze)
  createGlaze(@Args("input") input: AdminGlazeInput): Promise<AdminGlaze> {
    return this.glazes.create(input);
  }

  @AdminRequired()
  @Mutation(() => AdminGlaze)
  updateGlaze(
    @Args("id", { type: () => Int }) id: number,
    @Args("input") input: AdminGlazeInput,
  ): Promise<AdminGlaze> {
    return this.glazes.update(id, input);
  }

  @AdminRequired()
  @Mutation(() => Boolean)
  deleteGlaze(@Args("id", { type: () => Int }) id: number): Promise<boolean> {
    return this.glazes.remove(id);
  }
}
