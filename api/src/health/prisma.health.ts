import { Injectable } from "@nestjs/common";
import {
  type HealthIndicatorResult,
  HealthIndicatorService,
} from "@nestjs/terminus";

import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class PrismaHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly prisma: PrismaService,
  ) {}

  async pingCheck<Key extends string>(
    key: Key,
  ): Promise<HealthIndicatorResult<Key>> {
    const check = this.healthIndicatorService.check(key);
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return check.up();
    } catch (error) {
      return check.down(
        error instanceof Error ? error.message : "database unreachable",
      );
    }
  }
}
