import { RABBIT_HANDLER } from "@golevelup/nestjs-rabbitmq";
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { StorageConsumer } from "./storage.consumer";
import { StorageService } from "./storage.service";

const subscriptionSchema = z.object({
  type: z.string(),
  errorHandler: z.custom<() => void>((value) => typeof value === "function"),
  exchange: z.string(),
  routingKey: z.string(),
  queue: z.string(),
  queueOptions: z.object({
    durable: z.boolean(),
    deadLetterExchange: z.string(),
  }),
});

const anyFunction = (): unknown => expect.any(Function);

function subscriptionOn(
  target: object,
  method: string,
): z.infer<typeof subscriptionSchema> {
  const handler: unknown = Object.getOwnPropertyDescriptor(
    target,
    method,
  )?.value;
  if (typeof handler !== "function") {
    throw new Error(`${method} is not a handler`);
  }
  return subscriptionSchema.parse(Reflect.getMetadata(RABBIT_HANDLER, handler));
}

const storageMock = { deleteObject: vi.fn<StorageService["deleteObject"]>() };

describe("StorageConsumer", () => {
  let consumer: StorageConsumer;

  beforeEach(async () => {
    vi.clearAllMocks();
    storageMock.deleteObject.mockResolvedValue(undefined);
    const moduleRef = await Test.createTestingModule({
      providers: [
        StorageConsumer,
        { provide: StorageService, useValue: storageMock },
      ],
    }).compile();
    consumer = moduleRef.get(StorageConsumer);
  });

  it("deletes the key the job names", async () => {
    await consumer.handle({ key: "customization/7/a.jpg" });

    expect(storageMock.deleteObject).toHaveBeenCalledWith(
      "customization/7/a.jpg",
    );
  });

  it("refuses an empty, missing or mistyped key and deletes nothing", async () => {
    await expect(consumer.handle({ key: "" })).rejects.toThrow();
    await expect(consumer.handle({})).rejects.toThrow();
    await expect(consumer.handle({ key: 42 })).rejects.toThrow();
    await expect(consumer.handle(null)).rejects.toThrow();
    expect(storageMock.deleteObject).not.toHaveBeenCalled();
  });

  it("lets a bucket failure escape so the broker can dead-letter the job", async () => {
    storageMock.deleteObject.mockRejectedValue(new Error("r2 refused"));

    await expect(
      consumer.handle({ key: "customization/7/a.jpg" }),
    ).rejects.toThrow("r2 refused");
  });

  it("listens on the durable delete queue bound to the topic exchange", () => {
    expect(subscriptionOn(StorageConsumer.prototype, "handle")).toEqual({
      type: "subscribe",
      errorHandler: anyFunction(),
      exchange: "poetry",
      routingKey: "storage.delete-object",
      queue: "poetry.storage.delete-object",
      queueOptions: { durable: true, deadLetterExchange: "poetry.dlx" },
    });
  });
});
