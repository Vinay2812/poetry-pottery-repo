import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";

import type { AuthUser } from "@/common/clerk/clerk.type";
import { AuthRequired } from "@/common/decorators/auth.decorators";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { StrictThrottle } from "@/common/decorators/throttle.decorators";
import { AuthGuard } from "@/common/guards/auth.guard";
import type { GqlContext } from "@/common/types/express";
import { NewsletterService } from "./newsletter.service";
import { NewsletterResult, NewsletterStatus } from "./newsletter.type";

@Resolver(() => NewsletterResult)
export class NewsletterResolver {
  constructor(
    private readonly newsletter: NewsletterService,
    private readonly authGuard: AuthGuard,
  ) {}

  // Public, but a signed-in visitor gets the subscription tied to their account.
  @StrictThrottle()
  @Mutation(() => NewsletterResult)
  async subscribeToNewsletter(
    @Args("email") email: string,
    @Context() context: GqlContext,
  ): Promise<NewsletterResult> {
    const user = await this.authGuard.tryAuthenticate(context.req);
    return this.newsletter.subscribe(email, user?.db_user_id ?? null);
  }

  @StrictThrottle()
  @Mutation(() => Boolean)
  unsubscribeFromNewsletter(@Args("token") token: string): Promise<boolean> {
    return this.newsletter.unsubscribe(token);
  }

  @AuthRequired()
  @Query(() => NewsletterStatus)
  newsletterStatus(@CurrentUser() user: AuthUser): Promise<NewsletterStatus> {
    return this.newsletter.status(user.db_user_id);
  }
}
