import { RegistrationStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { BadRequestException } from "@nestjs/common";

import {
  assertNotLateAdmission,
  assertNotPaymentStepForFreeSeat,
  canTransition,
  nextAdminStatuses,
  releasesSeats,
  takesSeats,
} from "./registration-status";

const NOW = new Date("2026-11-22T10:00:00Z");
const AHEAD = new Date("2026-11-29T10:00:00Z");
const BEGUN = new Date("2026-06-27T10:00:00Z");

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
    expect(
      nextAdminStatuses(RegistrationStatus.PENDING, 1200, AHEAD, NOW),
    ).toEqual([
      RegistrationStatus.APPROVED,
      RegistrationStatus.CONFIRMED,
      RegistrationStatus.REJECTED,
      RegistrationStatus.CANCELLED,
    ]);
    expect(
      nextAdminStatuses(RegistrationStatus.PENDING, 0, AHEAD, NOW),
    ).toEqual([
      RegistrationStatus.CONFIRMED,
      RegistrationStatus.REJECTED,
      RegistrationStatus.CANCELLED,
    ]);
    // A free seat approved before the rule can still be confirmed.
    expect(
      nextAdminStatuses(RegistrationStatus.APPROVED, 0, AHEAD, NOW),
    ).toEqual([
      RegistrationStatus.CONFIRMED,
      RegistrationStatus.REJECTED,
      RegistrationStatus.CANCELLED,
    ]);
    expect(
      nextAdminStatuses(RegistrationStatus.CONFIRMED, 0, AHEAD, NOW),
    ).toEqual([RegistrationStatus.CANCELLED]);
  });

  it("offers only the ways to close an unanswered request once its date has begun", () => {
    expect(
      nextAdminStatuses(RegistrationStatus.PENDING, 1200, BEGUN, NOW),
    ).toEqual([RegistrationStatus.REJECTED, RegistrationStatus.CANCELLED]);
  });

  it("still lets an approved booking be confirmed as paid after its date", () => {
    expect(
      nextAdminStatuses(RegistrationStatus.APPROVED, 1200, BEGUN, NOW),
    ).toEqual([
      RegistrationStatus.CONFIRMED,
      RegistrationStatus.REJECTED,
      RegistrationStatus.CANCELLED,
    ]);
    expect(
      nextAdminStatuses(RegistrationStatus.CONFIRMED, 1200, BEGUN, NOW),
    ).toEqual([RegistrationStatus.CANCELLED]);
  });

  it("refuses letting an unanswered request in once its date has begun", () => {
    const pending = RegistrationStatus.PENDING;
    expect(() =>
      assertNotLateAdmission(pending, RegistrationStatus.APPROVED, BEGUN, NOW),
    ).toThrow(BadRequestException);
    expect(() =>
      assertNotLateAdmission(pending, RegistrationStatus.CONFIRMED, BEGUN, NOW),
    ).toThrow(BadRequestException);
    expect(() =>
      assertNotLateAdmission(pending, RegistrationStatus.REJECTED, BEGUN, NOW),
    ).not.toThrow();
    expect(() =>
      assertNotLateAdmission(pending, RegistrationStatus.CONFIRMED, AHEAD, NOW),
    ).not.toThrow();
    expect(() =>
      assertNotLateAdmission(
        RegistrationStatus.APPROVED,
        RegistrationStatus.CONFIRMED,
        BEGUN,
        NOW,
      ),
    ).not.toThrow();
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
