import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import type { INestApplication } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { Test } from "@nestjs/testing";
import {
  EventStatus,
  Prisma,
  RegistrationStatus,
  UserRole,
} from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";

import type { AuthUser } from "@/common/clerk/clerk.type";
import {
  depthLimitRule,
  MAX_QUERY_DEPTH,
} from "@/common/graphql/depth-limit.rule";
import { AuthGuard } from "@/common/guards/auth.guard";
import type { AppRequest, GqlContext } from "@/common/types/express";
import { EventsResolver } from "@/features/events/events.resolver";
import { EventsService } from "@/features/events/events.service";
import {
  GlazeResolver,
  ProductsResolver,
} from "@/features/products/products.resolver";
import { ProductsService } from "@/features/products/products.service";
import {
  EventReviewEligibilityResolver,
  ProductReviewEligibilityResolver,
} from "@/features/reviews/reviews.resolver";
import { ReviewsService } from "@/features/reviews/reviews.service";
import { WishlistService } from "@/features/wishlist/wishlist.service";
import { PrismaService } from "@/prisma/prisma.service";
import { postGraphql } from "@test/helpers/http";
// Registers every GraphQL type and enum, as the running API does; some type files lean on another's enums.
import "@/resolvers";

import {
  deliverProduct,
  makeEvent,
  makeProduct,
  makeUsers,
  outsideWorld,
  resetData,
  type TestUser,
} from "./harness";

const DELEGATES = new Set<string>(
  Object.values(Prisma.ModelName).map(
    (name) => name.charAt(0).toLowerCase() + name.slice(1),
  ),
);

// Counts every model call and raw query a request makes, however Prisma turns them into SQL.
class QueryCounter {
  readonly calls: string[] = [];

  wrap(service: PrismaService): PrismaService {
    const calls = this.calls;
    const counted =
      (label: string, fn: (...args: unknown[]) => unknown) =>
      (...args: unknown[]): unknown => {
        calls.push(label);
        return fn(...args);
      };
    return new Proxy(service, {
      get(target, prop, receiver): unknown {
        const value: unknown = Reflect.get(target, prop, receiver);
        if (typeof prop !== "string") return value;
        if (typeof value === "function" && /^\$(query|execute)Raw/.test(prop)) {
          return counted(
            prop,
            (...args) => Reflect.apply(value, target, args) as unknown,
          );
        }
        if (DELEGATES.has(prop) && typeof value === "object" && value) {
          return new Proxy(value, {
            get(delegate, method, delegateReceiver): unknown {
              const operation: unknown = Reflect.get(
                delegate,
                method,
                delegateReceiver,
              );
              return typeof operation === "function" &&
                typeof method === "string"
                ? counted(
                    `${prop}.${method}`,
                    (...args) =>
                      Reflect.apply(operation, delegate, args) as unknown,
                  )
                : operation;
            },
          });
        }
        return value;
      },
    });
  }

  reset(): void {
    this.calls.length = 0;
  }
}

const VIEWER_HEADER = "x-test-user";

// Stands in for Clerk: the header names the signed-in user, its absence is an anonymous visitor.
class ViewerGuard {
  canActivate(): boolean {
    return true;
  }

  tryAuthenticate(request: AppRequest): Promise<AuthUser | null> {
    const id = request.headers[VIEWER_HEADER];
    return Promise.resolve(
      typeof id === "string"
        ? { db_user_id: Number(id), role: UserRole.USER, auth_id: `user_${id}` }
        : null,
    );
  }
}

const eligibilitySchema = z.object({
  can_review: z.boolean(),
  reason: z.string().nullable(),
  my_review: z.object({ id: z.number() }).nullable(),
});

const glazesSchema = z.object({
  glazes: z.array(
    z.object({
      id: z.number(),
      pieces: z.array(
        z.object({
          id: z.number(),
          in_wishlist: z.boolean(),
          option_groups: z.array(
            z.object({
              id: z.number(),
              options: z.array(z.object({ id: z.number() })),
            }),
          ),
          review_eligibility: eligibilitySchema,
        }),
      ),
    }),
  ),
});

const eventItemsSchema = z.object({
  items: z.array(
    z.object({
      id: z.number(),
      my_registration: z.object({ id: z.string() }).nullable(),
      review_eligibility: eligibilitySchema.omit({ my_review: true }),
    }),
  ),
});

const GLAZES_QUERY = `{
  glazes {
    id
    pieces {
      id
      in_wishlist
      option_groups { id options { id } }
      review_eligibility { can_review reason my_review { id } }
    }
  }
}`;

const eventsSchema = z.object({ events: eventItemsSchema });

function eventsQuery(when: "UPCOMING" | "PAST"): string {
  return `{
    events(filter: { when: ${when} }) {
      items { id my_registration { id } review_eligibility { can_review reason } }
    }
  }`;
}

