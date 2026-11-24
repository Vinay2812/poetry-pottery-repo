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

// Unthrottled and public behind nginx, so pings are shared: a flood of probes still costs one round per window.
export const HEALTH_CACHE_MS = 2_000;

// SkipThrottle keeps orchestrators and uptime probes from consuming the rate limit.
// Each named throttler has to be listed; the bare decorator only skips `default`.
@SkipThrottle({ default: true, short: true, strict: true })
@Controller("health")
export class HealthController {
  private latest: { at: number; result: Promise<HealthCheckResult> } | null =
    null;

  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaIndicator: PrismaHealthIndicator,
    private readonly redisIndicator: RedisHealthIndicator,
    private readonly queueIndicator: QueueHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    const now = Date.now();
    if (this.latest && now - this.latest.at < HEALTH_CACHE_MS) {
      return this.latest.result;
    }
    const result = this.runChecks();
    this.latest = { at: now, result };
    return result;
  }

  private runChecks(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.prismaIndicator.pingCheck("database"),
      () => this.redisIndicator.pingCheck("redis"),
      () => this.queueIndicator.pingCheck("queue"),
    ]);
  }
}
