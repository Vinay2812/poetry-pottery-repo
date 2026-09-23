import type {
  ApolloServerPlugin,
  GraphQLRequestContextDidEncounterErrors,
  GraphQLRequestContextDidResolveOperation,
  GraphQLRequestContextWillSendResponse,
} from "@apollo/server";
import type { Logger } from "winston";

import type { GqlContext } from "@/common/types/express";

const INTROSPECTION_OPERATION = "IntrospectionQuery";
export const SLOW_OPERATION_MS = 1000;

// Names each operation for the access log, logs variables at debug (redacted by the log format),
// flags slow operations, and reports request-level errors. Resolver errors carry a path and are
// logged once by the exception filter.
export function createGraphqlLoggingPlugin(
  logger: Logger,
): ApolloServerPlugin<GqlContext> {
  return {
    requestDidStart: () => {
      const startedAt = Date.now();
      let label = "anonymous";
      let isIntrospection = false;

      return Promise.resolve({
        didResolveOperation(
          ctx: GraphQLRequestContextDidResolveOperation<GqlContext>,
        ): Promise<void> {
          const name =
            ctx.operationName ?? ctx.operation?.name?.value ?? "anonymous";
          label = `${ctx.operation?.operation ?? "unknown"} ${name}`;
          isIntrospection = name === INTROSPECTION_OPERATION;
          if (!isIntrospection) {
            ctx.contextValue.req.graphqlOperation = label;
            logger.debug(`graphql ${label}`, {
              requestId: ctx.contextValue.req.requestId,
              variables: ctx.request.variables,
            });
          }
          return Promise.resolve();
        },

        willSendResponse(
          ctx: GraphQLRequestContextWillSendResponse<GqlContext>,
        ): Promise<void> {
          const durationMs = Date.now() - startedAt;
          if (!isIntrospection && durationMs >= SLOW_OPERATION_MS) {
            logger.warn(`slow graphql ${label} ${durationMs}ms`, {
              requestId: ctx.contextValue.req.requestId,
              userId: ctx.contextValue.req.authenticatedUser?.db_user_id,
              durationMs,
            });
          }
          return Promise.resolve();
        },

        didEncounterErrors(
          ctx: GraphQLRequestContextDidEncounterErrors<GqlContext>,
        ): Promise<void> {
          const requestLevel = ctx.errors.filter((error) => !error.path);
          if (requestLevel.length > 0) {
            logger.warn(`graphql request rejected: ${label}`, {
              requestId: ctx.contextValue.req.requestId,
              errors: requestLevel.map((error) => {
                const code = error.extensions?.code;
                return typeof code === "string"
                  ? `${code}: ${error.message}`
                  : error.message;
              }),
            });
          }
          return Promise.resolve();
        },
      });
    },
  };
}
