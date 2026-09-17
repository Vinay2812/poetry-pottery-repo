import { Module } from "@nestjs/common";

import { NotificationsModule } from "@/features/notifications/notifications.module";
import { ProductsModule } from "@/features/products/products.module";
import { AdminUploadsModule } from "../uploads/uploads.module";
import { AdminProductsResolver } from "./products.resolver";
import { AdminProductsService } from "./products.service";

@Module({
  imports: [ProductsModule, AdminUploadsModule, NotificationsModule],
  providers: [AdminProductsService, AdminProductsResolver],
  exports: [AdminProductsService],
})
export class AdminProductsModule {}
