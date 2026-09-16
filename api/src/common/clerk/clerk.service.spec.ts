import { clerkClient, type User as ClerkUser } from "@clerk/express";
import { UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ClerkService } from "./clerk.service";

const { clerkUsers } = vi.hoisted(() => ({
  clerkUsers: {
    getUser: vi.fn<typeof clerkClient.users.getUser>(),
    updateUserMetadata: vi.fn<typeof clerkClient.users.updateUserMetadata>(),
  },
}));

vi.mock("@clerk/express", () => ({
  getAuth: vi.fn(),
  clerkMiddleware: vi.fn(),
  clerkClient: { users: clerkUsers },
}));

const { getUser, updateUserMetadata } = clerkUsers;

type ClerkUserFields = Pick<
  ClerkUser,
  | "emailAddresses"
  | "primaryEmailAddressId"
  | "fullName"
  | "firstName"
  | "lastName"
  | "imageUrl"
>;

function address(
  id: string,
  emailAddress: string,
): ClerkUser["emailAddresses"][number] {
  return { id, emailAddress, verification: null, linkedTo: [] };
}

// ClerkService only reads these fields; the rest of Clerk's User is never touched.
function makeClerkUser(overrides: Partial<ClerkUserFields> = {}): ClerkUser {
  const fields: ClerkUserFields = {
    emailAddresses: [address("idn_1", "meera@example.com")],
    primaryEmailAddressId: "idn_1",
    fullName: "Meera Rao",
    firstName: "Meera",
    lastName: "Rao",
    imageUrl: "https://img.clerk.test/meera.jpg",
    ...overrides,
  };
  return fields as ClerkUser;
}

describe("ClerkService", () => {
  let service: ClerkService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ClerkService();
  });

  it("picks the address Clerk marks as primary, not the first one listed", () => {
    const user = makeClerkUser({
      emailAddresses: [
        address("idn_old", "old@example.com"),
        address("idn_2", "meera@studio.test"),
      ],
      primaryEmailAddressId: "idn_2",
    });

    expect(service.getPrimaryEmail(user)).toBe("meera@studio.test");
  });

  it("falls back to the first address when nothing is marked primary", () => {
    const user = makeClerkUser({
      emailAddresses: [
        address("idn_old", "old@example.com"),
        address("idn_2", "meera@studio.test"),
      ],
      primaryEmailAddressId: null,
    });

    expect(service.getPrimaryEmail(user)).toBe("old@example.com");
  });

  it("falls back to the first address when the primary id points at nothing", () => {
    const user = makeClerkUser({
      emailAddresses: [address("idn_old", "old@example.com")],
      primaryEmailAddressId: "idn_missing",
    });

    expect(service.getPrimaryEmail(user)).toBe("old@example.com");
  });

  it("has no email to offer when the account carries none", () => {
    const user = makeClerkUser({
      emailAddresses: [],
      primaryEmailAddressId: null,
    });

    expect(service.getPrimaryEmail(user)).toBeUndefined();
  });

  it("uses the full name Clerk already assembled", () => {
    expect(service.getFullName(makeClerkUser())).toBe("Meera Rao");
  });

  it("composes the name from its parts when Clerk has none assembled", () => {
    const user = makeClerkUser({ fullName: null });

    expect(service.getFullName(user)).toBe("Meera Rao");
  });

  it("composes from whichever part exists", () => {
    expect(
      service.getFullName(makeClerkUser({ fullName: null, lastName: null })),
    ).toBe("Meera");
    expect(
      service.getFullName(makeClerkUser({ fullName: null, firstName: null })),
    ).toBe("Rao");
  });

  it("reports no name rather than an empty string when every part is blank", () => {
    expect(
      service.getFullName(
        makeClerkUser({ fullName: null, firstName: null, lastName: null }),
      ),
    ).toBeUndefined();
    expect(
      service.getFullName(
        makeClerkUser({ fullName: null, firstName: "", lastName: "" }),
      ),
    ).toBeUndefined();
  });

  it("reports no name when every part is only whitespace", () => {
    expect(
      service.getFullName(
        makeClerkUser({ fullName: null, firstName: "  ", lastName: "  " }),
      ),
    ).toBeUndefined();
  });

  it("trims the parts it joins", () => {
    const user = makeClerkUser({
      fullName: null,
      firstName: "  Meera ",
      lastName: " Rao  ",
    });

    expect(service.getFullName(user)).toBe("Meera Rao");
  });

  it("passes the avatar through as Clerk gives it", () => {
    expect(service.getImageUrl(makeClerkUser())).toBe(
      "https://img.clerk.test/meera.jpg",
    );
  });

  it("fetches a user by the auth id it was handed", async () => {
    const user = makeClerkUser();
    getUser.mockResolvedValue(user);

    await expect(service.getUser("user_abc")).resolves.toBe(user);
    expect(getUser).toHaveBeenCalledWith("user_abc");
  });

  it("lets a Clerk lookup failure surface to the caller", async () => {
    getUser.mockRejectedValue(new Error("clerk unavailable"));

    await expect(service.getUser("user_abc")).rejects.toThrow(
      "clerk unavailable",
    );
  });

  it("writes the session claims into public metadata and nothing else", async () => {
    updateUserMetadata.mockResolvedValue(makeClerkUser());

    await service.updatePublicMetadata("user_abc", {
      dbUserId: 7,
      role: UserRole.ADMIN,
    });

    expect(updateUserMetadata).toHaveBeenCalledWith("user_abc", {
      publicMetadata: { dbUserId: 7, role: UserRole.ADMIN },
    });
  });

  it("writes a plain user's claims the same way", async () => {
    updateUserMetadata.mockResolvedValue(makeClerkUser());

    await service.updatePublicMetadata("user_xyz", {
      dbUserId: 12,
      role: UserRole.USER,
    });

    expect(updateUserMetadata).toHaveBeenCalledWith("user_xyz", {
      publicMetadata: { dbUserId: 12, role: UserRole.USER },
    });
  });
});
