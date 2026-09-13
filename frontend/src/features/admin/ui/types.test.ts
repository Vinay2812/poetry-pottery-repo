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
