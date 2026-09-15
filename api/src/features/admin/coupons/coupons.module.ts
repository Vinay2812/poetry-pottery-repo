import { Module } from "@nestjs/common";

import { AdminCouponsResolver } from "./coupons.resolver";
import { AdminCouponsService } from "./coupons.service";

@Module({
  providers: [AdminCouponsService, AdminCouponsResolver],
})
export class AdminCouponsModule {}
