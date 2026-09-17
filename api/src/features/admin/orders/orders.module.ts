import { Module } from "@nestjs/common";

import { OrdersModule } from "@/features/orders/orders.module";
import { AdminOrdersResolver } from "./orders.resolver";
import { AdminOrdersService } from "./orders.service";

@Module({
  imports: [OrdersModule],
  providers: [AdminOrdersService, AdminOrdersResolver],
})
export class AdminOrdersModule {}
