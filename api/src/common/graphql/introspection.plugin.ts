import type { ApolloServerPlugin } from "@apollo/server";
import { type DocumentNode, GraphQLError, visit } from "graphql";

import type { GqlContext } from "@/common/types/express";
import { env } from "@/config/env";

export const SCHEMA_KEY_HEADER = "x-schema-key";

export function isIntrospectionDocument(document: DocumentNode): boolean {
  let found = false;
  visit(document, {
    Field(node) {
      if (node.name.value === "__schema" || node.name.value === "__type") {
        found = true;
      }
    },
  });
  return found;
}

export function shouldRejectIntrospection(params: {
  isProduction: boolean;
  document: DocumentNode;
  providedKey: string | undefined;
  expectedKey: string;
}): boolean {
  if (!params.isProduction || !isIntrospectionDocument(params.document)) {
    return false;
  }
  return params.providedKey !== params.expectedKey;
}

// Introspection stays open outside production (Apollo Sandbox needs it);
// production only serves it to callers presenting the schema sync key.
export function createIntrospectionGuard(): ApolloServerPlugin<GqlContext> {
  return {
    requestDidStart: () =>
      Promise.resolve({
        didResolveOperation({
          document,
          contextValue,
        }: {
          document: DocumentNode;
          contextValue: GqlContext;
        }): Promise<void> {
          const raw = contextValue.req.headers[SCHEMA_KEY_HEADER];
          const providedKey = Array.isArray(raw) ? raw[0] : raw;
          if (
            shouldRejectIntrospection({
              isProduction: env.isProduction,
              document,
              providedKey,
              expectedKey: env.SCHEMA_SYNC_KEY,
            })
          ) {
            throw new GraphQLError(
              "Introspection requires a valid schema key",
              { extensions: { code: "FORBIDDEN" } },
            );
          }
          return Promise.resolve();
        },
      }),
  };
}
