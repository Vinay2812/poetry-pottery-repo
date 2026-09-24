import { Module } from "@nestjs/common";

import { CartModule } from "@/features/cart/cart.module";
import { ProductsModule } from "@/features/products/products.module";
import { SettingsModule } from "@/features/settings/settings.module";
import { OrdersResolver } from "./orders.resolver";
import { OrdersService } from "./orders.service";

@Module({
  imports: [CartModule, ProductsModule, SettingsModule],
  providers: [OrdersService, OrdersResolver],
  exports: [OrdersService],
})
export class OrdersModule {}
