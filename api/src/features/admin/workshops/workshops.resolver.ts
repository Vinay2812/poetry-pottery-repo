import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { RegistrationStatus } from "@prisma/client";

import { AdminRequired } from "@/common/decorators/auth.decorators";
import { WorkshopConfig } from "@/features/workshops/workshops.type";
import { AdminWorkshopsService } from "./workshops.service";
import {
  AdminWorkshopBlackout,
  AdminWorkshopBlackoutInput,
  AdminWorkshopBooking,
  AdminWorkshopBookingsFilterInput,
  AdminWorkshopBookingsResult,
  AdminWorkshopConfigInput,
  AdminWorkshopTierInput,
} from "./workshops.type";

@Resolver(() => AdminWorkshopBooking)
export class AdminWorkshopsResolver {
  constructor(private readonly workshops: AdminWorkshopsService) {}

  @AdminRequired()
  @Query(() => [WorkshopConfig])
  adminWorkshopConfigs(): Promise<WorkshopConfig[]> {
    return this.workshops.configs();
  }

  @AdminRequired()
  @Mutation(() => WorkshopConfig)
  updateWorkshopConfig(
    @Args("id", { type: () => Int }) id: number,
    @Args("input") input: AdminWorkshopConfigInput,
  ): Promise<WorkshopConfig> {
    return this.workshops.updateConfig(id, input);
  }

  @AdminRequired()
  @Mutation(() => WorkshopConfig)
  saveWorkshopTier(
    @Args("config_id", { type: () => Int }) configId: number,
    @Args("input") input: AdminWorkshopTierInput,
  ): Promise<WorkshopConfig> {
    return this.workshops.saveTier(configId, input);
  }

  @AdminRequired()
  @Mutation(() => Boolean)
  deleteWorkshopTier(
    @Args("id", { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.workshops.deleteTier(id);
  }

  @AdminRequired()
  @Query(() => [AdminWorkshopBlackout])
  adminWorkshopBlackouts(
    @Args("config_id", { type: () => Int }) configId: number,
  ): Promise<AdminWorkshopBlackout[]> {
    return this.workshops.blackouts(configId);
  }

  @AdminRequired()
  @Mutation(() => AdminWorkshopBlackout)
  createWorkshopBlackout(
    @Args("config_id", { type: () => Int }) configId: number,
    @Args("input") input: AdminWorkshopBlackoutInput,
  ): Promise<AdminWorkshopBlackout> {
    return this.workshops.createBlackout(configId, input);
  }

  @AdminRequired()
  @Mutation(() => AdminWorkshopBlackout)
  updateWorkshopBlackout(
    @Args("id", { type: () => Int }) id: number,
    @Args("input") input: AdminWorkshopBlackoutInput,
  ): Promise<AdminWorkshopBlackout> {
    return this.workshops.updateBlackout(id, input);
  }

  @AdminRequired()
  @Mutation(() => Boolean)
  deleteWorkshopBlackout(
    @Args("id", { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.workshops.deleteBlackout(id);
  }

  @AdminRequired()
  @Query(() => AdminWorkshopBookingsResult)
  adminWorkshopBookings(
    @Args("filter", {
      type: () => AdminWorkshopBookingsFilterInput,
      nullable: true,
    })
    filter: AdminWorkshopBookingsFilterInput | null,
  ): Promise<AdminWorkshopBookingsResult> {
    return this.workshops.bookings(filter ?? {});
  }

  @AdminRequired()
  @Mutation(() => AdminWorkshopBooking)
  setWorkshopBookingStatus(
    @Args("id") id: string,
    @Args("status", { type: () => RegistrationStatus })
    status: RegistrationStatus,
    @Args("reason", { type: () => String, nullable: true })
    reason: string | null,
  ): Promise<AdminWorkshopBooking> {
    return this.workshops.setBookingStatus(id, status, reason);
  }
}
