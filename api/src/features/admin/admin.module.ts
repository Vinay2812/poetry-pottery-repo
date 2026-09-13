import { Module } from "@nestjs/common";

import { AdminDashboardModule } from "./dashboard/dashboard.module";
import { AdminProductsModule } from "./products/products.module";
import { AdminUploadsModule } from "./uploads/uploads.module";

@Module({
  imports: [AdminUploadsModule, AdminDashboardModule, AdminProductsModule],
})
export class AdminModule {}
