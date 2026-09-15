import { describe, expect, it } from "vitest";

import { EventLevel, EventType } from "@/graphql/generated/graphql";

import { eventSchema, type EventFormValues } from "./event";

const VALID: EventFormValues = {
  title: "Wheel evening",
  description: "Three hours at the wheel.",
  event_type: EventType.PotteryWorkshop,
  level: EventLevel.Beginner,
  starts_at: "2026-10-03T17:00",
  ends_at: "2026-10-03T20:00",
  location: "Studio, Sangli",
  address: "12 Kiln Lane, Sangli",
  price: 1200,
  total_seats: 8,
  instructor: "Meera",
  image_url: "https://cdn.example.com/event.jpg",
  gallery: [],
  highlights: "Clay included",
  includes: "Tea",
  performers: "",
};

function errorFor(values: EventFormValues, field: keyof EventFormValues) {
  const result = eventSchema.safeParse(values);
  if (result.success) return null;
  return (
    result.error.issues.find((issue) => issue.path[0] === field)?.message ??
    null
  );
}

describe("eventSchema", () => {
  it("accepts a filled-in workshop", () => {
    expect(eventSchema.safeParse(VALID).success).toBe(true);
  });

  it("trims the text it keeps", () => {
    const result = eventSchema.safeParse({ ...VALID, title: "  Wheel  " });
    expect(result.success && result.data.title).toBe("Wheel");
  });

  it("wants a title", () => {
    expect(errorFor({ ...VALID, title: "   " }, "title")).toBe(
      "Title is required",
    );
  });

  it("wants a description", () => {
    expect(errorFor({ ...VALID, description: "" }, "description")).toBe(
      "Description is required",
    );
  });

  it("wants a cover photo", () => {
    expect(errorFor({ ...VALID, image_url: "" }, "image_url")).toBe(
      "A cover photo is required",
    );
  });

  it("rejects an end before the start", () => {
    expect(errorFor({ ...VALID, ends_at: "2026-10-03T16:00" }, "ends_at")).toBe(
      "The end has to be after the start",
    );
  });

  it("rejects an end equal to the start", () => {
    expect(errorFor({ ...VALID, ends_at: VALID.starts_at }, "ends_at")).toBe(
      "The end has to be after the start",
    );
  });

  it("rejects a half-typed start", () => {
    expect(errorFor({ ...VALID, starts_at: "2026-10-03" }, "starts_at")).toBe(
      "Pick the date and time it starts",
    );
  });

  it("rejects a negative price", () => {
    expect(errorFor({ ...VALID, price: -1 }, "price")).toBe(
      "Price cannot be negative",
    );
  });

  it("accepts a free event", () => {
    expect(eventSchema.safeParse({ ...VALID, price: 0 }).success).toBe(true);
  });

  it("rejects an empty price field", () => {
    expect(errorFor({ ...VALID, price: Number.NaN }, "price")).toBe(
      "Enter a price in rupees",
    );
  });

  it("rejects rupees with paise", () => {
    expect(errorFor({ ...VALID, price: 12.5 }, "price")).toBe(
      "Price must be whole rupees",
    );
  });

  it("wants at least one seat", () => {
    expect(errorFor({ ...VALID, total_seats: 0 }, "total_seats")).toBe(
      "There has to be at least one seat",
    );
  });
});
