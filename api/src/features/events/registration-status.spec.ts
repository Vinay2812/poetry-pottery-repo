import { RegistrationStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  canTransition,
  releasesSeats,
  takesSeats,
} from "./registration-status";

describe("registration status rules", () => {
  it("allows the studio flow and blocks reopening closed registrations", () => {
    expect(
      canTransition(RegistrationStatus.PENDING, RegistrationStatus.APPROVED),
    ).toBe(true);
    expect(
      canTransition(RegistrationStatus.APPROVED, RegistrationStatus.CONFIRMED),
    ).toBe(true);
    expect(
      canTransition(RegistrationStatus.CONFIRMED, RegistrationStatus.PENDING),
    ).toBe(false);
    expect(
      canTransition(RegistrationStatus.REJECTED, RegistrationStatus.APPROVED),
    ).toBe(false);
  });

  it("releases seats when leaving a holding state and takes them when re-entering", () => {
    expect(
      releasesSeats(RegistrationStatus.PENDING, RegistrationStatus.REJECTED),
    ).toBe(true);
    expect(
      releasesSeats(RegistrationStatus.APPROVED, RegistrationStatus.CONFIRMED),
    ).toBe(false);
    expect(
      takesSeats(RegistrationStatus.CANCELLED, RegistrationStatus.PENDING),
    ).toBe(true);
    expect(
      takesSeats(RegistrationStatus.PENDING, RegistrationStatus.APPROVED),
    ).toBe(false);
  });
});
