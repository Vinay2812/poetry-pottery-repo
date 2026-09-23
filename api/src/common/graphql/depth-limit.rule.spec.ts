import { buildSchema, getIntrospectionQuery, parse, validate } from "graphql";
import { describe, expect, it } from "vitest";

import { depthLimitRule } from "./depth-limit.rule";

const schema = buildSchema(`
  type Glaze { id: Int!, pieces: [Product!]! }
  type Product { id: Int!, glaze: Glaze }
  type Query { glazes: [Glaze!]! }
`);

function errorsFor(query: string, max: number): string[] {
  return validate(schema, parse(query), [depthLimitRule(max)]).map(
    (error) => error.message,
  );
}

describe("depthLimitRule", () => {
  it("accepts a query at the limit", () => {
    expect(errorsFor("{ glazes { pieces { id } } }", 3)).toEqual([]);
  });

  it("rejects a query that recurses past the limit", () => {
    expect(
      errorsFor("{ glazes { pieces { glaze { pieces { id } } } } }", 3),
    ).toEqual(["Query is nested 5 levels deep; the limit is 3"]);
  });

  it("counts depth through named and inline fragments", () => {
    const query = `
      query { glazes { ...G } }
      fragment G on Glaze { pieces { ... on Product { glaze { id } } } }
    `;
    expect(errorsFor(query, 3)).toEqual([
      "Query is nested 4 levels deep; the limit is 3",
    ]);
  });

  it("leaves introspection alone", () => {
    expect(errorsFor(getIntrospectionQuery(), 3)).toEqual([]);
  });
});
