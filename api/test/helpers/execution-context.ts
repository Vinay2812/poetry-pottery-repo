import type { ExecutionContext, Type } from "@nestjs/common";
import { ExecutionContextHost } from "@nestjs/core/helpers/execution-context-host";

export interface FakeContextInput {
  request: object;
  response?: object;
  classRef?: Type;
  handler?: (...args: never[]) => unknown;
}

class FakeHandlerClass {}

function noop(): void {}

// Reuses Nest's own ExecutionContext implementation so guards can be exercised without a server.
export function createHttpExecutionContext(
  input: FakeContextInput,
): ExecutionContext {
  const { request, response = {}, classRef = FakeHandlerClass } = input;
  return new ExecutionContextHost(
    [request, response, noop],
    classRef,
    input.handler ?? noop,
  );
}
