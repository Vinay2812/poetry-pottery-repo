import { Module } from "@nestjs/common";

import { AuthGuard } from "@/common/guards/auth.guard";
import { NewsletterResolver } from "./newsletter.resolver";
import { NewsletterService } from "./newsletter.service";

@Module({
  providers: [NewsletterService, NewsletterResolver, AuthGuard],
  exports: [NewsletterService],
})
export class NewsletterModule {}
