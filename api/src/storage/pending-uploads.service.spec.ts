import { Test } from "@nestjs/testing";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { QueueService } from "@/queue/queue.service";
import { RedisService } from "@/redis/redis.service";
import {
  ABANDONED_AFTER_MS,
  PendingUploadsService,
  pendingKey,
} from "./pending-uploads.service";
import { StorageService } from "./storage.service";

const NOW = new Date("2026-09-17T12:00:00.000Z");
const PUBLIC = "https://cdn.test";

const clientMock = {
  zadd: vi.fn().mockResolvedValue(1),
  zrem: vi.fn().mockResolvedValue(1),
  zrangebyscore: vi.fn().mockResolvedValue([]),
  expire: vi.fn().mockResolvedValue(1),
};
const redisMock = { client: clientMock };
const queueMock = { publish: vi.fn() };
const storageMock = {
  isOwnUrl: vi.fn((url: string) => url.startsWith(`${PUBLIC}/`)),
  keyFor: vi.fn((url: string) =>
    url.startsWith(`${PUBLIC}/`) ? url.slice(PUBLIC.length + 1) : null,
  ),
};

describe("PendingUploadsService", () => {
  let service: PendingUploadsService;

  beforeEach(async () => {
    vi.clearAllMocks();
    clientMock.zrangebyscore.mockResolvedValue([]);
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    const moduleRef = await Test.createTestingModule({
      providers: [
        PendingUploadsService,
        { provide: RedisService, useValue: redisMock },
        { provide: QueueService, useValue: queueMock },
        { provide: StorageService, useValue: storageMock },
      ],
    }).compile();
    service = moduleRef.get(PendingUploadsService);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("tracks a signed key under its owner, timestamped, in a set that expires", async () => {
    await service.track(7, "customization/7/a.jpg");

    expect(clientMock.zadd).toHaveBeenCalledWith(
      pendingKey(7),
      NOW.getTime(),
      "customization/7/a.jpg",
    );
    expect(clientMock.expire).toHaveBeenCalledWith(pendingKey(7), 604800);
  });

  it("keeps one person's photos apart from another's", () => {
    expect(pendingKey(7)).toBe("uploads:customization:7");
    expect(pendingKey(8)).not.toBe(pendingKey(7));
  });

  it("untracks the keys behind the urls that landed somewhere", async () => {
    await service.keep(7, [
      `${PUBLIC}/customization/7/a.jpg`,
      `${PUBLIC}/customization/7/b.jpg`,
    ]);

    expect(clientMock.zrem).toHaveBeenCalledWith(
      pendingKey(7),
      "customization/7/a.jpg",
      "customization/7/b.jpg",
    );
  });

  it("ignores urls that are not ours and touches redis for nothing", async () => {
    await service.keep(7, ["https://elsewhere.test/a.jpg"]);
    await service.keep(7, []);

    expect(clientMock.zrem).not.toHaveBeenCalled();
  });

  it("sweeps only what has sat untouched for a day, and drops it from the set", async () => {
    clientMock.zrangebyscore.mockResolvedValue([
      "customization/7/old.jpg",
      "customization/7/older.jpg",
    ]);

    await expect(service.sweep(7)).resolves.toBe(2);

    expect(clientMock.zrangebyscore).toHaveBeenCalledWith(
      pendingKey(7),
      "-inf",
      `(${NOW.getTime() - ABANDONED_AFTER_MS}`,
      "LIMIT",
      0,
      50,
    );
    expect(queueMock.publish).toHaveBeenCalledWith("storage.delete-object", {
      key: "customization/7/old.jpg",
    });
    expect(queueMock.publish).toHaveBeenCalledWith("storage.delete-object", {
      key: "customization/7/older.jpg",
    });
    expect(clientMock.zrem).toHaveBeenCalledWith(
      pendingKey(7),
      "customization/7/old.jpg",
      "customization/7/older.jpg",
    );
  });

  it("deletes nothing when everything tracked is still young", async () => {
    await expect(service.sweep(7)).resolves.toBe(0);

    expect(queueMock.publish).not.toHaveBeenCalled();
    expect(clientMock.zrem).not.toHaveBeenCalled();
  });

  it("swallows a Redis outage rather than failing the upload it was called from", async () => {
    clientMock.zadd.mockRejectedValueOnce(new Error("redis down"));
    clientMock.zrem.mockRejectedValueOnce(new Error("redis down"));
    clientMock.zrangebyscore.mockRejectedValueOnce(new Error("redis down"));

    await expect(
      service.track(7, "customization/7/a.jpg"),
    ).resolves.toBeUndefined();
    await expect(
      service.keep(7, [`${PUBLIC}/customization/7/a.jpg`]),
    ).resolves.toBeUndefined();
    await expect(service.sweep(7)).resolves.toBe(0);
  });
});
