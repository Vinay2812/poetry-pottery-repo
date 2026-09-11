import { Module } from "@nestjs/common";

import { CartModule } from "@/features/cart/cart.module";
import { WishlistResolver } from "./wishlist.resolver";
import { WishlistService } from "./wishlist.service";

@Module({
  imports: [CartModule],
  providers: [WishlistService, WishlistResolver],
  exports: [WishlistService],
})
export class WishlistModule {}
