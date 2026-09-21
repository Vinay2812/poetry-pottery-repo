import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";

import { AdminRequired } from "@/common/decorators/auth.decorators";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { StrictThrottle } from "@/common/decorators/throttle.decorators";
import { AuthGuard } from "@/common/guards/auth.guard";
import type { AuthUser } from "@/common/clerk/clerk.type";
import type { GqlContext } from "@/common/types/express";
import { WhatsAppService } from "./whatsapp.service";
import {
  AdminWhatsAppFilterInput,
  AdminWhatsAppMessagesResult,
  RecordWhatsAppMessageInput,
  SendWhatsAppReplyInput,
  WhatsAppMessage,
} from "./whatsapp.type";

@Resolver(() => WhatsAppMessage)
export class WhatsAppResolver {
  constructor(
    private readonly whatsapp: WhatsAppService,
    private readonly authGuard: AuthGuard,
  ) {}

  // Anyone can tap a WhatsApp link; a signed-in visitor gets the copy filed against their account.
  @StrictThrottle()
  @Mutation(() => Boolean)
  async recordWhatsAppMessage(
    @Args("input") input: RecordWhatsAppMessageInput,
    @Context() context: GqlContext,
  ): Promise<boolean> {
    const user = await this.authGuard.tryAuthenticate(context.req);
    return this.whatsapp.record(input, user?.db_user_id ?? null);
  }

  @AdminRequired()
  @Mutation(() => Boolean)
  sendWhatsAppReply(
    @Args("input") input: SendWhatsAppReplyInput,
    @CurrentUser() user: AuthUser,
  ): Promise<boolean> {
    return this.whatsapp.reply(input, user.db_user_id);
  }

  @AdminRequired()
  @Query(() => AdminWhatsAppMessagesResult)
  adminWhatsAppMessages(
    @Args("filter", { type: () => AdminWhatsAppFilterInput, nullable: true })
    filter: AdminWhatsAppFilterInput | null,
  ): Promise<AdminWhatsAppMessagesResult> {
    return this.whatsapp.list(filter ?? {});
  }
}
