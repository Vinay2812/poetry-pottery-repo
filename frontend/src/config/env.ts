import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";

const logLevelSchema = z.enum(["error", "warn", "info", "debug"]);

export type LogLevel = z.infer<typeof logLevelSchema>;

const clientSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url().default("http://localhost:5050/graphql"),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(1, "must be a Clerk publishable key"),
  NEXT_PUBLIC_LOG_LEVEL: logLevelSchema.default(
    isProduction ? "warn" : "debug",
  ),
});

const serverSchema = z.object({
  CLERK_SECRET_KEY: z.string().min(1, "must be a Clerk secret key"),
  LOG_LEVEL: logLevelSchema.default(isProduction ? "info" : "debug"),
});

export type ClientEnv = z.infer<typeof clientSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;

function format(scope: string, error: z.ZodError): string {
  const lines = error.issues.map((issue) => {
    const key = issue.path.join(".") || "(root)";
    return `  - ${key}: ${issue.message}`;
  });

  return [
    `Invalid ${scope} environment configuration:`,
    ...lines,
    "",
    "Check your .env.local against .env.example.",
  ].join("\n");
}

function parse<S extends z.ZodType>(
  scope: string,
  schema: S,
  source: unknown,
): z.infer<S> {
  const result = schema.safeParse(source);

  if (!result.success) {
    throw new Error(format(scope, result.error));
  }

  return result.data;
}

// Static references so Next.js can inline these into the client bundle.
export const clientEnv: ClientEnv = parse("client", clientSchema, {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
});

let cachedServerEnv: ServerEnv | undefined;

/** Server-only env. Throws if reached from the browser. */
export function getServerEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error("getServerEnv() must not be called in the browser.");
  }

  cachedServerEnv ??= parse("server", serverSchema, {
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    LOG_LEVEL: process.env.LOG_LEVEL,
  });

  return cachedServerEnv;
}
