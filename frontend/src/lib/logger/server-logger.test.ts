import { describe, expect, it } from "vitest";

import { toDevLine } from "./server-logger";

describe("toDevLine", () => {
  it("prints one line with key=value pairs and leaves the service tag out", () => {
    expect(
      toDevLine({
        level: "warn",
        message: "products first page failed on the server",
        timestamp: "23:02:32.123",
        service: "web",
        error: "Error: fetch failed",
        attempt: 1,
      }),
    ).toBe(
      "23:02:32.123 warn products first page failed on the server  error=Error: fetch failed attempt=1",
    );
  });
});
