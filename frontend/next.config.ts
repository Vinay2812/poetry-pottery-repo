import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Keeps winston resolved by Node at runtime instead of bundled.
  serverExternalPackages: ["winston"],
  turbopack: {
    resolveAlias: {
      winston: { browser: "./src/lib/logger/winston-browser-stub.ts" },
    },
  },
};

export default nextConfig;
