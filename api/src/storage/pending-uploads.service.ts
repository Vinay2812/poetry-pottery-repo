import { Injectable } from "@nestjs/common";

import { QueueService } from "@/queue/queue.service";
import { RedisService } from "@/redis/redis.service";
import { StorageService } from "./storage.service";

const PREFIX = "uploads:customization";
// A photo that reached no cart line, order or brief in a day was never wanted.
export const ABANDONED_AFTER_MS = 24 * 60 * 60 * 1000;
// The set itself expires well after the last key in it could still be swept.
const SET_TTL_SECONDS = 7 * 24 * 60 * 60;
const SWEEP_BATCH = 50;

export function pendingKey(userId: number): string {
  return `${PREFIX}:${userId}`;
}

// Reference photos are presigned before anyone commits to using them, so most of them are
// uploaded and then abandoned. Each one is tracked from the moment it is signed and untracked
// the moment it lands somewhere that keeps it; whatever is still tracked a day later is rubbish
// and gets swept on the owner's next presign.
@Injectable()
export class PendingUploadsService {
  constructor(
    private readonly redis: RedisService,
    private readonly queue: QueueService,
    private readonly storage: StorageService,
  ) {}

  async track(userId: number, key: string): Promise<void> {
    const set = pendingKey(userId);
    await this.redis.client
      .zadd(set, Date.now(), key)
      .then(() => this.redis.client.expire(set, SET_TTL_SECONDS))
      .catch(() => undefined);
  }

  // Called wherever a photo lands for good: a cart line, an order item or a commission brief.
  async keep(userId: number, urls: readonly string[]): Promise<void> {
    const keys = urls.flatMap((url) => {
      const key = this.storage.keyFor(url);
      return key === null ? [] : [key];
    });
    if (keys.length === 0) return;
    await this.redis.client
      .zrem(pendingKey(userId), ...keys)
      .catch(() => undefined);
  }

  // Deletes are enqueued rather than awaited, so a slow bucket never holds up a presign.
  async sweep(userId: number): Promise<number> {
    const set = pendingKey(userId);
    const cutoff = Date.now() - ABANDONED_AFTER_MS;
    const stale = await this.redis.client
      .zrangebyscore(set, "-inf", `(${cutoff}`, "LIMIT", 0, SWEEP_BATCH)
      .catch((): string[] => []);
    if (stale.length === 0) return 0;
    for (const key of stale) {
      await this.queue.publish("storage.delete-object", { key });
    }
    await this.redis.client.zrem(set, ...stale).catch(() => undefined);
    return stale.length;
  }
}
