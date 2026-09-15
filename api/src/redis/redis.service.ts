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
      return JSON.parse(cached) as T;
    }
    const value = await loader();
    await this.client
      .set(key, JSON.stringify(value), "EX", ttlSeconds)
      .catch(() => undefined);
    return value;
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await this.client.del(...keys).catch(() => undefined);
  }
}
