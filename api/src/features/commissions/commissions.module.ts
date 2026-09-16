import { Module } from "@nestjs/common";

import { AuthGuard } from "@/common/guards/auth.guard";
import { CommissionsResolver } from "./commissions.resolver";
import { CommissionsService } from "./commissions.service";

@Module({
  providers: [CommissionsService, CommissionsResolver, AuthGuard],
  exports: [CommissionsService],
})
export class CommissionsModule {}
