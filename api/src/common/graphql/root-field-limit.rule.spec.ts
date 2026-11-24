import { buildSchema, getIntrospectionQuery, parse, validate } from "graphql";
import { describe, expect, it } from "vitest";

import { rootFieldLimitRule } from "./root-field-limit.rule";

const schema = buildSchema(`
  type Product { id: Int! }
  type Query { products: [Product!]!, product(slug: String!): Product }
`);

function errorsFor(query: string, max: number): string[] {
  return validate(schema, parse(query), [rootFieldLimitRule(max)]).map(
    (error) => error.message,
  );
}

describe("rootFieldLimitRule", () => {
  it("accepts an operation at the limit", () => {
    expect(
      errorsFor('{ products { id } product(slug: "a") { id } }', 2),
    ).toEqual([]);
  });

  it("counts every alias of the same field", () => {
    const query = `{ a: products { id } b: products { id } c: products { id } }`;
    expect(errorsFor(query, 2)).toEqual([
      "Operation asks for 3 root fields; the limit is 2",
    ]);
  });

  it("counts root fields spread through named and inline fragments", () => {
    const query = `
      query { ...Q ... on Query { c: products { id } } }
      fragment Q on Query { a: products { id } b: products { id } }
    `;
    expect(errorsFor(query, 2)).toEqual([
      "Operation asks for 3 root fields; the limit is 2",
    ]);
  });

  it("leaves __typename and introspection alone", () => {
    expect(errorsFor("{ __typename products { id } }", 1)).toEqual([]);
    expect(errorsFor(getIntrospectionQuery(), 1)).toEqual([]);
  });
});
