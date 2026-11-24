import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { HealthCheckService } from "@nestjs/terminus";

import { HEALTH_CACHE_MS, HealthController } from "./health.controller";
import type { PrismaHealthIndicator } from "./prisma.health";
import type { QueueHealthIndicator } from "./queue.health";
import type { RedisHealthIndicator } from "./redis.health";

describe("HealthController", () => {
  const check = vi.fn();
  let controller: HealthController;

  beforeEach(() => {
    vi.useFakeTimers();
    check.mockReset().mockResolvedValue({ status: "ok", details: {} });
    const indicator = { pingCheck: vi.fn() };
    controller = new HealthController(
      { check } as unknown as HealthCheckService,
      indicator as unknown as PrismaHealthIndicator,
      indicator as unknown as RedisHealthIndicator,
      indicator as unknown as QueueHealthIndicator,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("answers a burst of probes with one round of pings", async () => {
    await Promise.all(Array.from({ length: 50 }, () => controller.check()));
    expect(check).toHaveBeenCalledTimes(1);
  });

  it("pings again once the window has passed", async () => {
    await controller.check();
    vi.advanceTimersByTime(HEALTH_CACHE_MS);
    await controller.check();
    expect(check).toHaveBeenCalledTimes(2);
  });

  it("keeps reporting a failure for the rest of the window", async () => {
    check.mockRejectedValueOnce(new Error("database down"));
    await expect(controller.check()).rejects.toThrow("database down");
    await expect(controller.check()).rejects.toThrow("database down");
    expect(check).toHaveBeenCalledTimes(1);
  });
});
