import { describe, expect, it } from "vitest";

import { UserRole } from "@/graphql/generated/graphql";

import {
  type AdminPersonData,
  applyPersonRolePatch,
  describeCurrentRole,
  describeRoleChange,
  roleTone,
  toInitials,
  toOppositeRole,
  toRoleConfirmLabel,
  toUserRole,
  isOnlyAdmin,
  toPersonId,
  toPersonLinks,
} from "./types";

const PERSON: AdminPersonData = {
  role: UserRole.User,
  phone: "9876543210",
  created_at: "2026-02-01T06:00:00.000Z",
  orders_count: 3,
  registrations_count: 1,
  bookings_count: 2,
  reviews_count: 0,
  user: {
    id: 12,
    name: "Meera Kulkarni",
    email: "meera@example.com",
    image: null,
  },
};

describe("toPersonId", () => {
  it("reads a positive integer and nothing else", () => {
    expect(toPersonId("12")).toBe(12);
    expect(toPersonId("0")).toBeNull();
    expect(toPersonId("abc")).toBeNull();
    expect(toPersonId(undefined)).toBeNull();
  });
});

describe("toPersonLinks", () => {
  it("points every count at its own list, narrowed to the person", () => {
    expect(toPersonLinks(7)).toEqual({
      orders: "/dashboard/orders?user=7",
      registrations: "/dashboard/events?user=7",
      bookings: "/dashboard/workshops?user=7",
      reviews: "/dashboard/reviews?user=7",
    });
  });
});

describe("toUserRole", () => {
  it("accepts a real role and drops anything else", () => {
    expect(toUserRole("ADMIN")).toBe(UserRole.Admin);
    expect(toUserRole("OWNER")).toBeNull();
    expect(toUserRole(undefined)).toBeNull();
  });
});

describe("toInitials", () => {
  it("takes the first two words of a name", () => {
    expect(toInitials("Meera Kulkarni", "meera@example.com")).toBe("MK");
    expect(toInitials("Meera", "meera@example.com")).toBe("M");
  });

  it("reads the email when there is no name", () => {
    expect(toInitials(null, "meera.k@example.com")).toBe("MK");
    expect(toInitials(null, "arjun@example.com")).toBe("AE");
  });
});

describe("roleTone", () => {
  it("lights up admins only", () => {
    expect(roleTone(UserRole.Admin)).toBe("live");
    expect(roleTone(UserRole.User)).toBe("quiet");
  });
});

describe("describeCurrentRole", () => {
  it("keeps the article right for both roles", () => {
    expect(describeCurrentRole(UserRole.Admin)).toBe(
      "They are an admin today.",
    );
    expect(describeCurrentRole(UserRole.User)).toBe(
      "They are a customer today.",
    );
  });
});

describe("describeRoleChange", () => {
  it("spells out what the change means", () => {
    expect(describeRoleChange(UserRole.Admin)).toBe(
      "They will be able to open the studio admin.",
    );
    expect(describeRoleChange(UserRole.User)).toBe(
      "They will lose access to the studio admin.",
    );
  });
});

describe("toRoleConfirmLabel and toOppositeRole", () => {
  it("names the move in both directions", () => {
    expect(toOppositeRole(UserRole.User)).toBe(UserRole.Admin);
    expect(toOppositeRole(UserRole.Admin)).toBe(UserRole.User);
    expect(toRoleConfirmLabel(UserRole.Admin)).toBe("Make an admin");
    expect(toRoleConfirmLabel(UserRole.User)).toBe("Make a customer");
  });
});

describe("applyPersonRolePatch", () => {
  it("swaps the role and leaves the counts alone", () => {
    const next = applyPersonRolePatch(PERSON, { role: UserRole.Admin });
    expect(next?.role).toBe(UserRole.Admin);
    expect(next?.orders_count).toBe(3);
  });

  it("leaves a person it does not have alone", () => {
    expect(applyPersonRolePatch(null, { role: UserRole.Admin })).toBeNull();
  });
});

describe("isOnlyAdmin", () => {
  it("is true only for an admin when no other admin exists", () => {
    expect(isOnlyAdmin(UserRole.Admin, 1)).toBe(true);
    expect(isOnlyAdmin(UserRole.Admin, 2)).toBe(false);
    expect(isOnlyAdmin(UserRole.User, 1)).toBe(false);
  });
});
