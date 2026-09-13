import { Module } from "@nestjs/common";

import { AdminInboxResolver } from "./inbox.resolver";
import { AdminInboxService } from "./inbox.service";

@Module({
  providers: [AdminInboxService, AdminInboxResolver],
})
export class AdminInboxModule {}
