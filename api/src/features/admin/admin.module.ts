import { Module } from "@nestjs/common";

import { AdminCatalogModule } from "./catalog/catalog.module";
import { AdminContentModule } from "./content/content.module";
import { AdminCouponsModule } from "./coupons/coupons.module";
import { AdminDashboardModule } from "./dashboard/dashboard.module";
import { AdminEventsModule } from "./events/events.module";
import { AdminGlazesModule } from "./glazes/glazes.module";
import { AdminInboxModule } from "./inbox/inbox.module";
import { AdminOrdersModule } from "./orders/orders.module";
import { AdminProductsModule } from "./products/products.module";
import { AdminReviewsModule } from "./reviews/reviews.module";
import { AdminUploadsModule } from "./uploads/uploads.module";
import { AdminUsersModule } from "./users/users.module";
import { AdminWorkshopsModule } from "./workshops/workshops.module";

@Module({
  imports: [
    AdminUploadsModule,
    AdminDashboardModule,
    AdminProductsModule,
    AdminCatalogModule,
    AdminGlazesModule,
    AdminOrdersModule,
    AdminUsersModule,
    AdminEventsModule,
    AdminWorkshopsModule,
    AdminReviewsModule,
    AdminContentModule,
    AdminCouponsModule,
    AdminInboxModule,
  ],
})
export class AdminModule {}
