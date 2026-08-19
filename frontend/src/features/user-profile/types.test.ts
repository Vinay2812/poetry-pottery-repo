import { describe, expect, it } from "vitest";

import { UserRole } from "@/graphql/generated/graphql";

import { toDisplayName, toInitial, toMemberSince, toRoleLabel } from "./types";

describe("toDisplayName", () => {
  it("prefers the name", () => {
    expect(toDisplayName("Maya Iyer", "maya@example.com")).toBe("Maya Iyer");
  });

  it("falls back to the email local part", () => {
    expect(toDisplayName(null, "maya@example.com")).toBe("maya");
  });

  it("falls back to a default when the email has no local part", () => {
    expect(toDisplayName("  ", "@example.com")).toBe("Potter");
  });
});

describe("toInitial", () => {
  it("uppercases the first character", () => {
    expect(toInitial("maya")).toBe("M");
  });

  it("is empty for an empty name", () => {
    expect(toInitial("")).toBe("");
  });
});

describe("toMemberSince", () => {
  it("formats to month and year", () => {
    expect(toMemberSince("2024-03-14T10:00:00.000Z")).toBe("March 2024");
  });

  it("accepts a Date instance", () => {
    expect(toMemberSince(new Date("2024-03-14T10:00:00.000Z"))).toBe(
      "March 2024",
    );
  });

  it("handles unparseable dates", () => {
    expect(toMemberSince("not-a-date")).toBe("Unknown");
  });

  it("handles a missing date", () => {
    expect(toMemberSince(null)).toBe("Unknown");
  });
});

describe("toRoleLabel", () => {
  it("maps roles", () => {
    expect(toRoleLabel(UserRole.Admin)).toBe("Admin");
    expect(toRoleLabel(UserRole.User)).toBe("Member");
  });

  it("defaults to member while the role metadata is absent", () => {
    expect(toRoleLabel(undefined)).toBe("Member");
  });
});
