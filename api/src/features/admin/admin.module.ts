import { Module } from "@nestjs/common";

import { AdminDashboardModule } from "./dashboard/dashboard.module";
import { AdminUploadsModule } from "./uploads/uploads.module";

@Module({
  imports: [AdminUploadsModule, AdminDashboardModule],
})
export class AdminModule {}
