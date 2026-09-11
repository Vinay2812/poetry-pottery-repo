import { Injectable } from "@nestjs/common";

import { jobSchemas } from "@/queue/jobs";
import { SubscribeJob } from "@/queue/subscribe.decorator";
import { MailService } from "./mail.service";

@Injectable()
export class MailConsumer {
  constructor(private readonly mail: MailService) {}

  @SubscribeJob("mail.send")
  async handle(payload: unknown): Promise<void> {
    await this.mail.deliver(jobSchemas["mail.send"].parse(payload));
  }
}
