import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { AdminRequired } from "@/common/decorators/auth.decorators";
import { StrictThrottle } from "@/common/decorators/throttle.decorators";
import { ContactService } from "./contact.service";
import {
  ContactMessage,
  ContactMessageInput,
  ContactMessagesResult,
} from "./contact.type";

@Resolver(() => ContactMessage)
export class ContactResolver {
  constructor(private readonly contact: ContactService) {}

  @StrictThrottle()
  @Mutation(() => Boolean)
  sendContactMessage(
    @Args("input") input: ContactMessageInput,
  ): Promise<boolean> {
    return this.contact.send(input);
  }

  @AdminRequired()
  @Query(() => ContactMessagesResult)
  contactMessages(
    @Args("page", { type: () => Int, nullable: true }) page: number | null,
    @Args("limit", { type: () => Int, nullable: true }) limit: number | null,
  ): Promise<ContactMessagesResult> {
    return this.contact.list(page, limit);
  }

  @AdminRequired()
  @Mutation(() => ContactMessage)
  markContactMessageRead(
    @Args("id", { type: () => Int }) id: number,
  ): Promise<ContactMessage> {
    return this.contact.markRead(id);
  }
}
