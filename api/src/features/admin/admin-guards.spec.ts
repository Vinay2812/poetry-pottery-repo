import { GUARDS_METADATA } from "@nestjs/common/constants";
import { describe, expect, it } from "vitest";

import { AdminGuard } from "@/common/guards/admin.guard";
import { AdminCatalogResolver } from "./catalog/catalog.resolver";
import { AdminContentResolver } from "./content/content.resolver";
import { AdminCouponsResolver } from "./coupons/coupons.resolver";
import { AdminDashboardResolver } from "./dashboard/dashboard.resolver";
import { AdminEventsResolver } from "./events/events.resolver";
import { AdminGlazesResolver } from "./glazes/glazes.resolver";
import { AdminInboxResolver } from "./inbox/inbox.resolver";
import { AdminOrdersResolver } from "./orders/orders.resolver";
import { AdminProductsResolver } from "./products/products.resolver";
import { AdminReviewsResolver } from "./reviews/reviews.resolver";
import { AdminUploadsResolver } from "./uploads/uploads.resolver";
import { AdminUsersResolver } from "./users/users.resolver";
import { AdminWorkshopsResolver } from "./workshops/workshops.resolver";

const RESOLVERS = {
  AdminCatalogResolver,
  AdminContentResolver,
  AdminCouponsResolver,
  AdminDashboardResolver,
  AdminEventsResolver,
  AdminGlazesResolver,
  AdminInboxResolver,
  AdminOrdersResolver,
  AdminProductsResolver,
  AdminReviewsResolver,
  AdminUploadsResolver,
  AdminUsersResolver,
  AdminWorkshopsResolver,
};

function fieldsOf(resolver: new (...args: never[]) => object): string[] {
  return Object.getOwnPropertyNames(resolver.prototype).filter(
    (name) => name !== "constructor",
  );
}

function guardsOn(prototype: object, field: string): unknown[] {
  const handler: unknown = Object.getOwnPropertyDescriptor(
    prototype,
    field,
  )?.value;
  if (typeof handler !== "function") {
    throw new Error(`${field} is not a resolver field`);
  }
  const guards: unknown = Reflect.getMetadata(GUARDS_METADATA, handler);
  return Array.isArray(guards) ? (guards as unknown[]) : [];
}

// A new console field that forgets @AdminRequired() would otherwise ship open to anyone.
describe("admin resolver guards", () => {
  for (const [name, resolver] of Object.entries(RESOLVERS)) {
    it(`keeps every field of ${name} behind the administrator guard`, () => {
      const fields = fieldsOf(resolver);

      expect(fields.length).toBeGreaterThan(0);
      for (const field of fields) {
        expect(guardsOn(resolver.prototype, field)).toEqual([AdminGuard]);
      }
    });
  }
});
