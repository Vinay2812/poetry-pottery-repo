import type {
  ApolloServerPlugin,
  GraphQLRequestContextDidEncounterErrors,
  GraphQLRequestContextDidResolveOperation,
  GraphQLRequestContextWillSendResponse,
} from "@apollo/server";
import type { Logger } from "winston";

import type { GqlContext } from "@/common/types/express";
import { env } from "@/config/env";

const INTROSPECTION_OPERATION = "IntrospectionQuery";

type GraphqlResponse =
  GraphQLRequestContextWillSendResponse<GqlContext>["response"];

// The actual graphql payload (data + errors); incremental (@defer) responses stay opaque.
function extractPayload(response: GraphqlResponse) {
  return response.body.kind === "single"
    ? response.body.singleResult
    : undefined;
}

function countErrors(response: GraphqlResponse): number {
  return extractPayload(response)?.errors?.length ?? 0;
}

// One line per operation on the way in and one on the way out (duration + error count).
// Variables are logged outside production only; introspection polling is skipped.
export function createGraphqlLoggingPlugin(
  logger: Logger,
): ApolloServerPlugin<GqlContext> {
  return {
    requestDidStart: () => {
      const startedAt = Date.now();
      let operation = "anonymous";
      let operationType = "unknown";

      return Promise.resolve({
        didResolveOperation(
          ctx: GraphQLRequestContextDidResolveOperation<GqlContext>,
        ): Promise<void> {
          operation =
            ctx.operationName ?? ctx.operation?.name?.value ?? "anonymous";
          operationType = ctx.operation?.operation ?? "unknown";
          if (operation !== INTROSPECTION_OPERATION) {
            logger.info(`graphql:in ${operationType} ${operation}`, {
              requestId: ctx.contextValue.req.requestId,
              ...(env.isProduction ? {} : { variables: ctx.request.variables }),
            });
          }
          return Promise.resolve();
        },

        willSendResponse(
          ctx: GraphQLRequestContextWillSendResponse<GqlContext>,
        ): Promise<void> {
          if (operation !== INTROSPECTION_OPERATION) {
            logger.info(`graphql:out ${operationType} ${operation}`, {
              requestId: ctx.contextValue.req.requestId,
              userId: ctx.contextValue.req.authenticatedUser?.db_user_id,
              durationMs: Date.now() - startedAt,
              errorCount: countErrors(ctx.response),
              ...(env.isProduction
                ? {}
                : { response: extractPayload(ctx.response) }),
            });
          }
          return Promise.resolve();
        },

        didEncounterErrors(
          ctx: GraphQLRequestContextDidEncounterErrors<GqlContext>,
        ): Promise<void> {
          logger.warn(`graphql:errors ${operationType} ${operation}`, {
            requestId: ctx.contextValue.req.requestId,
            errors: ctx.errors.map((error) => error.message),
          });
          return Promise.resolve();
        },
      });
    },
  };
}
