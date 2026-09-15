import { describe, expect, it } from "vitest";

import {
  EventStatus,
  OrderStatus,
  RegistrationStatus,
} from "@/graphql/generated/graphql";

import {
  enumOptions,
  eventStatusTone,
  orderStatusTone,
  registrationStatusTone,
  toNullableNumber,
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
