import { defineConfig, env } from "prisma/config";

import { loadDotEnv } from "./src/config/dotenv";

// Prisma 7 no longer loads .env implicitly.
loadDotEnv();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: env("DATABASE_URL") },
});
