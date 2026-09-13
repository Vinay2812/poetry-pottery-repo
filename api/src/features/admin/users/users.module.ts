import { Module } from "@nestjs/common";

import { AdminUsersResolver } from "./users.resolver";
import { AdminUsersService } from "./users.service";

@Module({
  providers: [AdminUsersService, AdminUsersResolver],
})
export class AdminUsersModule {}
