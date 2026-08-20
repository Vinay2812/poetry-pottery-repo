import type {
  GraphQLRequestContext,
  GraphQLRequestContextDidEncounterErrors,
  GraphQLRequestContextDidResolveOperation,
  GraphQLRequestContextWillSendResponse,
  GraphQLRequestListener,
} from "@apollo/server";
import type { Logger } from "winston";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { GqlContext } from "@/common/types/express";
import { createGraphqlLoggingPlugin } from "./logging.plugin";

const loggerMock = { info: vi.fn(), warn: vi.fn() };
const logger = loggerMock as unknown as Logger;

function makeResolveContext(overrides: {
  operationName?: string | null;
  variables?: Record<string, number>;
}): GraphQLRequestContextDidResolveOperation<GqlContext> {
  return {
    operationName: overrides.operationName ?? "Categories",
    operation: {
      operation: "query",
      name: { value: overrides.operationName ?? "Categories" },
    },
    request: { variables: overrides.variables },
    contextValue: { req: { requestId: "req-1" } },
  } as unknown as GraphQLRequestContextDidResolveOperation<GqlContext>;
}

function makeResponseContext(errorCount: number) {
  return {
    contextValue: {
      req: { requestId: "req-1", authenticatedUser: { db_user_id: 7 } },
    },
    response: {
      body: {
        kind: "single",
        singleResult: {
          data: { categories: ["Mugs"] },
          ...(errorCount > 0
            ? { errors: Array.from({ length: errorCount }, () => ({})) }
            : {}),
        },
      },
    },
  } as unknown as GraphQLRequestContextWillSendResponse<GqlContext>;
}

async function startListener(): Promise<GraphQLRequestListener<GqlContext>> {
  const plugin = createGraphqlLoggingPlugin(logger);
  const listener = await plugin.requestDidStart?.(
    {} as GraphQLRequestContext<GqlContext>,
  );
  if (!listener) {
    throw new Error("requestDidStart returned no listener");
  }
  return listener;
}

describe("createGraphqlLoggingPlugin", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("logs the incoming operation with its variables", async () => {
    const listener = await startListener();

    await listener.didResolveOperation?.(
      makeResolveContext({ variables: { page: 2 } }),
    );

    expect(loggerMock.info).toHaveBeenCalledWith(
      "graphql:in query Categories",
      {
        requestId: "req-1",
        variables: { page: 2 },
      },
    );
  });

  it("logs the outgoing response with duration, user and error count", async () => {
    const listener = await startListener();
    await listener.didResolveOperation?.(makeResolveContext({}));
    loggerMock.info.mockClear();

    await listener.willSendResponse?.(makeResponseContext(2));

    expect(loggerMock.info).toHaveBeenCalledWith(
      "graphql:out query Categories",
      expect.objectContaining({
        requestId: "req-1",
        userId: 7,
        errorCount: 2,
        response: expect.objectContaining({
          data: { categories: ["Mugs"] },
        }) as unknown,
      }),
    );
    const [, meta] = loggerMock.info.mock.calls[0] as [
      string,
      { durationMs: number },
    ];
    expect(meta.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("skips introspection polling entirely", async () => {
    const listener = await startListener();

    await listener.didResolveOperation?.(
      makeResolveContext({ operationName: "IntrospectionQuery" }),
    );
    await listener.willSendResponse?.(makeResponseContext(0));

    expect(loggerMock.info).not.toHaveBeenCalled();
  });

  it("logs encountered errors with their messages", async () => {
    const listener = await startListener();
    await listener.didResolveOperation?.(makeResolveContext({}));

    await listener.didEncounterErrors?.({
      contextValue: { req: { requestId: "req-1" } },
      errors: [{ message: "boom" }],
    } as unknown as GraphQLRequestContextDidEncounterErrors<GqlContext>);

    expect(loggerMock.warn).toHaveBeenCalledWith(
      "graphql:errors query Categories",
      { requestId: "req-1", errors: ["boom"] },
    );
  });
});
