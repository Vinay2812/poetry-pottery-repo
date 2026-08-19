import { fileURLToPath } from "node:url";

import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // swc keeps legacy decorators + design:paramtypes metadata that Nest DI relies on.
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
    include: ["src/**/*.spec.ts", "test/**/*.e2e-spec.ts"],
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://boilerplate:boilerplate@localhost:5433/boilerplate",
      CLERK_PUBLISHABLE_KEY: "pk_test_Y2xlcmsuZXhhbXBsZS5jb20k",
      CLERK_SECRET_KEY: "sk_test_placeholder",
      SCHEMA_SYNC_KEY: "test-schema-key",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.spec.ts", "src/main.ts", "src/instrument.ts"],
    },
  },
});
