import { RABBIT_HANDLER } from "@golevelup/nestjs-rabbitmq";
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { UploadsConsumer } from "./uploads.consumer";
import { UploadsService } from "./uploads.service";

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

const uploadsMock = { expire: vi.fn<UploadsService["expire"]>() };

describe("UploadsConsumer", () => {
  let consumer: UploadsConsumer;

  beforeEach(async () => {
    vi.clearAllMocks();
    uploadsMock.expire.mockResolvedValue(true);
    const moduleRef = await Test.createTestingModule({
      providers: [
        UploadsConsumer,
        { provide: UploadsService, useValue: uploadsMock },
      ],
    }).compile();
    consumer = moduleRef.get(UploadsConsumer);
  });

  it("hands the key the job names to the expiry", async () => {
    await consumer.handle({ key: "reviews/7/a.jpg" });

    expect(uploadsMock.expire).toHaveBeenCalledWith("reviews/7/a.jpg");
  });

  it("refuses an empty, missing or mistyped key and expires nothing", async () => {
    await expect(consumer.handle({ key: "" })).rejects.toThrow();
    await expect(consumer.handle({})).rejects.toThrow();
    await expect(consumer.handle({ key: 42 })).rejects.toThrow();
    await expect(consumer.handle(null)).rejects.toThrow();
    expect(uploadsMock.expire).not.toHaveBeenCalled();
  });

  it("lets a bucket failure escape so the broker can retry the job", async () => {
    uploadsMock.expire.mockRejectedValue(new Error("r2 refused"));

    await expect(consumer.handle({ key: "reviews/7/a.jpg" })).rejects.toThrow(
      "r2 refused",
    );
  });

  it("listens on the durable expiry queue bound to the topic exchange", () => {
    expect(subscriptionOn(UploadsConsumer.prototype, "handle")).toEqual({
      type: "subscribe",
      errorHandler: anyFunction(),
      exchange: "poetry",
      routingKey: "upload.expire",
      queue: "poetry.upload.expire",
      queueOptions: { durable: true, deadLetterExchange: "poetry.dlx" },
    });
  });
});
