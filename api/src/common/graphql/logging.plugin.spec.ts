import type {
  GraphQLRequestContext,
  GraphQLRequestContextDidEncounterErrors,
  GraphQLRequestContextDidResolveOperation,
  GraphQLRequestContextWillSendResponse,
  GraphQLRequestListener,
} from "@apollo/server";
import type { Logger } from "winston";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AppRequest, GqlContext } from "@/common/types/express";
import {
  createGraphqlLoggingPlugin,
  SLOW_OPERATION_MS,
} from "./logging.plugin";

const loggerMock = { debug: vi.fn(), warn: vi.fn() };
const logger = loggerMock as unknown as Logger;

function makeRequest(): AppRequest {
  return {
    requestId: "req-1",
    authenticatedUser: { db_user_id: 7 },
  } as unknown as AppRequest;
}

function resolveContext(
  req: AppRequest,
  operationName = "Categories",
): GraphQLRequestContextDidResolveOperation<GqlContext> {
  return {
    operationName,
    operation: { operation: "query", name: { value: operationName } },
    request: { variables: { page: 2 } },
    contextValue: { req },
  } as unknown as GraphQLRequestContextDidResolveOperation<GqlContext>;
}

function responseContext(
  req: AppRequest,
): GraphQLRequestContextWillSendResponse<GqlContext> {
  return {
    contextValue: { req },
  } as unknown as GraphQLRequestContextWillSendResponse<GqlContext>;
}

async function startListener(): Promise<GraphQLRequestListener<GqlContext>> {
  const listener = await createGraphqlLoggingPlugin(logger).requestDidStart?.(
    {} as GraphQLRequestContext<GqlContext>,
  );
  if (!listener) throw new Error("requestDidStart returned no listener");
  return listener;
}

describe("createGraphqlLoggingPlugin", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers({ toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("names the operation for the access log and keeps variables at debug", async () => {
    const req = makeRequest();
    const listener = await startListener();

    await listener.didResolveOperation?.(resolveContext(req));

    expect(req.graphqlOperation).toBe("query Categories");
    expect(loggerMock.debug).toHaveBeenCalledWith("graphql query Categories", {
      requestId: "req-1",
      variables: { page: 2 },
    });
  });

  it("stays quiet on a fast operation and warns on a slow one", async () => {
    const req = makeRequest();
    const fast = await startListener();
    await fast.didResolveOperation?.(resolveContext(req));
    await fast.willSendResponse?.(responseContext(req));
    expect(loggerMock.warn).not.toHaveBeenCalled();

    const slow = await startListener();
    await slow.didResolveOperation?.(resolveContext(req));
    vi.advanceTimersByTime(SLOW_OPERATION_MS);
    await slow.willSendResponse?.(responseContext(req));
    expect(loggerMock.warn).toHaveBeenCalledWith(
      `slow graphql query Categories ${SLOW_OPERATION_MS}ms`,
      { requestId: "req-1", userId: 7, durationMs: SLOW_OPERATION_MS },
    );
  });

  it("skips introspection polling entirely", async () => {
    const req = makeRequest();
    const listener = await startListener();

    await listener.didResolveOperation?.(
      resolveContext(req, "IntrospectionQuery"),
    );

    expect(req.graphqlOperation).toBeUndefined();
    expect(loggerMock.debug).not.toHaveBeenCalled();
  });

  it("reports request-level errors and leaves resolver errors to the exception filter", async () => {
    const req = makeRequest();
    const listener = await startListener();
    await listener.didResolveOperation?.(resolveContext(req));

    await listener.didEncounterErrors?.({
      contextValue: { req },
      errors: [
        {
          message: "Query is nested 9 levels deep",
          extensions: { code: "GRAPHQL_VALIDATION_FAILED" },
        },
        { message: "Your cart is empty", path: ["placeOrder"] },
      ],
    } as unknown as GraphQLRequestContextDidEncounterErrors<GqlContext>);

    expect(loggerMock.warn).toHaveBeenCalledWith(
      "graphql request rejected: query Categories",
      {
        requestId: "req-1",
        errors: ["GRAPHQL_VALIDATION_FAILED: Query is nested 9 levels deep"],
      },
    );
  });
});
