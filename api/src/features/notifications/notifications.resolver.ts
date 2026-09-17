import { Args, Context, Int, Mutation, Resolver } from "@nestjs/graphql";

import { StrictThrottle } from "@/common/decorators/throttle.decorators";
import { AuthGuard } from "@/common/guards/auth.guard";
import type { GqlContext } from "@/common/types/express";
import { NotificationsService } from "./notifications.service";
import { BatchNotificationResult } from "./notifications.type";

@Resolver(() => BatchNotificationResult)
export class NotificationsResolver {
  constructor(
    private readonly notifications: NotificationsService,
    private readonly authGuard: AuthGuard,
  ) {}

  // Open to anyone, but a signed-in visitor gets the watch tied to their account.
  @StrictThrottle()
  @Mutation(() => BatchNotificationResult)
  async notifyWhenBackInStock(
    @Args("product_id", { type: () => Int }) productId: number,
    @Args("email") email: string,
    @Context() context: GqlContext,
  ): Promise<BatchNotificationResult> {
    const user = await this.authGuard.tryAuthenticate(context.req);
    return this.notifications.watch(productId, email, user?.db_user_id ?? null);
  }

  @StrictThrottle()
  @Mutation(() => Boolean)
  stopBatchNotification(@Args("token") token: string): Promise<boolean> {
    return this.notifications.stopWatching(token);
  }
}
