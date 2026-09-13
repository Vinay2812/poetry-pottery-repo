import { fileURLToPath } from "node:url";

import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

// DATABASE_URL is deliberately absent: test/integration/run.ts points it at a throwaway database.
export default defineConfig({
  plugins: [swc.vite({ module: { type: "es6" } })],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@test": fileURLToPath(new URL("./test", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["test/integration/**/*.integration-spec.ts"],
    // Every file shares the one sandbox database and truncates between tests.
    fileParallelism: false,
    sequence: { concurrent: false },
    testTimeout: 60_000,
    hookTimeout: 60_000,
    env: {
      NODE_ENV: "test",
      REDIS_URL: "redis://localhost:6381",
      RABBITMQ_URL: "amqp://poetry:poetry@localhost:5672",
      QUEUE_CONSUMERS_ENABLED: "false",
      CLERK_PUBLISHABLE_KEY: "pk_test_Y2xlcmsuZXhhbXBsZS5jb20k",
      CLERK_SECRET_KEY: "sk_test_placeholder",
      SCHEMA_SYNC_KEY: "test-schema-key",
    },
  },
});
