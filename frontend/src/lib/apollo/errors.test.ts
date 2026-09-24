import { CombinedGraphQLErrors, ServerError } from "@apollo/client/errors";
import { describe, expect, it } from "vitest";

import {
  describeError,
  isNotFoundError,
  OFFLINE_MESSAGE,
  THROTTLED_MESSAGE,
} from "./errors";

function apiError(
  statusCode: number,
  message: string | string[] = "Not Found",
): CombinedGraphQLErrors {
  const graphqlMessage = Array.isArray(message) ? message[0] : message;
  return new CombinedGraphQLErrors({
    errors: [
      {
        message: graphqlMessage,
        extensions: { originalError: { statusCode, message } },
      },
    ],
  });
}

describe("isNotFoundError", () => {
  it("reads the 404 Nest wrapped inside the GraphQL error", () => {
    expect(isNotFoundError(apiError(404))).toBe(true);
  });

  it("leaves every other failure alone", () => {
    expect(isNotFoundError(apiError(500))).toBe(false);
    expect(isNotFoundError(new Error("fetch failed"))).toBe(false);
    expect(isNotFoundError(null)).toBe(false);
  });
});

describe("describeError", () => {
  it("reads the sentence Nest put inside the GraphQL error", () => {
    expect(describeError(apiError(400, "Enter a valid email"), "no")).toBe(
      "Enter a valid email",
    );
  });

  it("takes the first line of a validation pipe's list", () => {
    expect(
      describeError(apiError(400, ["Enter a valid email", "Add a name"]), "no"),
    ).toBe("Enter a valid email");
  });

  it("words a 429 as a rate limit from the status code, not the message", () => {
    expect(
      describeError(
        apiError(429, "ThrottlerException: Too Many Requests"),
        "no",
      ),
    ).toBe(THROTTLED_MESSAGE);
    expect(describeError(apiError(429, "anything"), "no")).toBe(
      THROTTLED_MESSAGE,
    );
  });

  it("drops the exception prefix from a plain GraphQL error", () => {
    const error = new CombinedGraphQLErrors({
      errors: [{ message: "BadRequestException: Enter a valid email" }],
    });
    expect(describeError(error, "no")).toBe("Enter a valid email");
  });

  it("words a dropped connection for the visitor", () => {
    for (const raw of [
      "Failed to fetch",
      "NetworkError when attempting to fetch resource.",
      "Load failed",
    ]) {
      expect(describeError(new TypeError(raw), "no")).toBe(OFFLINE_MESSAGE);
    }
  });

  it("maps an HTTP-level 429 to the throttled wording and other statuses to the fallback", () => {
    const throttled = new ServerError("Too Many Requests", {
      response: new Response(null, { status: 429 }),
      bodyText: "",
    });
    const down = new ServerError("Bad Gateway", {
      response: new Response(null, { status: 502 }),
      bodyText: "<html>",
    });
    expect(describeError(throttled, "no")).toBe(THROTTLED_MESSAGE);
    expect(describeError(down, "The studio is having a moment.")).toBe(
      "The studio is having a moment.",
    );
  });

  it("keeps a plain Error message and falls back when there is nothing to show", () => {
    expect(describeError(new Error("Enter a valid email"), "no")).toBe(
      "Enter a valid email",
    );
    expect(describeError(new Error("   "), "Try again in a minute.")).toBe(
      "Try again in a minute.",
    );
    expect(describeError("not an error", "Try again in a minute.")).toBe(
      "Try again in a minute.",
    );
    expect(describeError(null, "Try again in a minute.")).toBe(
      "Try again in a minute.",
    );
  });
});
