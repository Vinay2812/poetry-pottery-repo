import { Module } from "@nestjs/common";

import { AdminUploadsResolver } from "./uploads.resolver";

@Module({
  providers: [AdminUploadsResolver],
})
export class AdminUploadsModule {}
