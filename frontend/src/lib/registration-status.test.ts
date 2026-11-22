import { describe, expect, it } from "vitest";

import { RegistrationStatus } from "@/graphql/generated/graphql";

import {
  isRegistrationClosed,
  isRequestLapsed,
  toRegistrationStatusLabel,
  toRegistrationStatusTone,
  toRequestStages,
  withRequestedLine,
  toWithdrawNote,
} from "./registration-status";

describe("toRegistrationStatusLabel", () => {
  it("reads every status the way the guest does", () => {
    expect(toRegistrationStatusLabel(RegistrationStatus.Pending, false)).toBe(
      "Awaiting approval",
    );
    expect(toRegistrationStatusLabel(RegistrationStatus.Approved, false)).toBe(
      "Approved, awaiting payment",
    );
    expect(toRegistrationStatusLabel(RegistrationStatus.Confirmed, false)).toBe(
      "Confirmed",
    );
    expect(toRegistrationStatusLabel(RegistrationStatus.Rejected, false)).toBe(
      "Not approved",
    );
    expect(toRegistrationStatusLabel(RegistrationStatus.Cancelled, false)).toBe(
      "Cancelled",
    );
  });
});

describe("toRegistrationStatusLabel for a free seat", () => {
  it("reads an approved free seat as plain Approved, with no payment to wait for", () => {
    expect(toRegistrationStatusLabel(RegistrationStatus.Approved, true)).toBe(
      "Approved",
    );
    expect(toRegistrationStatusLabel(RegistrationStatus.Pending, true)).toBe(
      "Awaiting approval",
    );
    expect(toRegistrationStatusLabel(RegistrationStatus.Confirmed, true)).toBe(
      "Confirmed",
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

describe("isRequestLapsed", () => {
  const now = new Date("2026-06-10T10:00:00Z");

  it("holds a request whose date is still ahead", () => {
    expect(
      isRequestLapsed(RegistrationStatus.Pending, "2026-06-10T10:30:00Z", now),
    ).toBe(false);
  });

  it("lapses an unanswered request once its date has come", () => {
    expect(
      isRequestLapsed(RegistrationStatus.Pending, "2026-06-09T10:00:00Z", now),
    ).toBe(true);
  });

  it("never lapses a request the studio has answered", () => {
    for (const status of [
      RegistrationStatus.Approved,
      RegistrationStatus.Confirmed,
      RegistrationStatus.Rejected,
      RegistrationStatus.Cancelled,
    ]) {
      expect(isRequestLapsed(status, "2026-06-09T10:00:00Z", now)).toBe(false);
    }
  });
});

describe("withRequestedLine", () => {
  it("keeps only the requested step, with the new note", () => {
    const stages = toRequestStages("Held.", "seat").paid;
    const lapsed = withRequestedLine(stages, "Passed.");
    expect(lapsed.map((stage) => [stage.key, stage.description])).toEqual([
      [RegistrationStatus.Pending, "Passed."],
    ]);
    expect(lapsed[0]?.label).toBe(stages[0]?.label);
  });
});

describe("toWithdrawNote", () => {
  it("says withdrawing is free until payment, and what to do about a payment in flight", () => {
    const note = toWithdrawNote(false);
    expect(note).toContain("Withdrawing is free until you pay.");
    expect(note).toContain(
      "If you've already sent a payment and it still shows as unpaid, message us on WhatsApp",
    );
  });

  it("never talks about payment for a free place", () => {
    expect(toWithdrawNote(true)).not.toMatch(/pay\b|payment/i);
  });
});
