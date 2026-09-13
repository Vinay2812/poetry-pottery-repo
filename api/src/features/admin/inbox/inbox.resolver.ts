import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { AdminRequired } from "@/common/decorators/auth.decorators";
import {
  ContactMessage,
  ContactMessagesResult,
} from "@/features/contact/contact.type";
import { AdminInboxService } from "./inbox.service";
import {
  AdminContactFilterInput,
  AdminSubscriber,
  AdminSubscribersFilterInput,
  AdminSubscribersResult,
} from "./inbox.type";

@Resolver(() => AdminSubscriber)
export class AdminInboxResolver {
  constructor(private readonly inbox: AdminInboxService) {}

  @AdminRequired()
  @Query(() => ContactMessagesResult)
  adminContactMessages(
    @Args("filter", { type: () => AdminContactFilterInput, nullable: true })
    filter: AdminContactFilterInput | null,
  ): Promise<ContactMessagesResult> {
    return this.inbox.messages(filter ?? {});
  }

  @AdminRequired()
  @Mutation(() => ContactMessage)
  setContactMessageRead(
    @Args("id", { type: () => Int }) id: number,
    @Args("is_read") isRead: boolean,
  ): Promise<ContactMessage> {
    return this.inbox.setMessageRead(id, isRead);
  }

  @AdminRequired()
  @Mutation(() => Boolean)
  deleteContactMessage(
    @Args("id", { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.inbox.deleteMessage(id);
  }

  @AdminRequired()
  @Query(() => AdminSubscribersResult)
  adminNewsletterSubscribers(
    @Args("filter", { type: () => AdminSubscribersFilterInput, nullable: true })
    filter: AdminSubscribersFilterInput | null,
  ): Promise<AdminSubscribersResult> {
    return this.inbox.subscribers(filter ?? {});
  }

  @AdminRequired()
  @Query(() => String)
  exportNewsletterSubscribers(
    @Args("filter", { type: () => AdminSubscribersFilterInput, nullable: true })
    filter: AdminSubscribersFilterInput | null,
  ): Promise<string> {
    return this.inbox.exportSubscribers(filter ?? {});
  }

  @AdminRequired()
  @Mutation(() => Boolean)
  unsubscribeSubscriber(@Args("email") email: string): Promise<boolean> {
    return this.inbox.unsubscribe(email);
  }
}
