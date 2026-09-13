import { Module } from "@nestjs/common";

import { AdminCatalogModule } from "./catalog/catalog.module";
import { AdminDashboardModule } from "./dashboard/dashboard.module";
import { AdminEventsModule } from "./events/events.module";
import { AdminOrdersModule } from "./orders/orders.module";
import { AdminProductsModule } from "./products/products.module";
import { AdminUploadsModule } from "./uploads/uploads.module";
import { AdminUsersModule } from "./users/users.module";
import { AdminWorkshopsModule } from "./workshops/workshops.module";

@Module({
  imports: [
    AdminUploadsModule,
    AdminDashboardModule,
    AdminProductsModule,
    AdminCatalogModule,
    AdminOrdersModule,
    AdminUsersModule,
    AdminEventsModule,
    AdminWorkshopsModule,
  ],
})
export class AdminModule {}
