import { RegistrationStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { BadRequestException } from "@nestjs/common";

import {
  assertNotPaymentStepForFreeSeat,
  canTransition,
  nextAdminStatuses,
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

  it("offers the studio the shared moves, less Approved for a free seat", () => {
    expect(nextAdminStatuses(RegistrationStatus.PENDING, 1200)).toEqual([
      RegistrationStatus.APPROVED,
      RegistrationStatus.CONFIRMED,
      RegistrationStatus.REJECTED,
      RegistrationStatus.CANCELLED,
    ]);
    expect(nextAdminStatuses(RegistrationStatus.PENDING, 0)).toEqual([
      RegistrationStatus.CONFIRMED,
      RegistrationStatus.REJECTED,
      RegistrationStatus.CANCELLED,
    ]);
    // A free seat approved before the rule can still be confirmed.
    expect(nextAdminStatuses(RegistrationStatus.APPROVED, 0)).toEqual([
      RegistrationStatus.CONFIRMED,
      RegistrationStatus.REJECTED,
      RegistrationStatus.CANCELLED,
    ]);
    expect(nextAdminStatuses(RegistrationStatus.CONFIRMED, 0)).toEqual([
      RegistrationStatus.CANCELLED,
    ]);
  });

  it("refuses Approved only for a free seat", () => {
    expect(() =>
      assertNotPaymentStepForFreeSeat(RegistrationStatus.APPROVED, 0),
    ).toThrow(BadRequestException);
    expect(() =>
      assertNotPaymentStepForFreeSeat(RegistrationStatus.APPROVED, 600),
    ).not.toThrow();
    expect(() =>
      assertNotPaymentStepForFreeSeat(RegistrationStatus.CONFIRMED, 0),
    ).not.toThrow();
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
