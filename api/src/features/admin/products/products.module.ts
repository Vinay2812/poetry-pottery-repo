import { Module } from "@nestjs/common";

import { ProductsModule } from "@/features/products/products.module";
import { AdminUploadsModule } from "../uploads/uploads.module";
import { AdminProductsResolver } from "./products.resolver";
import { AdminProductsService } from "./products.service";

@Module({
  imports: [ProductsModule, AdminUploadsModule],
  providers: [AdminProductsService, AdminProductsResolver],
  exports: [AdminProductsService],
})
export class AdminProductsModule {}
