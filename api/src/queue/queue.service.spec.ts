import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { Test } from "@nestjs/testing";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "@/prisma/prisma.service";
import { jobSchemas, QUEUE_EXCHANGE } from "./jobs";
import { QueueService } from "./queue.service";

const amqpMock = {
  publish:
    vi.fn<
      (
        exchange: string,
        routingKey: string,
        payload: unknown,
        options: unknown,
      ) => Promise<void>
    >(),
  connected: true,
};
const loggerMock = { error: vi.fn(), info: vi.fn(), warn: vi.fn() };
const prismaMock = {
  afterCommit: vi.fn((fn: () => Promise<void> | void) => Promise.resolve(fn())),
};

describe("QueueService", () => {
  let service: QueueService;

  beforeEach(async () => {
    vi.clearAllMocks();
    amqpMock.connected = true;
    const moduleRef = await Test.createTestingModule({
      providers: [
        QueueService,
        { provide: AmqpConnection, useValue: amqpMock },
        { provide: PrismaService, useValue: prismaMock },
        { provide: WINSTON_MODULE_PROVIDER, useValue: loggerMock },
      ],
    }).compile();
    service = moduleRef.get(QueueService);
  });

  it("routes a job to the topic exchange under its own name", async () => {
    await service.publish("search.index-product", { productId: 12 });

    expect(amqpMock.publish).toHaveBeenCalledWith(
      QUEUE_EXCHANGE,
      "search.index-product",
      { productId: 12 },
      { persistent: true },
    );
  });

  it("parks a delayed job on its delay queue through the default exchange", async () => {
    await service.publishDelayed("upload.expire", { key: "reviews/7/a.jpg" });

    expect(amqpMock.publish).toHaveBeenCalledWith(
      "",
      "poetry.upload.expire.delay",
      { key: "reviews/7/a.jpg" },
      { persistent: true },
    );
  });

  it("hands the publish to the transaction seam, so it waits for the commit", async () => {
    const deferred: (() => Promise<void> | void)[] = [];
    prismaMock.afterCommit.mockImplementationOnce((fn) => {
      deferred.push(fn);
      return Promise.resolve();
    });

    await service.publish("search.index-product", { productId: 12 });
    expect(amqpMock.publish).not.toHaveBeenCalled();

    expect(deferred).toHaveLength(1);
    await deferred[0]?.();
    expect(amqpMock.publish).toHaveBeenCalledTimes(1);
  });

  it("publishes a mail payload the consumer will accept", async () => {
    const message = {
      to: "potter@example.com",
      subject: "Order received",
      html: "<p>Thanks</p>",
      text: "Thanks",
    };

    await service.publish("mail.send", message);

    const [, routingKey, payload] = amqpMock.publish.mock.calls[0] ?? [];
    expect(routingKey).toBe("mail.send");
    expect(jobSchemas["mail.send"].parse(payload)).toEqual(message);
  });

  it("swallows a broker failure so the mutation still succeeds", async () => {
    amqpMock.publish.mockRejectedValue(new Error("channel closed"));

    await expect(
      service.publish("search.index-event", { eventId: 3 }),
    ).resolves.toBeUndefined();
    expect(loggerMock.error).toHaveBeenCalledWith("queue publish failed", {
      job: "search.index-event",
      payload_keys: ["eventId"],
      message: "channel closed",
    });
  });

  it("logs the shape of a lost mail, never the address or the body", async () => {
    amqpMock.publish.mockRejectedValue("broker went away");

    await service.publish("mail.send", {
      to: "potter@example.com",
      subject: "Order received",
      html: "<p>Thanks</p>",
    });

    expect(loggerMock.error).toHaveBeenCalledWith("queue publish failed", {
      job: "mail.send",
      payload_keys: ["to", "subject", "html"],
      message: "broker went away",
    });
    const logged = JSON.stringify(loggerMock.error.mock.calls);
    expect(logged).not.toContain("potter@example.com");
    expect(logged).not.toContain("<p>Thanks</p>");
  });

  it("reports whether the broker connection is up", () => {
    expect(service.isConnected).toBe(true);
    amqpMock.connected = false;
    expect(service.isConnected).toBe(false);
  });
});
