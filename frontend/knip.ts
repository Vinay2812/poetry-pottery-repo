import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: [
    // Standalone CLI tool: measures rendered component sizes across breakpoints.
    "scripts/measure-responsive.mjs!",
    // Public RSC Apollo client for server-side data fetching in new pages.
    "src/lib/apollo/rsc-client.ts!",
    // Feature barrels are each feature's public API.
    "src/features/*/index.ts!",
  ],
  ignore: [
    // Vendored shadcn primitives; kept complete for future components.
    "src/components/ui/**",
    // Referenced by next.config.ts turbopack.resolveAlias, not by an import.
    "src/lib/logger/winston-browser-stub.ts",
  ],
};

export default config;
