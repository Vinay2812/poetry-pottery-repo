import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";

import { Client } from "pg";

import { loadDotEnv } from "@/config/dotenv";

loadDotEnv();

// A whole database rather than a schema: pgvector is installed per database, so the init
// migration's `vector(384)` columns cannot be created inside a second schema of the dev database.
const sandbox = `it_${randomBytes(6).toString("hex")}`;

function sandboxUrl(base: string): string {
  const url = new URL(base);
  url.pathname = `/${sandbox}`;
  return url.toString();
}

function run(command: string, args: string[], databaseUrl: string): void {
  execFileSync(`node_modules/.bin/${command}`, args, {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
}

async function withAdmin(base: string, statement: string): Promise<void> {
  const client = new Client({ connectionString: base });
  await client.connect();
  try {
    await client.query(statement);
  } finally {
    await client.end();
  }
}

async function main(): Promise<void> {
  const base = process.env.DATABASE_URL;
  if (!base) {
    throw new Error("DATABASE_URL must point at the compose Postgres");
  }
  const url = sandboxUrl(base);
  await withAdmin(base, `CREATE DATABASE "${sandbox}"`);
  try {
    run("prisma", ["migrate", "deploy"], url);
    run(
      "vitest",
      [
        "run",
        "--config",
        "vitest.integration.config.mts",
        ...process.argv.slice(2),
      ],
      url,
    );
  } finally {
    await withAdmin(base, `DROP DATABASE IF EXISTS "${sandbox}" WITH (FORCE)`);
  }
}

main().catch((error: unknown) => {
  if (error instanceof Error && !("status" in error)) {
    process.stderr.write(`${error.message}\n`);
  }
  process.exit(1);
});
