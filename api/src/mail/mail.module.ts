import { Global, Module } from "@nestjs/common";

import { MailConsumer } from "./mail.consumer";
import { MailService } from "./mail.service";

@Global()
@Module({
  providers: [MailService, MailConsumer],
  exports: [MailService],
})
export class MailModule {}
