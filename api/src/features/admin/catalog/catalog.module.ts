import { Module } from "@nestjs/common";

import { ProductsModule } from "@/features/products/products.module";
import { AdminCatalogResolver } from "./catalog.resolver";
import { AdminCatalogService } from "./catalog.service";

@Module({
  imports: [ProductsModule],
  providers: [AdminCatalogService, AdminCatalogResolver],
})
export class AdminCatalogModule {}
