import { z } from "zod";

import { loadDotEnv } from "./dotenv";

loadDotEnv();

const logLevels = [
  "error",
  "warn",
  "info",
  "http",
  "verbose",
  "debug",
  "silly",
] as const;

const csv = (fallback: string) =>
  z
    .string()
    .default(fallback)
    .transform((value) =>
      value
        .split(",")
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0),
    );

const port = (fallback: number) =>
  z.coerce.number().int().positive().max(65535).default(fallback);

const count = (fallback: number) =>
  z.coerce.number().int().positive().default(fallback);

export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: port(5050),
  DATABASE_URL: z.url(),
  CORS_ORIGINS: csv("http://localhost:3005"),
  LOG_LEVEL: z.enum(logLevels).optional(),
  CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  SCHEMA_SYNC_KEY: z.string().min(1),
  THROTTLE_DEFAULT_LIMIT: count(100),
  THROTTLE_DEFAULT_TTL_MS: count(60_000),
  THROTTLE_SHORT_LIMIT: count(10),
  THROTTLE_SHORT_TTL_MS: count(1_000),
  THROTTLE_STRICT_LIMIT: count(5),
  THROTTLE_STRICT_TTL_MS: count(60_000),
  // An empty value in .env means "disabled" rather than "invalid url".
  SENTRY_DSN: z
    .union([z.url(), z.literal("")])
    .optional()
    .transform((value) =>
      value === undefined || value === "" ? undefined : value,
    ),
});

export type RawEnv = z.infer<typeof envSchema>;

export type Env = Omit<RawEnv, "LOG_LEVEL"> & {
  LOG_LEVEL: (typeof logLevels)[number];
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
};

export function buildEnv(source: unknown): Env {
  const raw = envSchema.parse(source);
  return {
    ...raw,
    LOG_LEVEL:
      raw.LOG_LEVEL ?? (raw.NODE_ENV === "production" ? "info" : "debug"),
    isProduction: raw.NODE_ENV === "production",
    isDevelopment: raw.NODE_ENV === "development",
    isTest: raw.NODE_ENV === "test",
  };
}

function loadEnv(): Env {
  try {
    return buildEnv(process.env);
  } catch (error) {
    if (!(error instanceof z.ZodError)) {
      throw error;
    }
    const lines = error.issues.map((issue) => {
      const name = issue.path.join(".") || "(root)";
      return `  - ${name}: ${issue.message}`;
    });
    process.stderr.write(
      `Invalid environment configuration:\n${lines.join("\n")}\n`,
    );
    return process.exit(1);
  }
}

export const env: Env = loadEnv();
