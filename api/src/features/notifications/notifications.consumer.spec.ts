import { RABBIT_HANDLER } from "@golevelup/nestjs-rabbitmq";
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { NotificationsConsumer } from "./notifications.consumer";
import { NotificationsService } from "./notifications.service";

const notificationsMock = {
  sendBackInStock: vi.fn<NotificationsService["sendBackInStock"]>(),
};

const anyFunction = (): unknown => expect.any(Function);

describe("NotificationsConsumer", () => {
  let consumer: NotificationsConsumer;

  beforeEach(async () => {
    vi.clearAllMocks();
    notificationsMock.sendBackInStock.mockResolvedValue(0);
    const moduleRef = await Test.createTestingModule({
      providers: [
        NotificationsConsumer,
        { provide: NotificationsService, useValue: notificationsMock },
      ],
    }).compile();
    consumer = moduleRef.get(NotificationsConsumer);
  });

  it("unwraps the job down to the bare product id", async () => {
    await consumer.backInStock({ productId: 12 });

    expect(notificationsMock.sendBackInStock).toHaveBeenCalledWith(12);
  });

  it("refuses a payload that is not a product id and mails nobody", async () => {
    await expect(consumer.backInStock({ productId: "12" })).rejects.toThrow();
    await expect(consumer.backInStock(null)).rejects.toThrow();
    expect(notificationsMock.sendBackInStock).not.toHaveBeenCalled();
  });

  it("lets a failure escape so the broker can dead-letter the job", async () => {
    notificationsMock.sendBackInStock.mockRejectedValue(new Error("smtp down"));

    await expect(consumer.backInStock({ productId: 12 })).rejects.toThrow(
      "smtp down",
    );
  });

  it("listens on its own durable queue", () => {
    const handler: unknown = Object.getOwnPropertyDescriptor(
      NotificationsConsumer.prototype,
      "backInStock",
    )?.value;

    expect(Reflect.getMetadata(RABBIT_HANDLER, handler as object)).toEqual({
      type: "subscribe",
      errorHandler: anyFunction(),
      exchange: "poetry",
      routingKey: "notify.back-in-stock",
      queue: "poetry.notify.back-in-stock",
      queueOptions: { durable: true, deadLetterExchange: "poetry.dlx" },
    });
  });
});
