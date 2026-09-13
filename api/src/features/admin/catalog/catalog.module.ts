import { Module } from "@nestjs/common";

import { ProductsModule } from "@/features/products/products.module";
import { AdminUploadsModule } from "../uploads/uploads.module";
import { AdminCatalogResolver } from "./catalog.resolver";
import { AdminCatalogService } from "./catalog.service";

@Module({
  imports: [ProductsModule, AdminUploadsModule],
  providers: [AdminCatalogService, AdminCatalogResolver],
})
export class AdminCatalogModule {}
