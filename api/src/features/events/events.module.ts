import { Module } from "@nestjs/common";

import { AuthGuard } from "@/common/guards/auth.guard";
import { EventsResolver } from "./events.resolver";
import { EventsService } from "./events.service";

@Module({
  providers: [EventsService, EventsResolver, AuthGuard],
  exports: [EventsService],
})
export class EventsModule {}
