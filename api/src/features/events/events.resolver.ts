import {
  Args,
  Context,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";

import { AuthRequired } from "@/common/decorators/auth.decorators";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { StrictThrottle } from "@/common/decorators/throttle.decorators";
import { AuthGuard } from "@/common/guards/auth.guard";
import type { AuthUser } from "@/common/clerk/clerk.type";
import type { GqlContext } from "@/common/types/express";
import { EventsService } from "./events.service";
import {
  Event,
  EventsFilterInput,
  EventsResult,
  RegisterForEventInput,
  Registration,
  RegistrationsResult,
} from "./events.type";

@Resolver(() => Event)
export class EventsResolver {
  constructor(
    private readonly eventsService: EventsService,
    private readonly authGuard: AuthGuard,
  ) {}

  @Query(() => EventsResult)
  events(
    @Args("filter", { type: () => EventsFilterInput, nullable: true })
    filter: EventsFilterInput | null,
  ): Promise<EventsResult> {
    return this.eventsService.list(filter ?? {});
  }

  @Query(() => Event)
  event(@Args("slug") slug: string): Promise<Event> {
    return this.eventsService.bySlug(slug);
  }

  @Query(() => [Event])
  upcomingEvents(
    @Args("limit", { type: () => Int, nullable: true, defaultValue: 3 })
    limit: number,
  ): Promise<Event[]> {
    return this.eventsService.upcoming(limit);
  }

  // Signed-in visitors see their own booking on the event page; anonymous callers get null.
  @ResolveField(() => Registration, { nullable: true })
  async my_registration(
    @Parent() event: Event,
    @Context() context: GqlContext,
  ): Promise<Registration | null> {
    if (event.my_registration !== undefined) return event.my_registration;
    const user = await this.authGuard.tryAuthenticate(context.req);
    return user
      ? this.eventsService.registrationFor(user.db_user_id, event.id)
      : null;
  }

  @AuthRequired()
  @StrictThrottle()
  @Mutation(() => Registration)
  registerForEvent(
    @CurrentUser() user: AuthUser,
    @Args("input") input: RegisterForEventInput,
  ): Promise<Registration> {
    return this.eventsService.register(user.db_user_id, input);
  }

  @AuthRequired()
  @Query(() => RegistrationsResult)
  myRegistrations(
    @CurrentUser() user: AuthUser,
    @Args("page", { type: () => Int, nullable: true }) page: number | null,
    @Args("limit", { type: () => Int, nullable: true }) limit: number | null,
  ): Promise<RegistrationsResult> {
    return this.eventsService.myRegistrations(user.db_user_id, page, limit);
  }

  @AuthRequired()
  @Query(() => Registration)
  registration(
    @CurrentUser() user: AuthUser,
    @Args("id") id: string,
  ): Promise<Registration> {
    return this.eventsService.registrationById(user.db_user_id, id);
  }

  @AuthRequired()
  @Mutation(() => Registration)
  cancelRegistration(
    @CurrentUser() user: AuthUser,
    @Args("id") id: string,
    @Args("reason", { type: () => String, nullable: true })
    reason: string | null,
  ): Promise<Registration> {
    return this.eventsService.cancel(user.db_user_id, id, reason);
  }
}
