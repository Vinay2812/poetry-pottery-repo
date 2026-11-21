import { describe, expect, it } from "vitest";

import { RegistrationStatus } from "@/graphql/generated/graphql";

import {
  isRegistrationClosed,
  toRegistrationStatusLabel,
  toRegistrationStatusTone,
} from "./registration-status";

describe("toRegistrationStatusLabel", () => {
  it("reads every status the way the guest does", () => {
    expect(toRegistrationStatusLabel(RegistrationStatus.Pending)).toBe(
      "Awaiting approval",
    );
    expect(toRegistrationStatusLabel(RegistrationStatus.Approved)).toBe(
      "Approved, awaiting payment",
    );
    expect(toRegistrationStatusLabel(RegistrationStatus.Confirmed)).toBe(
      "Confirmed",
    );
    expect(toRegistrationStatusLabel(RegistrationStatus.Rejected)).toBe(
      "Not approved",
    );
    expect(toRegistrationStatusLabel(RegistrationStatus.Cancelled)).toBe(
      "Cancelled",
    );
  });
});

describe("isRegistrationClosed", () => {
  it("closes cancelled and not-approved requests only", () => {
    expect(isRegistrationClosed(RegistrationStatus.Cancelled)).toBe(true);
    expect(isRegistrationClosed(RegistrationStatus.Rejected)).toBe(true);
    expect(isRegistrationClosed(RegistrationStatus.Pending)).toBe(false);
    expect(isRegistrationClosed(RegistrationStatus.Approved)).toBe(false);
    expect(isRegistrationClosed(RegistrationStatus.Confirmed)).toBe(false);
  });
});

describe("toRegistrationStatusTone", () => {
  it("colours each status by how far along it is", () => {
    expect(toRegistrationStatusTone(RegistrationStatus.Pending)).toBe(
      "pending",
    );
    expect(toRegistrationStatusTone(RegistrationStatus.Approved)).toBe(
      "active",
    );
    expect(toRegistrationStatusTone(RegistrationStatus.Confirmed)).toBe("done");
    expect(toRegistrationStatusTone(RegistrationStatus.Rejected)).toBe("off");
    expect(toRegistrationStatusTone(RegistrationStatus.Cancelled)).toBe("off");
  });
});
