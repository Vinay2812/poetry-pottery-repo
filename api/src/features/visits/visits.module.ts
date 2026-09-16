import { Module } from "@nestjs/common";

import { AuthGuard } from "@/common/guards/auth.guard";
import { VisitsResolver } from "./visits.resolver";
import { VisitsService } from "./visits.service";

@Module({
  providers: [VisitsService, VisitsResolver, AuthGuard],
  exports: [VisitsService],
})
export class VisitsModule {}
