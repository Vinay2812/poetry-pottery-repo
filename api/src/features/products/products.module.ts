import { Module } from "@nestjs/common";

import { AuthGuard } from "@/common/guards/auth.guard";
import { WishlistModule } from "@/features/wishlist/wishlist.module";
import { GlazeResolver, ProductsResolver } from "./products.resolver";
import { ProductsService } from "./products.service";
import { ShelfService } from "./shelf.service";

@Module({
  imports: [WishlistModule],
  providers: [
    ProductsService,
    ShelfService,
    ProductsResolver,
    GlazeResolver,
    AuthGuard,
  ],
  exports: [ProductsService, ShelfService],
})
export class ProductsModule {}
