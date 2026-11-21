import { describe, expect, it } from "vitest";

import { toRepeatedPhrases } from "./timeline";

describe("toRepeatedPhrases", () => {
  it("finds a promise that repeats the description above it", () => {
    expect(
      toRepeatedPhrases([
        {
          key: "A",
          label: "A",
          description: "We will confirm it on WhatsApp.",
        },
        {
          key: "B",
          label: "B",
          description: "Confirmed.",
          upcoming: "We confirm it on WhatsApp soon.",
        },
      ]),
    ).toEqual(["confirm it on", "it on whatsapp"]);
  });

  it("passes promises that add something new", () => {
    expect(
      toRepeatedPhrases([
        { key: "A", label: "A", description: "We have it." },
        {
          key: "B",
          label: "B",
          description: "Wrapped.",
          upcoming: "Goes by courier.",
        },
      ]),
    ).toEqual([]);
  });
});
