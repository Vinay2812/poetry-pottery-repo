import { Module } from "@nestjs/common";

import { AuthGuard } from "@/common/guards/auth.guard";
import { NotificationsConsumer } from "./notifications.consumer";
import { NotificationsResolver } from "./notifications.resolver";
import { NotificationsService } from "./notifications.service";

@Module({
  providers: [
    NotificationsService,
    NotificationsResolver,
    NotificationsConsumer,
    AuthGuard,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
