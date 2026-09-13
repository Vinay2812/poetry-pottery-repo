import { Module } from "@nestjs/common";

import { AdminCatalogModule } from "./catalog/catalog.module";
import { AdminDashboardModule } from "./dashboard/dashboard.module";
import { AdminOrdersModule } from "./orders/orders.module";
import { AdminProductsModule } from "./products/products.module";
import { AdminUploadsModule } from "./uploads/uploads.module";

@Module({
  imports: [
    AdminUploadsModule,
    AdminDashboardModule,
    AdminProductsModule,
    AdminCatalogModule,
    AdminOrdersModule,
  ],
})
export class AdminModule {}
