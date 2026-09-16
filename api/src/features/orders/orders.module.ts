import { Module } from "@nestjs/common";

import { CartModule } from "@/features/cart/cart.module";
import { NotificationsModule } from "@/features/notifications/notifications.module";
import { SettingsModule } from "@/features/settings/settings.module";
import { OrdersResolver } from "./orders.resolver";
import { OrdersService } from "./orders.service";

@Module({
  imports: [CartModule, NotificationsModule, SettingsModule],
  providers: [OrdersService, OrdersResolver],
  exports: [OrdersService],
})
export class OrdersModule {}
