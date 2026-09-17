import { describe, expect, it } from "vitest";

import { reviewSchema } from "./review";

describe("reviewSchema", () => {
  it("needs a rating between one and five", () => {
    expect(
      reviewSchema.safeParse({ rating: 0, body: "", image_urls: [] }).success,
    ).toBe(false);
    expect(
      reviewSchema.safeParse({ rating: 6, body: "", image_urls: [] }).success,
    ).toBe(false);
    expect(
      reviewSchema.safeParse({ rating: 3, body: "", image_urls: [] }).success,
    ).toBe(true);
  });

  it("keeps the body optional but bounded", () => {
    expect(
      reviewSchema.safeParse({
        rating: 5,
        body: "a".repeat(1001),
        image_urls: [],
      }).success,
    ).toBe(false);
    const parsed = reviewSchema.parse({
      rating: 5,
      body: "  trimmed  ",
      image_urls: [],
    });
    expect(parsed.body).toBe("trimmed");
  });

  it("allows at most three photos", () => {
    expect(
      reviewSchema.safeParse({
        rating: 5,
        body: "",
        image_urls: ["a", "b", "c", "d"],
      }).success,
    ).toBe(false);
  });
});
