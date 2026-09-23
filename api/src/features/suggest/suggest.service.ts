import { Injectable } from "@nestjs/common";
import { EventStatus } from "@prisma/client";

import { PrismaService } from "@/prisma/prisma.service";
import { RedisService } from "@/redis/redis.service";
import { SearchService } from "@/features/search/search.service";
import {
  isProductArchived,
  releasedProductWhere,
} from "@/features/products/products.service";
import type { Suggestions } from "./suggest.type";

export const MAX_PIECES = 4;
export const MAX_EVENTS = 3;
export const MAX_WORKSHOPS = 2;
export const MIN_TERM_LENGTH = 2;
const MAX_TERM_LENGTH = 80;
// Short enough that a new piece shows up almost at once, long enough to absorb a burst of typing.
const SUGGEST_CACHE_SECONDS = 30;

export function normaliseTerm(query: string): string {
  return query.trim().replace(/\s+/g, " ").slice(0, MAX_TERM_LENGTH);
}

const EMPTY: Suggestions = { pieces: [], events: [], workshops: [] };

@Injectable()
export class SuggestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly search: SearchService,
  ) {}

  async suggest(query: string): Promise<Suggestions> {
    const term = normaliseTerm(query);
    if (term.length < MIN_TERM_LENGTH) return EMPTY;
    return this.redis.getOrSet(
      `suggest:${term.toLowerCase()}`,
      SUGGEST_CACHE_SECONDS,
      () => this.lookUp(term),
    );
  }

  private async lookUp(term: string): Promise<Suggestions> {
    // Pieces and evenings come off the same hybrid ranking the search page uses, and off one
    // trip through the embedding model: it is the expensive half of a suggestion.
    const vector = await this.search.safeEmbed(term);
    const [pieceIds, eventIds] = await Promise.all([
      this.search.rankProducts(term, MAX_PIECES, vector),
      this.search.rankEvents(term, MAX_EVENTS, vector),
    ]);
    const [pieces, events, workshops] = await Promise.all([
      pieceIds.length > 0
        ? this.prisma.product.findMany({
            where: { id: { in: pieceIds }, ...releasedProductWhere() },
            select: {
              id: true,
              slug: true,
              name: true,
              price: true,
              image_urls: true,
              is_active: true,
              stock: true,
              is_customizable: true,
              collection: { select: { starts_at: true, ends_at: true } },
            },
          })
        : [],
      eventIds.length > 0
        ? this.prisma.event.findMany({
            where: { id: { in: eventIds }, status: EventStatus.PUBLISHED },
            select: { id: true, slug: true, title: true, starts_at: true },
          })
        : [],
      // Wheel sessions are not indexed; there are a handful of them and they match by name.
      this.prisma.workshopConfig.findMany({
        where: {
          is_active: true,
          name: { contains: term, mode: "insensitive" },
        },
        orderBy: { id: "asc" },
        take: MAX_WORKSHOPS,
        select: { id: true, slug: true, name: true },
      }),
    ]);

    return {
      pieces: inRankOrder(pieces, pieceIds).map((piece) => ({
        id: piece.id,
        slug: piece.slug,
        name: piece.name,
        price: piece.price,
        image_url: piece.image_urls[0] ?? null,
        is_archived: isProductArchived(piece),
      })),
      events: inRankOrder(events, eventIds),
      workshops,
    };
  }
}

function inRankOrder<T extends { id: number }>(rows: T[], ids: number[]): T[] {
  const rank = new Map(ids.map((id, index) => [id, index]));
  return [...rows].sort(
    (a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0),
  );
}
