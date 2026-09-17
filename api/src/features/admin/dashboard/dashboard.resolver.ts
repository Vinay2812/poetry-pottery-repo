import { Query, Resolver } from "@nestjs/graphql";

import { AdminRequired } from "@/common/decorators/auth.decorators";
import { AdminDashboardService } from "./dashboard.service";
import { AdminDashboard } from "./dashboard.type";

@Resolver(() => AdminDashboard)
export class AdminDashboardResolver {
  constructor(private readonly dashboard: AdminDashboardService) {}

  @AdminRequired()
  @Query(() => AdminDashboard)
  adminDashboard(): Promise<AdminDashboard> {
    return this.dashboard.summary();
  }
}
