import { describe, expect, it } from "vitest";

import { CommissionStatus } from "@/graphql/generated/graphql";

import {
  applyCommissionPatch,
  type CommissionRow,
  commissionStatusTone,
  describeBrief,
  toCommissionRow,
  toCommissionStatus,
  toWhatsAppHref,
} from "./types";

function row(overrides: Partial<CommissionRow> = {}): CommissionRow {
  return {
    id: "CMS1",
    pieceType: "Platter",
    size: "Large",
    glaze: "Kiln ash",
    carvedWords: null,
    notes: null,
    name: "Anjali Rao",
    email: "anjali@example.com",
    phone: "9123456789",
    referenceImageUrls: [],
    isRead: false,
    status: CommissionStatus.New,
    createdAt: "2026-09-17T03:30:00.000Z",
    ...overrides,
  };
}

describe("toCommissionRow", () => {
  it("renames the snake case fields the API sends", () => {
    expect(
      toCommissionRow({
        id: "CMS1",
        piece_type: "Platter",
        size: "Large",
        glaze: "Kiln ash",
        carved_words: "Anjali & Rohit",
        notes: null,
        name: "Anjali Rao",
        email: "anjali@example.com",
        phone: null,
        reference_image_urls: ["https://cdn.test/one.png"],
        is_read: true,
        status: CommissionStatus.Accepted,
        created_at: "2026-09-17T03:30:00.000Z",
      }),
    ).toMatchObject({
      pieceType: "Platter",
      carvedWords: "Anjali & Rohit",
      referenceImageUrls: ["https://cdn.test/one.png"],
      isRead: true,
      status: CommissionStatus.Accepted,
    });
  });
});

describe("describeBrief", () => {
  it("joins the three answers into one line", () => {
    expect(describeBrief("Platter", "Large", "Kiln ash")).toBe(
      "Platter · Large · Kiln ash",
    );
  });
});

describe("commissionStatusTone", () => {
  it("lights an accepted brief and quiets a declined one", () => {
    expect(commissionStatusTone(CommissionStatus.Accepted)).toBe("live");
    expect(commissionStatusTone(CommissionStatus.Declined)).toBe("quiet");
    expect(commissionStatusTone(CommissionStatus.New)).toBe("warn");
    expect(commissionStatusTone(CommissionStatus.Sketched)).toBe("warn");
  });
});

describe("toCommissionStatus", () => {
  it("keeps a real status and drops anything else", () => {
    expect(toCommissionStatus("SKETCHED")).toBe(CommissionStatus.Sketched);
    expect(toCommissionStatus("MAYBE")).toBeNull();
    expect(toCommissionStatus(undefined)).toBeNull();
  });
});

describe("toWhatsAppHref", () => {
  it("adds the country code to a ten digit number", () => {
    const href = toWhatsAppHref("9123456789", "Anjali", "Platter");
    expect(href).toContain("https://wa.me/919123456789");
    expect(href).toContain("Anjali");
  });

  it("leaves a number that already carries its code", () => {
    expect(toWhatsAppHref("+91 91234 56789", "Anjali", "Platter")).toContain(
      "wa.me/919123456789",
    );
  });

  it("offers nothing without a usable number", () => {
    expect(toWhatsAppHref(null, "Anjali", "Platter")).toBeNull();
    expect(toWhatsAppHref("123", "Anjali", "Platter")).toBeNull();
  });
});

describe("applyCommissionPatch", () => {
  it("marks a brief read without touching the rest", () => {
    const rows = [row({ id: "a" }), row({ id: "b" })];
    const next = applyCommissionPatch(rows, { kind: "read", id: "a" });
    expect(next[0]?.isRead).toBe(true);
    expect(next[1]?.isRead).toBe(false);
  });

  it("counts a brief as read once it leaves NEW", () => {
    const next = applyCommissionPatch([row()], {
      kind: "status",
      id: "CMS1",
      status: CommissionStatus.Accepted,
    });
    expect(next[0]?.status).toBe(CommissionStatus.Accepted);
    expect(next[0]?.isRead).toBe(true);
  });

  it("leaves the unread mark alone when a brief goes back to NEW", () => {
    const next = applyCommissionPatch(
      [row({ status: CommissionStatus.Sketched })],
      {
        kind: "status",
        id: "CMS1",
        status: CommissionStatus.New,
      },
    );
    expect(next[0]?.isRead).toBe(false);
  });
});
