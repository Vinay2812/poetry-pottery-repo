import { ArgsType, Field, InputType, Int, ObjectType } from "@nestjs/graphql";

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

@ArgsType()
export class PageArgs {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  page!: number;

  @Field(() => Int, { nullable: true, defaultValue: DEFAULT_PAGE_SIZE })
  limit!: number;
}

@InputType()
export class PageInput {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  page!: number;

  @Field(() => Int, { nullable: true, defaultValue: DEFAULT_PAGE_SIZE })
  limit!: number;
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
