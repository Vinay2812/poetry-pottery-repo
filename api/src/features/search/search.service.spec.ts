import { Test } from "@nestjs/testing";
import type { Prisma } from "@prisma/client";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EmbeddingsService } from "@/embeddings/embeddings.service";
import { PrismaService } from "@/prisma/prisma.service";
import { QueueService } from "@/queue/queue.service";
import { SearchService } from "./search.service";

const prismaMock = {
  $queryRaw: vi.fn(),
  $executeRaw: vi.fn(),
  product: { findUnique: vi.fn() },
};
const embeddingsMock = { embed: vi.fn() };
const queueMock = { publish: vi.fn() };
const loggerMock = { warn: vi.fn(), info: vi.fn(), error: vi.fn() };

function lastSql(): Prisma.Sql {
  return prismaMock.$queryRaw.mock.calls[0]?.[0] as Prisma.Sql;
}

describe("SearchService", () => {
  let service: SearchService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: EmbeddingsService, useValue: embeddingsMock },
        { provide: QueueService, useValue: queueMock },
        { provide: WINSTON_MODULE_PROVIDER, useValue: loggerMock },
      ],
    }).compile();
    service = moduleRef.get(SearchService);
  });

  it("blends keyword rank with vector similarity when an embedding exists", async () => {
    embeddingsMock.embed.mockResolvedValue([0.1, 0.2]);
    prismaMock.$queryRaw.mockResolvedValue([{ id: 3 }, { id: 1 }]);

    await expect(service.rankProducts("chai cup", 50)).resolves.toEqual([3, 1]);
    const sql = lastSql();
    expect(sql.sql).toContain("<=>");
    expect(sql.sql).toContain("websearch_to_tsquery");
    expect(sql.values).toContain("chai cup");
    expect(sql.values).toContain("[0.100000,0.200000]");
    expect(sql.values).toContain(50);
  });

  it("falls back to keyword ranking when the model is unavailable", async () => {
    embeddingsMock.embed.mockRejectedValue(new Error("model missing"));
    prismaMock.$queryRaw.mockResolvedValue([{ id: 2 }]);

    await expect(service.rankProducts("mug", 10)).resolves.toEqual([2]);
    expect(lastSql().sql).not.toContain("<=>");
    expect(loggerMock.warn).toHaveBeenCalledWith(
      "query embedding failed",
      expect.anything(),
    );
  });

  it("ranks products across both views so the archive can search too", async () => {
    embeddingsMock.embed.mockResolvedValue([0.1]);
    prismaMock.$queryRaw.mockResolvedValue([{ id: 5 }]);

    await service.rankProducts("retired vase", 20);

    expect(lastSql().sql).not.toContain("is_active");
  });

  it("keeps drafts out of event ranking without dropping completed events", async () => {
    embeddingsMock.embed.mockResolvedValue([0.1]);
    prismaMock.$queryRaw.mockResolvedValue([{ id: 8 }]);

    await service.rankEvents("wheel session", 20);

    const sql = lastSql().sql;
    expect(sql).toContain("\"status\" <> 'DRAFT'");
    expect(sql).not.toContain("'PUBLISHED'");
  });

  it("writes the product embedding as a pgvector literal", async () => {
    prismaMock.product.findUnique.mockResolvedValue({
      name: "Mug",
      description: "A mug",
      material: "Stoneware",
      color_name: null,
      categories: [{ name: "Mugs" }],
    });
    embeddingsMock.embed.mockResolvedValue([0.5]);

    await service.indexProduct(7);

    expect(embeddingsMock.embed).toHaveBeenCalledWith(
      "Mug. Stoneware. Mugs. A mug",
    );
    // Tagged template call: the first argument is the strings array, then the bound values.
    const [, vector, id] = prismaMock.$executeRaw.mock.calls[0] as unknown[];
    expect([vector, id]).toEqual(["[0.500000]", 7]);
  });

  it("enqueues index jobs instead of embedding inline", async () => {
    await service.requestProductIndex(4);
    expect(queueMock.publish).toHaveBeenCalledWith("search.index-product", {
      productId: 4,
    });
  });
});
