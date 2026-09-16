import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { Test } from "@nestjs/testing";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

describe("QueueService", () => {
  let service: QueueService;

  beforeEach(async () => {
    vi.clearAllMocks();
    amqpMock.connected = true;
    const moduleRef = await Test.createTestingModule({
      providers: [
        QueueService,
        { provide: AmqpConnection, useValue: amqpMock },
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
      payload: { eventId: 3 },
      message: "channel closed",
    });
  });

  it("logs a non-error rejection without losing the job details", async () => {
    amqpMock.publish.mockRejectedValue("broker went away");

    await service.publish("search.index-event", { eventId: 3 });

    expect(loggerMock.error).toHaveBeenCalledWith("queue publish failed", {
      job: "search.index-event",
      payload: { eventId: 3 },
      message: "broker went away",
    });
  });

  it("reports whether the broker connection is up", () => {
    expect(service.isConnected).toBe(true);
    amqpMock.connected = false;
    expect(service.isConnected).toBe(false);
  });
});