let sequence = 0;

// Glazes with pieces on the shelf, each carrying two option groups, plus one withdrawn piece per glaze.
async function stockShelf(
  prisma: PrismaService,
  glazes: number,
  piecesPerGlaze: number,
): Promise<number[][]> {
  const shelf: number[][] = [];
  for (let g = 0; g < glazes; g += 1) {
    const productIds: number[] = [];
    shelf.push(productIds);
    sequence += 1;
    const glaze = await prisma.glaze.create({
      data: {
        slug: `glaze-${sequence}`,
        name: `Glaze ${sequence}`,
        description: "A glaze for the batching tests",
      },
    });
    await makeProduct(prisma, {
      is_active: false,
      glaze: { connect: { id: glaze.id } },
    });
    for (let p = 0; p < piecesPerGlaze; p += 1) {
      const product = await makeProduct(prisma, {
        stock: 3,
        is_featured: p === 1,
        sales_count: p,
        glaze: { connect: { id: glaze.id } },
      });
      productIds.push(product.id);
      for (const [name, sort] of [
        ["Glaze finish", 2],
        ["Size", 1],
      ] as const) {
        await prisma.productOptionGroup.create({
          data: {
            product_id: product.id,
            name,
            sort_order: sort,
            options: {
              create: [
                { name: "Large", sort_order: 2 },
                { name: "Small", sort_order: 1 },
                { name: "Retired", sort_order: 0, is_active: false },
              ],
            },
          },
        });
      }
    }
  }
  return shelf;
}

