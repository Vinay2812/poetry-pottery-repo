import { Module } from "@nestjs/common";

import { ProductsModule } from "@/features/products/products.module";
import { AdminUploadsModule } from "../uploads/uploads.module";
import { AdminGlazesResolver } from "./glazes.resolver";
import { AdminGlazesService } from "./glazes.service";

@Module({
  imports: [ProductsModule, AdminUploadsModule],
  providers: [AdminGlazesService, AdminGlazesResolver],
})
export class AdminGlazesModule {}
