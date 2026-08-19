import { parse } from "graphql";
import { describe, expect, it } from "vitest";

import {
  isIntrospectionDocument,
  shouldRejectIntrospection,
} from "./introspection.plugin";

const INTROSPECTION = parse("query { __schema { types { name } } }");
const TYPE_LOOKUP = parse('query { __type(name: "User") { name } }');
const REGULAR = parse("query { me { id email } }");
const HIDDEN_IN_FRAGMENT = parse(
  "query { ...meta } fragment meta on Query { __schema { types { name } } }",
);

describe("isIntrospectionDocument", () => {
  it("detects __schema and __type selections", () => {
    expect(isIntrospectionDocument(INTROSPECTION)).toBe(true);
    expect(isIntrospectionDocument(TYPE_LOOKUP)).toBe(true);
    expect(isIntrospectionDocument(HIDDEN_IN_FRAGMENT)).toBe(true);
  });

  it("passes regular operations", () => {
    expect(isIntrospectionDocument(REGULAR)).toBe(false);
  });
});

describe("shouldRejectIntrospection", () => {
  const base = { expectedKey: "secret", document: INTROSPECTION };

  it("allows everything outside production", () => {
    expect(
      shouldRejectIntrospection({
        ...base,
        isProduction: false,
        providedKey: undefined,
      }),
    ).toBe(false);
  });

  it("allows regular queries in production without a key", () => {
    expect(
      shouldRejectIntrospection({
        isProduction: true,
        document: REGULAR,
        providedKey: undefined,
        expectedKey: "secret",
      }),
    ).toBe(false);
  });

  it("rejects production introspection with a missing or wrong key", () => {
    expect(
      shouldRejectIntrospection({
        ...base,
        isProduction: true,
        providedKey: undefined,
      }),
    ).toBe(true);
    expect(
      shouldRejectIntrospection({
        ...base,
        isProduction: true,
        providedKey: "wrong",
      }),
    ).toBe(true);
  });

  it("allows production introspection with the right key", () => {
    expect(
      shouldRejectIntrospection({
        ...base,
        isProduction: true,
        providedKey: "secret",
      }),
    ).toBe(false);
  });
});
