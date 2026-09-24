import { Module } from "@nestjs/common";

import { EventsModule } from "@/features/events/events.module";
import { AdminEventsResolver } from "./events.resolver";
import { AdminEventsService } from "./events.service";

@Module({
  imports: [EventsModule],
  providers: [AdminEventsService, AdminEventsResolver],
})
export class AdminEventsModule {}
