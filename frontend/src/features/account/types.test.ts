import { describe, expect, it } from "vitest";

import { toDisplayName, toInitials, toMemberSince } from "./types";

describe("account helpers", () => {
  it("falls back from name to email to a default", () => {
    expect(toDisplayName(" Maya Iyer ", "maya@example.com")).toBe("Maya Iyer");
    expect(toDisplayName(null, "maya@example.com")).toBe("maya");
    expect(toDisplayName("", "@")).toBe("Potter");
  });

  it("takes initials from the first and last word", () => {
    expect(toInitials("Maya Iyer")).toBe("MI");
    expect(toInitials("maya")).toBe("M");
    expect(toInitials("Maya Anand Iyer")).toBe("MI");
    expect(toInitials(" ")).toBe("P");
  });

  it("formats the join month", () => {
    expect(toMemberSince("2026-03-15T00:00:00.000Z")).toBe("March 2026");
    expect(toMemberSince(null)).toBe("recently");
    expect(toMemberSince("nope")).toBe("recently");
  });
});
