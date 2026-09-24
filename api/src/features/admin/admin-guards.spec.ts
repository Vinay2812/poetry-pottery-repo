import { GUARDS_METADATA } from "@nestjs/common/constants";
import { describe, expect, it } from "vitest";

import { AdminGuard } from "@/common/guards/admin.guard";
import * as resolvers from "@/resolvers";
import {
  type ClassRef,
  namesOf,
  providedResolvers,
} from "@test/helpers/nest-modules";
import { AdminModule } from "./admin.module";

// Every console resolver is named Admin*; the first test proves that rule matches AdminModule exactly.
const RESOLVERS = Object.entries(resolvers).filter(([name]) =>
  name.startsWith("Admin"),
);

function fieldsOf(resolver: ClassRef): string[] {
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
  it("covers every resolver the admin module provides, and only those", async () => {
    // AdminModule's own sub-modules; below them sit the storefront modules they reuse.
    const provided = await providedResolvers(AdminModule, 1);

    expect(namesOf(RESOLVERS.map(([, resolver]) => resolver))).toEqual(
      namesOf(provided),
    );
  });

  for (const [name, resolver] of RESOLVERS) {
    it(`keeps every field of ${name} behind the administrator guard`, () => {
      const fields = fieldsOf(resolver);

      expect(fields.length).toBeGreaterThan(0);
      for (const field of fields) {
        expect(guardsOn(resolver.prototype, field)).toEqual([AdminGuard]);
      }
    });
  }
});
