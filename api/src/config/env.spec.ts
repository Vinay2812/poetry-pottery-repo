import { describe, expect, it } from "vitest";

import { buildEnv, env, envSchema } from "./env";

const validSource = {
  DATABASE_URL:
    "postgresql://boilerplate:boilerplate@localhost:5433/boilerplate",
  CLERK_PUBLISHABLE_KEY: "pk_test_key",
  CLERK_SECRET_KEY: "sk_test_key",
  SCHEMA_SYNC_KEY: "test-schema-key",
};

describe("envSchema", () => {
  it("applies documented defaults", () => {
    const parsed = envSchema.parse(validSource);

    expect(parsed.NODE_ENV).toBe("development");
    expect(parsed.PORT).toBe(5050);
    expect(parsed.CORS_ORIGINS).toEqual(["http://localhost:3005"]);
    expect(parsed.THROTTLE_DEFAULT_LIMIT).toBe(100);
    expect(parsed.THROTTLE_SHORT_TTL_MS).toBe(1000);
    expect(parsed.THROTTLE_STRICT_LIMIT).toBe(5);
    expect(parsed.SENTRY_DSN).toBeUndefined();
  });

  it("splits CORS_ORIGINS on commas", () => {
    const parsed = envSchema.parse({
      ...validSource,
      CORS_ORIGINS: "http://a.test, http://b.test ,",
    });

    expect(parsed.CORS_ORIGINS).toEqual(["http://a.test", "http://b.test"]);
  });

  it("treats an empty SENTRY_DSN as disabled", () => {
    expect(
      envSchema.parse({ ...validSource, SENTRY_DSN: "" }).SENTRY_DSN,
    ).toBeUndefined();
  });

  it("rejects a missing DATABASE_URL", () => {
    const result = envSchema.safeParse({
      CLERK_PUBLISHABLE_KEY: "pk",
      CLERK_SECRET_KEY: "sk",
    });

    if (result.success) {
      throw new Error("expected the parse to fail");
    }
    expect(result.error.issues.map((issue) => issue.path.join("."))).toContain(
      "DATABASE_URL",
    );
  });

  it("rejects a non-url DATABASE_URL", () => {
    expect(
      envSchema.safeParse({ ...validSource, DATABASE_URL: "not-a-url" })
        .success,
    ).toBe(false);
  });

  it("rejects unknown enum values and non-numeric ports", () => {
    expect(
      envSchema.safeParse({ ...validSource, NODE_ENV: "staging" }).success,
    ).toBe(false);
    expect(envSchema.safeParse({ ...validSource, PORT: "abc" }).success).toBe(
      false,
    );
    expect(
      envSchema.safeParse({ ...validSource, LOG_LEVEL: "loud" }).success,
    ).toBe(false);
    expect(
      envSchema.safeParse({ ...validSource, THROTTLE_SHORT_LIMIT: "0" })
        .success,
    ).toBe(false);
  });
});

describe("buildEnv", () => {
  it("derives LOG_LEVEL per environment", () => {
    expect(buildEnv(validSource).LOG_LEVEL).toBe("debug");
    expect(buildEnv({ ...validSource, NODE_ENV: "production" }).LOG_LEVEL).toBe(
      "info",
    );
    expect(
      buildEnv({ ...validSource, NODE_ENV: "production", LOG_LEVEL: "warn" })
        .LOG_LEVEL,
    ).toBe("warn");
  });

  it("exposes environment flags", () => {
    const production = buildEnv({ ...validSource, NODE_ENV: "production" });

    expect(production.isProduction).toBe(true);
    expect(production.isDevelopment).toBe(false);
    expect(production.isTest).toBe(false);
  });

  it("throws on invalid input", () => {
    expect(() => buildEnv({})).toThrow();
  });
});

describe("env", () => {
  it("is loaded for the test environment", () => {
    expect(env.NODE_ENV).toBe("test");
    expect(env.isTest).toBe(true);
  });
});
