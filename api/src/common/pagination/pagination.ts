import { Field, Int, ObjectType } from "@nestjs/graphql";

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 60;

export interface PageBounds {
  page: number;
  limit: number;
  skip: number;
}

export function clampPage(
  page: number | null | undefined,
  limit: number | null | undefined,
  max = MAX_PAGE_SIZE,
): PageBounds {
  const safePage = Math.max(1, Math.trunc(page ?? 1));
  const safeLimit = Math.min(
    max,
    Math.max(1, Math.trunc(limit ?? DEFAULT_PAGE_SIZE)),
  );
  return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
}

export function hasMore(bounds: PageBounds, total: number): boolean {
  return bounds.skip + bounds.limit < total;
}

export interface Slice {
  skip: number;
  take: number;
}

// A read is only worth sending when its slice starts inside the list.
export function canReturnRows(slice: Slice, total: number): boolean {
  return slice.take > 0 && slice.skip < total;
}

// One page laid over two lists read back to back: how much of it each list fills.
export function splitPage(
  bounds: PageBounds,
  firstTotal: number,
): { first: Slice; second: Slice } {
  const firstTake = Math.max(
    0,
    Math.min(bounds.limit, firstTotal - bounds.skip),
  );
  return {
    first: { skip: Math.min(bounds.skip, firstTotal), take: firstTake },
    second: {
      skip: Math.max(0, bounds.skip - firstTotal),
      take: bounds.limit - firstTake,
    },
  };
}

@ObjectType()
export class PageInfo {
  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  limit!: number;

  @Field()
  has_more!: boolean;
}

export function toPageInfo(bounds: PageBounds, total: number): PageInfo {
  return {
    total,
    page: bounds.page,
    limit: bounds.limit,
    has_more: hasMore(bounds, total),
  };
}
