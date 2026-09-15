import { Module } from "@nestjs/common";

import { AdminDashboardResolver } from "./dashboard.resolver";
import { AdminDashboardService } from "./dashboard.service";

@Module({
  providers: [AdminDashboardService, AdminDashboardResolver],
})
export class AdminDashboardModule {}
