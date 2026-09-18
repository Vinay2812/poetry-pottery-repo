import { Inject, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import type { Logger } from "winston";

import {
  EmbeddingsService,
  toVectorLiteral,
} from "@/embeddings/embeddings.service";
import { PrismaService } from "@/prisma/prisma.service";
import { QueueService } from "@/queue/queue.service";

// Cosine distance above this is noise for MiniLM; keyword hits are always kept.
const MAX_SEMANTIC_DISTANCE = 0.55;
// word_similarity below this is a different word, not a typo or a prefix of this one.
const MIN_NAME_SIMILARITY = 0.4;

// "chaa" becomes "chaa:*" so a half-typed word matches; "blue mug" becomes "blue & mug:*".
export function toPrefixTsQuery(term: string): string | null {
  const words = term
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length > 0);
  if (words.length === 0) return null;
  return words
    .map((word, index) => (index === words.length - 1 ? `${word}:*` : word))
    .join(" & ");
}

interface RankedRow {
  id: number;
}

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddings: EmbeddingsService,
    private readonly queue: QueueService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  // Keyword rank and semantic similarity are blended so exact names win and near-misses still surface.
  // A caller ranking two tables for one term passes the vector in rather than embedding twice.
  async rankProducts(
    term: string,
    limit: number,
    vector?: string | null,
  ): Promise<number[]> {
    const embedded = vector === undefined ? await this.safeEmbed(term) : vector;
    const rows = await this.prisma.$queryRaw<RankedRow[]>(
      rankQuery("products", term, embedded, limit),
    );
    return rows.map((row) => row.id);
  }

  async rankEvents(
    term: string,
    limit: number,
    vector?: string | null,
  ): Promise<number[]> {
    const embedded = vector === undefined ? await this.safeEmbed(term) : vector;
    const rows = await this.prisma.$queryRaw<RankedRow[]>(
      rankQuery("events", term, embedded, limit),
    );
    return rows.map((row) => row.id);
  }

  requestProductIndex(productId: number): Promise<void> {
    return this.queue.publish("search.index-product", { productId });
  }

  requestEventIndex(eventId: number): Promise<void> {
    return this.queue.publish("search.index-event", { eventId });
  }

  async indexProduct(productId: number): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: {
        name: true,
        description: true,
        material: true,
        color_name: true,
        categories: { select: { name: true } },
      },
    });
    if (!product) return;
    const text = [
      product.name,
      product.material,
      product.color_name,
      product.categories.map((c) => c.name).join(" "),
      product.description,
    ]
      .filter((part): part is string => Boolean(part))
      .join(". ");
    const vector = toVectorLiteral(await this.embeddings.embed(text));
    await this.prisma
      .$executeRaw`UPDATE "products" SET "embedding" = ${vector}::vector WHERE "id" = ${productId}`;
  }

  async indexEvent(eventId: number): Promise<void> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        title: true,
        description: true,
        event_type: true,
        level: true,
        instructor: true,
      },
    });
    if (!event) return;
    const text = [
      event.title,
      event.event_type.replaceAll("_", " ").toLowerCase(),
      event.level?.toLowerCase(),
      event.instructor,
      event.description,
    ]
      .filter((part): part is string => Boolean(part))
      .join(". ");
    const vector = toVectorLiteral(await this.embeddings.embed(text));
    await this.prisma
      .$executeRaw`UPDATE "events" SET "embedding" = ${vector}::vector WHERE "id" = ${eventId}`;
  }

  async reindexAll(): Promise<{ products: number; events: number }> {
    const [products, events] = await Promise.all([
      this.prisma.product.findMany({ select: { id: true } }),
      this.prisma.event.findMany({ select: { id: true } }),
    ]);
    for (const { id } of products) await this.indexProduct(id);
    for (const { id } of events) await this.indexEvent(id);
    return { products: products.length, events: events.length };
  }

  // Search must keep working on keywords alone if the model is unavailable.
  async safeEmbed(term: string): Promise<string | null> {
    try {
      return toVectorLiteral(await this.embeddings.embed(term));
    } catch (error) {
      this.logger.warn("query embedding failed", {
        message: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }
}

function rankQuery(
  table: "products" | "events",
  term: string,
  vector: string | null,
  limit: number,
): Prisma.Sql {
  const tableSql =
    table === "products" ? Prisma.sql`"products"` : Prisma.sql`"events"`;
  const nameSql =
    table === "products" ? Prisma.sql`"name"` : Prisma.sql`"title"`;
  // The shelf and the archive share one ranking, so products carry no scope here; the caller
  // narrows with availableProductWhere or archivedProductWhere. Draft events never surface.
  const scopeSql =
    table === "products" ? Prisma.sql`TRUE` : Prisma.sql`"status" <> 'DRAFT'`;
  const keyword = Prisma.sql`ts_rank("search_vector", websearch_to_tsquery('english', ${term}))`;
  // Three ways in: the whole words, the words with the last one half-typed, and the name by
  // trigram so a near spelling still lands. Similarity feeds the order as well as the filter.
  const prefix = toPrefixTsQuery(term);
  const prefixMatch = prefix
    ? Prisma.sql`OR "search_vector" @@ to_tsquery('english', ${prefix})`
    : Prisma.empty;
  const similarity = Prisma.sql`word_similarity(${term}, ${nameSql})`;
  const wordMatch = Prisma.sql`
    "search_vector" @@ websearch_to_tsquery('english', ${term})
    ${prefixMatch}
    OR ${similarity} >= ${MIN_NAME_SIMILARITY}`;
  if (!vector) {
    return Prisma.sql`
      SELECT "id" FROM ${tableSql}
      WHERE ${scopeSql} AND (${wordMatch})
      ORDER BY (${keyword} * 2 + ${similarity}) DESC, "id" DESC
      LIMIT ${limit}`;
  }
  const distance = Prisma.sql`("embedding" <=> ${vector}::vector)`;
  return Prisma.sql`
    SELECT "id" FROM ${tableSql}
    WHERE ${scopeSql} AND (
      ${wordMatch}
      OR ("embedding" IS NOT NULL AND ${distance} < ${MAX_SEMANTIC_DISTANCE})
    )
    ORDER BY (${keyword} * 2 + ${similarity} + COALESCE(1 - ${distance}, 0)) DESC, "id" DESC
    LIMIT ${limit}`;
}
