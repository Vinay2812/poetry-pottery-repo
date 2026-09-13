import { Module } from "@nestjs/common";

import { EventsModule } from "@/features/events/events.module";
import { AdminUploadsModule } from "../uploads/uploads.module";
import { AdminEventsResolver } from "./events.resolver";
import { AdminEventsService } from "./events.service";

@Module({
  imports: [EventsModule, AdminUploadsModule],
  providers: [AdminEventsService, AdminEventsResolver],
})
export class AdminEventsModule {}
