import { Args, Mutation, Resolver } from "@nestjs/graphql";

import { StrictThrottle } from "@/common/decorators/throttle.decorators";
import { ContactService } from "./contact.service";
import { ContactMessage, ContactMessageInput } from "./contact.type";

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
}
