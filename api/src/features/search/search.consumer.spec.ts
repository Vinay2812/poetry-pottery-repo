import { RABBIT_HANDLER } from "@golevelup/nestjs-rabbitmq";
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { SearchConsumer } from "./search.consumer";
import { SearchService } from "./search.service";

const subscriptionSchema = z.object({
  type: z.string(),
  exchange: z.string(),
  routingKey: z.string(),
  queue: z.string(),
  queueOptions: z.object({
    durable: z.boolean(),
    deadLetterExchange: z.string(),
  }),
});

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

const searchMock = {
  indexProduct: vi.fn<SearchService["indexProduct"]>(),
  indexEvent: vi.fn<SearchService["indexEvent"]>(),
};

describe("SearchConsumer", () => {
  let consumer: SearchConsumer;

  beforeEach(async () => {
    vi.clearAllMocks();
    searchMock.indexProduct.mockResolvedValue(undefined);
    searchMock.indexEvent.mockResolvedValue(undefined);
    const moduleRef = await Test.createTestingModule({
      providers: [
        SearchConsumer,
        { provide: SearchService, useValue: searchMock },
      ],
    }).compile();
    consumer = moduleRef.get(SearchConsumer);
  });

  it("unwraps a product job down to the bare id", async () => {
    await consumer.indexProduct({ productId: 12 });

    expect(searchMock.indexProduct).toHaveBeenCalledWith(12);
    expect(searchMock.indexEvent).not.toHaveBeenCalled();
  });

  it("unwraps an event job down to the bare id", async () => {
    await consumer.indexEvent({ eventId: 3 });

    expect(searchMock.indexEvent).toHaveBeenCalledWith(3);
    expect(searchMock.indexProduct).not.toHaveBeenCalled();
  });

  it("refuses a product job carrying an event id and indexes nothing", async () => {
    await expect(consumer.indexProduct({ eventId: 12 })).rejects.toThrow();
    expect(searchMock.indexProduct).not.toHaveBeenCalled();
  });

  it("refuses a float where a row id is required", async () => {
    await expect(consumer.indexProduct({ productId: 1.5 })).rejects.toThrow();
    await expect(consumer.indexEvent({ eventId: 2.5 })).rejects.toThrow();
    expect(searchMock.indexProduct).not.toHaveBeenCalled();
    expect(searchMock.indexEvent).not.toHaveBeenCalled();
  });

  it("refuses an id sent as a string rather than coercing it", async () => {
    await expect(consumer.indexProduct({ productId: "12" })).rejects.toThrow();
    await expect(consumer.indexEvent({ eventId: "3" })).rejects.toThrow();
    expect(searchMock.indexProduct).not.toHaveBeenCalled();
    expect(searchMock.indexEvent).not.toHaveBeenCalled();
  });

  it("refuses a payload that is not an object at all", async () => {
    await expect(consumer.indexProduct(null)).rejects.toThrow();
    await expect(consumer.indexProduct("12")).rejects.toThrow();
    await expect(consumer.indexEvent(undefined)).rejects.toThrow();
    await expect(consumer.indexEvent([3])).rejects.toThrow();
    expect(searchMock.indexProduct).not.toHaveBeenCalled();
    expect(searchMock.indexEvent).not.toHaveBeenCalled();
  });

  it("lets an indexing failure escape so the broker can dead-letter the job", async () => {
    searchMock.indexProduct.mockRejectedValue(new Error("pgvector down"));

    await expect(consumer.indexProduct({ productId: 12 })).rejects.toThrow(
      "pgvector down",
    );
  });

  it("listens on one durable queue per index job", () => {
    expect(subscriptionOn(SearchConsumer.prototype, "indexProduct")).toEqual({
      type: "subscribe",
      exchange: "poetry",
      routingKey: "search.index-product",
      queue: "poetry.search.index-product",
      queueOptions: { durable: true, deadLetterExchange: "poetry.dlx" },
    });
    expect(subscriptionOn(SearchConsumer.prototype, "indexEvent")).toEqual({
      type: "subscribe",
      exchange: "poetry",
      routingKey: "search.index-event",
      queue: "poetry.search.index-event",
      queueOptions: { durable: true, deadLetterExchange: "poetry.dlx" },
    });
  });
});
