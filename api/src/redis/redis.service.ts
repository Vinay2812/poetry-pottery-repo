import {
  Inject,
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from "@nestjs/common";
import Redis from "ioredis";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import type { Logger } from "winston";

import { env } from "@/config/env";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;

// JSON drops Date objects; the GraphQL DateTime scalar needs them back.
export function reviveDates(_key: string, value: unknown): unknown {
  return typeof value === "string" && ISO_DATE.test(value)
    ? new Date(value)
    : value;
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  readonly client: Redis;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.client = new Redis(env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 2,
      enableOfflineQueue: false,
    });
    this.client.on("error", (error: Error) => {
      this.logger.warn("redis error", { message: error.message });
    });
  }

  async onModuleInit(): Promise<void> {
    if (env.isTest) return;
    try {
      await this.client.connect();
    } catch (error) {
      this.logger.error("redis connect failed", {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.status !== "end") {
      await this.client.quit().catch(() => undefined);
    }
  }

  // Cache reads degrade to the loader on any Redis failure so the API never depends on Redis being up.
  async getOrSet<T>(
    key: string,
    ttlSeconds: number,
    loader: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.client.get(key).catch(() => null);
    if (cached !== null) {
      return JSON.parse(cached, reviveDates) as T;
    }
    const value = await loader();
    await this.client
      .set(key, JSON.stringify(value), "EX", ttlSeconds)
      .catch(() => undefined);
    return value;
  }

  // Short-lived per-owner sets of keys awaiting a home. Every call degrades to a no-op so a
  // Redis outage never blocks a write, the same way the caches above do.
  async trackPending(
    key: string,
    member: string,
    ttlSeconds: number,
  ): Promise<void> {
    await this.client
      .multi()
      .zadd(key, Date.now(), member)
      .expire(key, ttlSeconds)
      .exec()
      .catch(() => null);
  }

  // Hands back everything older than the cutoff and how many are still outstanding.
  async sweepPending(
    key: string,
    cutoffMs: number,
  ): Promise<{ expired: string[]; pending: number }> {
    const replies = await this.client
      .multi()
      .zrangebyscore(key, 0, cutoffMs)
      .zremrangebyscore(key, 0, cutoffMs)
      .zcard(key)
      .exec()
      .catch(() => null);
    if (!replies) return { expired: [], pending: 0 };
    const expired = replies[0]?.[1];
    const pending = replies[2]?.[1];
    return {
      expired: Array.isArray(expired) ? (expired as string[]) : [],
      pending: typeof pending === "number" ? pending : 0,
    };
  }

  async dropPending(key: string, members: string[]): Promise<void> {
    if (members.length === 0) return;
    await this.client.zrem(key, ...members).catch(() => undefined);
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await this.client.del(...keys).catch(() => undefined);
  }
}
