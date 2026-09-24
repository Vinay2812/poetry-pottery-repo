import { Module } from "@nestjs/common";

import { ProductsModule } from "@/features/products/products.module";
import { AdminProductsResolver } from "./products.resolver";
import { AdminProductsService } from "./products.service";

@Module({
  imports: [ProductsModule],
  providers: [AdminProductsService, AdminProductsResolver],
  exports: [AdminProductsService],
})
export class AdminProductsModule {}
