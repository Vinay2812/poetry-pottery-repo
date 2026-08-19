import { describe, expect, it } from "vitest";

import { UserRole } from "@/graphql/generated/graphql";

import {
  toDisplayName,
  toInitial,
  toMemberSince,
  toRoleLabel,
  type ProfileUser,
} from "./types";

const user: ProfileUser = {
  id: 1,
  auth_id: "user_123",
  email: "maya@example.com",
  phone: null,
  name: "Maya Iyer",
  image: null,
  role: UserRole.User,
  subscribed_to_newsletter: false,
  created_at: "2024-03-14T10:00:00.000Z",
  updated_at: "2024-03-14T10:00:00.000Z",
};

describe("toDisplayName", () => {
  it("prefers the name", () => {
    expect(toDisplayName(user)).toBe("Maya Iyer");
  });

  it("falls back to the email local part", () => {
    expect(toDisplayName({ ...user, name: null })).toBe("maya");
  });

  it("falls back to a default when the email has no local part", () => {
    expect(toDisplayName({ ...user, name: "  ", email: "@example.com" })).toBe(
      "Potter",
    );
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

  it("handles unparseable dates", () => {
    expect(toMemberSince("not-a-date")).toBe("Unknown");
  });
});

describe("labels", () => {
  it("maps roles", () => {
    expect(toRoleLabel(UserRole.Admin)).toBe("Admin");
    expect(toRoleLabel(UserRole.User)).toBe("Member");
  });
});
