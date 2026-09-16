import { describe, expect, it } from "vitest";

import {
  EventStatus,
  OrderStatus,
  RegistrationStatus,
} from "@/graphql/generated/graphql";

import {
  enumOptions,
  eventStatusTone,
  fromDateTimeLocal,
  orderStatusTone,
  registrationActionLabel,
  registrationActionNeedsReason,
  registrationStatusTone,
  toDateTimeLocal,
  toNullableNumber,
  toPersonName,
  toRegistrationStatus,
} from "./types";

describe("status tones", () => {
  it("marks what still needs a hand", () => {
    expect(orderStatusTone(OrderStatus.Pending)).toBe("warn");
    expect(registrationStatusTone(RegistrationStatus.Pending)).toBe("warn");
    expect(eventStatusTone(EventStatus.Draft)).toBe("warn");
  });

  it("keeps settled rows quiet", () => {
    expect(orderStatusTone(OrderStatus.Cancelled)).toBe("quiet");
    expect(registrationStatusTone(RegistrationStatus.Rejected)).toBe("quiet");
    expect(eventStatusTone(EventStatus.Cancelled)).toBe("quiet");
  });

  it("gives the good outcome the accent", () => {
    expect(orderStatusTone(OrderStatus.Delivered)).toBe("live");
    expect(eventStatusTone(EventStatus.Published)).toBe("live");
  });
});

describe("enumOptions", () => {
  it("lists every member in sentence case", () => {
    expect(enumOptions(EventStatus)).toEqual([
      { value: "CANCELLED", label: "Cancelled" },
      { value: "COMPLETED", label: "Completed" },
      { value: "DRAFT", label: "Draft" },
      { value: "PUBLISHED", label: "Published" },
    ]);
  });
});

describe("toNullableNumber", () => {
  it("keeps an empty optional number empty", () => {
    expect(toNullableNumber("")).toBeNull();
    expect(toNullableNumber(null)).toBeNull();
  });

  it("reads a typed number", () => {
    expect(toNullableNumber("750")).toBe(750);
  });
});

describe("toRegistrationStatus", () => {
  it("reads a status the URL carries", () => {
    expect(toRegistrationStatus("PENDING")).toBe(RegistrationStatus.Pending);
    expect(toRegistrationStatus("CONFIRMED")).toBe(
      RegistrationStatus.Confirmed,
    );
  });

  it("drops anything that is not a member", () => {
    expect(toRegistrationStatus("")).toBeNull();
    expect(toRegistrationStatus("pending")).toBeNull();
    expect(toRegistrationStatus("MAYBE")).toBeNull();
  });
});

describe("registration actions", () => {
  it("names each move in the words an admin would use", () => {
    expect(registrationActionLabel(RegistrationStatus.Pending)).toBe(
      "Move back to pending",
    );
    expect(registrationActionLabel(RegistrationStatus.Approved)).toBe(
      "Approve",
    );
    expect(registrationActionLabel(RegistrationStatus.Confirmed)).toBe(
      "Confirm",
    );
    expect(registrationActionLabel(RegistrationStatus.Rejected)).toBe("Reject");
    expect(registrationActionLabel(RegistrationStatus.Cancelled)).toBe(
      "Cancel",
    );
  });

  it("asks for a reason only when someone is turned away", () => {
    expect(registrationActionNeedsReason(RegistrationStatus.Rejected)).toBe(
      true,
    );
    expect(registrationActionNeedsReason(RegistrationStatus.Cancelled)).toBe(
      true,
    );
    expect(registrationActionNeedsReason(RegistrationStatus.Approved)).toBe(
      false,
    );
    expect(registrationActionNeedsReason(RegistrationStatus.Confirmed)).toBe(
      false,
    );
  });
});

describe("toPersonName", () => {
  it("prefers the name and falls back to the email", () => {
    expect(toPersonName("Meera", "meera@example.com")).toBe("Meera");
    expect(toPersonName(null, "meera@example.com")).toBe("meera@example.com");
    expect(toPersonName("   ", "meera@example.com")).toBe("meera@example.com");
  });
});

describe("datetime-local conversion", () => {
  it("round-trips an instant down to the minute", () => {
    const iso = "2026-06-01T03:30:00.000Z";
    expect(fromDateTimeLocal(toDateTimeLocal(iso))).toBe(iso);
  });

  it("treats an empty field as no date", () => {
    expect(toDateTimeLocal(null)).toBe("");
    expect(toDateTimeLocal("")).toBe("");
    expect(fromDateTimeLocal("")).toBeNull();
    expect(fromDateTimeLocal("   ")).toBeNull();
  });

  it("shrugs off text that is not a date", () => {
    expect(toDateTimeLocal("not a date")).toBe("");
    expect(fromDateTimeLocal("not a date")).toBeNull();
  });

  it("pads every part to the shape the input wants", () => {
    const local = toDateTimeLocal("2026-01-05T00:04:00.000Z");
    expect(local).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });
});