describe("nested list fields", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let products: ProductsService;
  let reviews: ReviewsService;
  let events: EventsService;
  const counter = new QueryCounter();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true,
          validationRules: [depthLimitRule(MAX_QUERY_DEPTH)],
          context: ({ req, res }: GqlContext): GqlContext => ({ req, res }),
        }),
      ],
      providers: [
        ...outsideWorld({ prisma: (service) => counter.wrap(service) }),
        { provide: AuthGuard, useClass: ViewerGuard },
        ProductsService,
        WishlistService,
        ReviewsService,
        EventsService,
        ProductsResolver,
        GlazeResolver,
        ProductReviewEligibilityResolver,
        EventsResolver,
        EventReviewEligibilityResolver,
      ],
    })
      .overrideGuard(AuthGuard)
      .useClass(ViewerGuard)
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
    prisma = moduleRef.get(PrismaService);
    products = moduleRef.get(ProductsService);
    reviews = moduleRef.get(ReviewsService);
    events = moduleRef.get(EventsService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await resetData(prisma);
  });

  async function query<T>(
    schema: z.ZodType<T>,
    document: string,
    viewer: TestUser | null,
  ): Promise<{ data: T; queries: number }> {
    counter.reset();
    const response = await postGraphql(
      app,
      document,
      viewer ? { [VIEWER_HEADER]: String(viewer.id) } : {},
    );
    expect(response.body).not.toHaveProperty("errors");
    const body = z.object({ data: schema }).parse(response.body);
    return { data: body.data, queries: counter.calls.length };
  }

  it("loads glazes, their pieces and each piece's fields in a fixed number of queries", async () => {
    const [buyer] = await makeUsers(prisma, 1);
    if (!buyer) throw new Error("no user");
    const [first] = await stockShelf(prisma, 2, 3);
    const [plain, delivered, reviewed] = first ?? [];
    if (plain === undefined || delivered === undefined || !reviewed) {
      throw new Error("no pieces");
    }
    await deliverProduct(prisma, [buyer], delivered);
    await prisma.review.create({
      data: { user_id: buyer.id, product_id: reviewed, rating: 5 },
    });
    await prisma.wishlistItem.create({
      data: { user_id: buyer.id, product_id: reviewed },
    });

    const small = await query(glazesSchema, GLAZES_QUERY, buyer);
    const anonymous = await query(glazesSchema, GLAZES_QUERY, null);
    await stockShelf(prisma, 4, 5);
    const large = await query(glazesSchema, GLAZES_QUERY, buyer);

    // glazes, pieces, option groups, wishlist ids, the viewer's reviews and delivered lines.
    expect(small.queries).toBe(6);
    expect(large.queries).toBe(small.queries);
    // A signed-out visitor needs no wishlist, review or order lookups at all.
    expect(anonymous.queries).toBe(3);
    expect(large.data.glazes.map((glaze) => glaze.pieces.length)).toEqual([
      3, 3, 5, 5, 5, 5,
    ]);
    // Featured first, then best selling; the withdrawn piece stays off.
    expect(small.data.glazes[0]?.pieces.map((piece) => piece.id)).toEqual([
      delivered,
      reviewed,
      plain,
    ]);

    // Same answers, in the same order, as asking the services one row at a time.
    for (const glaze of large.data.glazes) {
      const alone = await products.glazePiecesFor([glaze.id]);
      expect(glaze.pieces.map((piece) => piece.id)).toEqual(
        alone.get(glaze.id)?.map((piece) => piece.id),
      );
      for (const piece of glaze.pieces) {
        const groups = await prisma.productOptionGroup.findMany({
          where: { product_id: piece.id },
          orderBy: { sort_order: "asc" },
          include: {
            options: {
              where: { is_active: true },
              orderBy: { sort_order: "asc" },
            },
          },
        });
        expect(piece.option_groups).toEqual(
          groups.map((group) => ({
            id: group.id,
            options: group.options.map((option) => ({ id: option.id })),
          })),
        );
        const eligibility = await reviews.eligibility(
          { product_id: piece.id },
          buyer.id,
        );
        expect(piece.review_eligibility).toEqual({
          can_review: eligibility.can_review,
          reason: eligibility.reason,
          my_review: eligibility.my_review
            ? { id: eligibility.my_review.id }
            : null,
        });
        expect(piece.in_wishlist).toBe(piece.id === reviewed);
      }
    }
    const pieces = large.data.glazes.flatMap((glaze) => glaze.pieces);
    expect(
      pieces.find((piece) => piece.id === delivered)?.review_eligibility,
    ).toEqual({ can_review: true, reason: null, my_review: null });
    expect(
      pieces.find((piece) => piece.id === reviewed)?.review_eligibility
        .my_review,
    ).not.toBeNull();
    expect(
      anonymous.data.glazes
        .flatMap((glaze) => glaze.pieces)
        .map((piece) => piece.review_eligibility.reason),
    ).toEqual(Array.from({ length: 6 }, () => "Sign in to review"));
  });

  it("loads the visitor's bookings and review rights for every event in a fixed number of queries", async () => {
    const [guest, other] = await makeUsers(prisma, 2);
    if (!guest || !other) throw new Error("no users");

    // The other user books everything; the guest books and attends every other evening.
    const schedule = async (count: number): Promise<void> => {
      for (let index = 0; index < count; index += 1) {
        const upcoming = await makeEvent(prisma, 8);
        const past = await makeEvent(prisma, 8);
        await prisma.event.update({
          where: { id: past.id },
          data: {
            status: EventStatus.COMPLETED,
            starts_at: new Date(Date.now() - 3 * 86_400_000),
            ends_at: new Date(Date.now() - 2 * 86_400_000),
          },
        });
        const bookings: {
          user: TestUser;
          event: { id: number; price: number };
          status: RegistrationStatus;
        }[] = [
          { user: other, event: upcoming, status: RegistrationStatus.PENDING },
          { user: other, event: past, status: RegistrationStatus.CONFIRMED },
        ];
        if (index % 2 === 0) {
          bookings.push(
            {
              user: guest,
              event: upcoming,
              status: RegistrationStatus.APPROVED,
            },
            { user: guest, event: past, status: RegistrationStatus.CONFIRMED },
          );
        }
        for (const booking of bookings) {
          await prisma.eventRegistration.create({
            data: {
              event_id: booking.event.id,
              user_id: booking.user.id,
              unit_price: booking.event.price,
              total: booking.event.price,
              status: booking.status,
            },
          });
        }
      }
    };

    await schedule(2);
    const small = await query(eventsSchema, eventsQuery("UPCOMING"), guest);
    await schedule(4);
    const upcoming = await query(eventsSchema, eventsQuery("UPCOMING"), guest);
    const past = await query(eventsSchema, eventsQuery("PAST"), guest);

    // The list and its count, then one lookup each for bookings, reviews and attended seats.
    expect(small.queries).toBe(5);
    expect(upcoming.queries).toBe(small.queries);
    expect(past.queries).toBe(small.queries);
    expect(upcoming.data.events.items).toHaveLength(6);
    expect(past.data.events.items).toHaveLength(6);

    const items = [...upcoming.data.events.items, ...past.data.events.items];
    for (const item of items) {
      const booking = await events.registrationFor(guest.id, item.id);
      expect(item.my_registration).toEqual(booking ? { id: booking.id } : null);
      const eligibility = await reviews.eligibility(
        { event_id: item.id },
        guest.id,
      );
      expect(item.review_eligibility).toEqual({
        can_review: eligibility.can_review,
        reason: eligibility.reason,
      });
    }
    // Only the guest's own bookings show, never the other user's.
    expect(items.filter((item) => item.my_registration)).toHaveLength(6);
    expect(
      past.data.events.items.filter(
        (item) => item.review_eligibility.can_review,
      ),
    ).toHaveLength(3);
  });
});
