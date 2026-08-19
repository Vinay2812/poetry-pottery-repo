import { existsSync } from "node:fs";
import { resolve } from "node:path";

import type { CodegenConfig } from "@graphql-codegen/cli";

// Codegen runs outside Next, so load its env files here. Earlier files win.
for (const file of [".env.local", ".env"]) {
  const path = resolve(process.cwd(), file);
  if (existsSync(path)) {
    process.loadEnvFile(path);
  }
}

// http(s) URLs introspect the protected endpoint; anything else is a schema file path
// (the pre-push hook uses ../api/schema.gql so pushes never need a running server).
const schemaUrl = process.env.SCHEMA_URL ?? "http://localhost:6060/graphql";
const schemaPointer = schemaUrl.startsWith("http")
  ? {
      [schemaUrl]: {
        headers: { "x-schema-key": process.env.SCHEMA_SYNC_KEY ?? "" },
      },
    }
  : schemaUrl;

const sharedConfig = {
  scalars: { DateTime: "string" },
  useTypeImports: true,
  dedupeOperationSuffix: true,
  // URL introspection and the schema file disagree on descriptions; dropping
  // them keeps the generated output byte-identical from either source.
  disableDescriptions: true,
};

const config: CodegenConfig = {
  schema: [schemaPointer],
  documents: ["src/graphql/**/*.{gql,graphql}"],
  ignoreNoDocuments: false,
  generates: {
    "src/graphql/generated/graphql.tsx": {
      plugins: [
        { typescript: sharedConfig },
        {
          "typescript-operations": {
            ...sharedConfig,
            // Suppresses the duplicate enum/input declarations this plugin would
            // otherwise emit alongside the `typescript` plugin in the same file.
            // An empty namespace keeps references unprefixed and adds no import.
            importSchemaTypesFrom: "same-file",
            namespacedImportName: "",
          },
        },
        {
          "typescript-react-apollo": {
            ...sharedConfig,
            withHooks: true,
            withComponent: false,
            withHOC: false,
            // Apollo Client v4 serves its React bindings from a subpath export.
            apolloReactCommonImportFrom: "@apollo/client/react",
            apolloReactHooksImportFrom: "@apollo/client/react",
          },
        },
      ],
    },
  },
};

export default config;
