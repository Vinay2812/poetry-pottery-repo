import { describe, expect, it } from "vitest";

import { contactSchema } from "./contact";

function values(overrides: Record<string, unknown> = {}) {
  return {
    name: "Maya Iyer",
    email: "maya@example.com",
    phone: "",
    subject: "",
    message: "Do you ship the ash glaze mug to Pune?",
    ...overrides,
  };
}

function firstError(overrides: Record<string, unknown>): string {
  const result = contactSchema.safeParse(values(overrides));
  return result.success ? "" : (result.error.issues[0]?.message ?? "");
}

describe("contactSchema", () => {
  it("trims every field", () => {
    const result = contactSchema.parse(
      values({
        name: "  Maya Iyer ",
        email: " maya@example.com ",
        subject: " Glaze question ",
        message: "  Do you ship to Pune?  ",
      }),
    );

    expect(result.name).toBe("Maya Iyer");
    expect(result.email).toBe("maya@example.com");
    expect(result.subject).toBe("Glaze question");
    expect(result.message).toBe("Do you ship to Pune?");
  });

  it("leaves phone and subject optional", () => {
    const result = contactSchema.parse(values());
    expect(result.phone).toBe("");
    expect(result.subject).toBe("");
  });

  it("accepts the ways people type an Indian number", () => {
    expect(
      contactSchema.safeParse(values({ phone: "9876543210" })).success,
    ).toBe(true);
    expect(
      contactSchema.safeParse(values({ phone: "+91 98765-43210" })).success,
    ).toBe(true);
  });

  it("explains what is wrong in words a person can act on", () => {
    expect(firstError({ name: "M" })).toBe(
      "Name must be at least 2 characters",
    );
    expect(firstError({ email: "maya@" })).toBe("Enter a valid email address");
    expect(firstError({ phone: "98765" })).toBe(
      "Enter a valid 10-digit phone number",
    );
    expect(firstError({ subject: "x".repeat(121) })).toBe(
      "Subject must be 120 characters or fewer",
    );
    expect(firstError({ message: "Too short" })).toBe(
      "Message must be at least 10 characters",
    );
  });
});
