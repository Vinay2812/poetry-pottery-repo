import type { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ExecutionContextHost } from "@nestjs/core/helpers/execution-context-host";
import {
  ThrottlerException,
  ThrottlerGuard,
  type ThrottlerModuleOptions,
  type ThrottlerStorage,
} from "@nestjs/throttler";
import { getAuth } from "@clerk/express";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createHttpExecutionContext } from "@test/helpers/execution-context";
import { StrictThrottle } from "@/common/decorators/throttle.decorators";
import { getRequest } from "@/common/graphql/execution-context";
import type { AppRequest } from "@/common/types/express";
import {
  GqlThrottlerGuard,
  isStrictThrottled,
  resolveClientIp,
} from "./gql-throttler.guard";

vi.mock("@clerk/express", () => ({
  getAuth: vi.fn(),
  clerkMiddleware: vi.fn(),
  clerkClient: {},
}));

const getAuthMock = vi.mocked(getAuth);

function mockAuthId(authId: string | null): void {
  getAuthMock.mockReturnValue({ userId: authId } as unknown as ReturnType<
    typeof getAuth
  >);
}

// The guard only widens visibility; the behaviour under test is the inherited one.
class TestableGuard extends GqlThrottlerGuard {
  public override getTracker(request: AppRequest): Promise<string> {
    return super.getTracker(request);
  }
}

function spyOnBaseGuard() {
  return vi.spyOn(ThrottlerGuard.prototype, "canActivate");
}

const options: ThrottlerModuleOptions = [{ limit: 5, ttl: 1_000 }];
const storage: ThrottlerStorage = { increment: vi.fn() };

// Builds a properly typed express request from a plain object without a cast.
function requestFrom(source: object): AppRequest {
  return getRequest(createHttpExecutionContext({ request: source }));
}

function createRpcExecutionContext(): ExecutionContext {
  const context = new ExecutionContextHost([{ payload: {} }]);
  context.setType("rmq");
  return context;
}

function createGraphQlExecutionContext(): ExecutionContext {
  const context = new ExecutionContextHost([{}, {}, { req: {} }, {}]);
  context.setType("graphql");
  return context;
}

describe("GqlThrottlerGuard", () => {
  let guard: TestableGuard;
  let baseCanActivate: ReturnType<typeof spyOnBaseGuard>;

  beforeEach(() => {
    vi.restoreAllMocks();
    guard = new TestableGuard(options, storage, new Reflector());
    baseCanActivate = spyOnBaseGuard().mockResolvedValue(true);
  });

  it("lets queue jobs through without consulting the rate limiter", async () => {
    await expect(guard.canActivate(createRpcExecutionContext())).resolves.toBe(
      true,
    );
    expect(baseCanActivate).not.toHaveBeenCalled();
  });

  it("rate limits http requests", async () => {
    const context = createHttpExecutionContext({ request: {} });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(baseCanActivate).toHaveBeenCalledWith(context);
  });

  it("rate limits graphql operations", async () => {
    const context = createGraphQlExecutionContext();

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(baseCanActivate).toHaveBeenCalledWith(context);
  });

  it("rethrows the throttling exception so the caller sees 429", async () => {
    baseCanActivate.mockRejectedValue(new ThrottlerException());

    await expect(
      guard.canActivate(createHttpExecutionContext({ request: {} })),
    ).rejects.toBeInstanceOf(ThrottlerException);
  });

  it("serves the request when the throttler storage is down", async () => {
    // A Redis outage must not take the whole API down with it.
    baseCanActivate.mockRejectedValue(new Error("ECONNREFUSED 127.0.0.1:6381"));

    await expect(
      guard.canActivate(createHttpExecutionContext({ request: {} })),
    ).resolves.toBe(true);
  });

  it("tracks signed-in visitors by their clerk id", async () => {
    mockAuthId("user_7");

    await expect(
      guard.getTracker(requestFrom({ ip: "203.0.113.7" })),
    ).resolves.toBe("user:user_7");
  });

  it("falls back to the client ip for anonymous visitors", async () => {
    mockAuthId(null);

    await expect(
      guard.getTracker(requestFrom({ ip: "203.0.113.7" })),
    ).resolves.toBe("ip:203.0.113.7");
  });

  it("treats a request without clerk middleware as anonymous", async () => {
    getAuthMock.mockImplementation(() => {
      throw new Error("clerkMiddleware() has not been run");
    });

    await expect(
      guard.getTracker(requestFrom({ ip: "203.0.113.7" })),
    ).resolves.toBe("ip:203.0.113.7");
  });
});

describe("resolveClientIp", () => {
  it("prefers the proxy-aware express ip", () => {
    expect(
      resolveClientIp(
        requestFrom({
          ip: "203.0.113.7",
          socket: { remoteAddress: "10.0.0.9" },
        }),
      ),
    ).toBe("203.0.113.7");
  });

  it("falls back to the socket address", () => {
    expect(
      resolveClientIp(requestFrom({ socket: { remoteAddress: "10.0.0.9" } })),
    ).toBe("10.0.0.9");
  });

  it("returns a placeholder when neither is known", () => {
    expect(resolveClientIp(requestFrom({}))).toBe("unknown");
    expect(resolveClientIp(requestFrom({ socket: {} }))).toBe("unknown");
  });
});

class PlainResolver {
  open(): void {}
}

class MethodDecoratedResolver {
  @StrictThrottle()
  send(): void {}

  open(): void {}
}

@StrictThrottle()
class ClassDecoratedResolver {
  open(): void {}
}

// Reading the handler off the descriptor keeps the reference unbound on purpose.
function handlerOf(
  prototype: object,
  field: string,
): (...args: never[]) => unknown {
  const handler: unknown = Object.getOwnPropertyDescriptor(
    prototype,
    field,
  )?.value;
  if (typeof handler !== "function") {
    throw new Error(`${field} is not a handler`);
  }
  return handler as (...args: never[]) => unknown;
}

describe("isStrictThrottled", () => {
  it("is off unless a handler or class opts in", () => {
    expect(
      isStrictThrottled(
        createHttpExecutionContext({
          request: {},
          classRef: PlainResolver,
          handler: handlerOf(PlainResolver.prototype, "open"),
        }),
      ),
    ).toBe(false);
  });

  it("is on for a decorated handler", () => {
    expect(
      isStrictThrottled(
        createHttpExecutionContext({
          request: {},
          classRef: MethodDecoratedResolver,
          handler: handlerOf(MethodDecoratedResolver.prototype, "send"),
        }),
      ),
    ).toBe(true);
  });

  it("is on for every handler of a decorated class", () => {
    expect(
      isStrictThrottled(
        createHttpExecutionContext({
          request: {},
          classRef: ClassDecoratedResolver,
          handler: handlerOf(ClassDecoratedResolver.prototype, "open"),
        }),
      ),
    ).toBe(true);
  });

  it("leaves the siblings of a decorated handler alone", () => {
    expect(
      isStrictThrottled(
        createHttpExecutionContext({
          request: {},
          classRef: MethodDecoratedResolver,
          handler: handlerOf(MethodDecoratedResolver.prototype, "open"),
        }),
      ),
    ).toBe(false);
  });
});
