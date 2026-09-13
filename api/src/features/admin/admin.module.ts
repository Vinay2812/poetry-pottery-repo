import { Module } from "@nestjs/common";

import { AdminUploadsModule } from "./uploads/uploads.module";

@Module({
  imports: [AdminUploadsModule],
})
export class AdminModule {}
