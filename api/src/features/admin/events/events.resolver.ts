import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { EventStatus, RegistrationStatus } from "@prisma/client";

import { AdminRequired } from "@/common/decorators/auth.decorators";
import { Event } from "@/features/events/events.type";
import { AdminEventsService } from "./events.service";
import {
  AdminEventInput,
  AdminEventsFilterInput,
  AdminEventsResult,
  AdminRegistration,
  AdminRegistrationsFilterInput,
  AdminRegistrationsResult,
} from "./events.type";

@Resolver(() => AdminRegistration)
export class AdminEventsResolver {
  constructor(private readonly events: AdminEventsService) {}

  @AdminRequired()
  @Query(() => AdminEventsResult)
  adminEvents(
    @Args("filter", { type: () => AdminEventsFilterInput, nullable: true })
    filter: AdminEventsFilterInput | null,
  ): Promise<AdminEventsResult> {
    return this.events.list(filter ?? {});
  }

  @AdminRequired()
  @Query(() => Event)
  adminEvent(@Args("id", { type: () => Int }) id: number): Promise<Event> {
    return this.events.byId(id);
  }

  @AdminRequired()
  @Mutation(() => Event)
  createEvent(@Args("input") input: AdminEventInput): Promise<Event> {
    return this.events.create(input);
  }

  @AdminRequired()
  @Mutation(() => Event)
  updateEvent(
    @Args("id", { type: () => Int }) id: number,
    @Args("input") input: AdminEventInput,
  ): Promise<Event> {
    return this.events.update(id, input);
  }

  @AdminRequired()
  @Mutation(() => Event)
  publishEvent(@Args("id", { type: () => Int }) id: number): Promise<Event> {
    return this.events.setStatus(id, EventStatus.PUBLISHED);
  }

  @AdminRequired()
  @Mutation(() => Event)
  unpublishEvent(@Args("id", { type: () => Int }) id: number): Promise<Event> {
    return this.events.setStatus(id, EventStatus.DRAFT);
  }

  @AdminRequired()
  @Mutation(() => Event)
  completeEvent(@Args("id", { type: () => Int }) id: number): Promise<Event> {
    return this.events.setStatus(id, EventStatus.COMPLETED);
  }

  @AdminRequired()
  @Mutation(() => Event)
  cancelEvent(
    @Args("id", { type: () => Int }) id: number,
    @Args("reason", { type: () => String, nullable: true })
    reason: string | null,
  ): Promise<Event> {
    return this.events.cancel(id, reason);
  }

  @AdminRequired()
  @Query(() => AdminRegistrationsResult)
  adminEventRegistrations(
    @Args("filter", {
      type: () => AdminRegistrationsFilterInput,
      nullable: true,
    })
    filter: AdminRegistrationsFilterInput | null,
  ): Promise<AdminRegistrationsResult> {
    return this.events.registrations(filter ?? {});
  }

  @AdminRequired()
  @Mutation(() => AdminRegistration)
  setRegistrationStatus(
    @Args("id") id: string,
    @Args("status", { type: () => RegistrationStatus })
    status: RegistrationStatus,
    @Args("reason", { type: () => String, nullable: true })
    reason: string | null,
  ): Promise<AdminRegistration> {
    return this.events.setRegistrationStatus(id, status, reason);
  }
}
