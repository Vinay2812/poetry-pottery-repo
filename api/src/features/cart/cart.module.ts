import { Module } from "@nestjs/common";

import { SettingsModule } from "@/features/settings/settings.module";
import { CartResolver } from "./cart.resolver";
import { CartService } from "./cart.service";

@Module({
  imports: [SettingsModule],
  providers: [CartService, CartResolver],
  exports: [CartService],
})
export class CartModule {}
