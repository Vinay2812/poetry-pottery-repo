import { Controller, Get } from "@nestjs/common";
import {
  HealthCheck,
  type HealthCheckResult,
  HealthCheckService,
} from "@nestjs/terminus";
import { SkipThrottle } from "@nestjs/throttler";

import { PrismaHealthIndicator } from "./prisma.health";
import { QueueHealthIndicator } from "./queue.health";
import { RedisHealthIndicator } from "./redis.health";

// SkipThrottle keeps orchestrators and uptime probes from consuming the rate limit.
// Each named throttler has to be listed; the bare decorator only skips `default`.
@SkipThrottle({ default: true, short: true, strict: true })
@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaIndicator: PrismaHealthIndicator,
    private readonly redisIndicator: RedisHealthIndicator,
    private readonly queueIndicator: QueueHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.prismaIndicator.pingCheck("database"),
      () => this.redisIndicator.pingCheck("redis"),
      () => this.queueIndicator.pingCheck("queue"),
    ]);
  }
}
