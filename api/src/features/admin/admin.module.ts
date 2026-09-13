import { Module } from "@nestjs/common";

import { AdminCatalogModule } from "./catalog/catalog.module";
import { AdminDashboardModule } from "./dashboard/dashboard.module";
import { AdminProductsModule } from "./products/products.module";
import { AdminUploadsModule } from "./uploads/uploads.module";

@Module({
  imports: [
    AdminUploadsModule,
    AdminDashboardModule,
    AdminProductsModule,
    AdminCatalogModule,
  ],
})
export class AdminModule {}
