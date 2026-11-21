import { describe, expect, it, vi } from "vitest";

import {
  EventStatus,
  OrderStatus,
  RegistrationStatus,
} from "@/graphql/generated/graphql";

import {
  adminFieldMessageId,
  describeClosing,
  enumOptions,
  eventStatusTone,
  fromDateTimeLocal,
  orderStatusLabel,
  orderStatusOptions,
  orderStatusTone,
  registrationActionNeedsReason,
  registrationClosingDialog,
  registrationHoldNote,
  registrationStatusOptions,
  registrationStatusTone,
  toDateTimeLocal,
  toNullableNumber,
  toPersonName,
  toPreviewColour,
  toRegistrationActions,
  toRegistrationStatus,
  retryQuery,
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

describe("status labels", () => {
  it("reads an order the way the shopper does", () => {
    expect(orderStatusLabel(OrderStatus.Pending)).toBe("Awaiting confirmation");
    expect(orderStatusLabel(OrderStatus.Confirmed)).toBe(
      "Confirmed, awaiting payment",
    );
    expect(orderStatusLabel(OrderStatus.Refunded)).toBe("Refunded");
  });

  it("explains that a request already holds its place", () => {
    expect(registrationHoldNote("wheel")).toBe(
      "A request holds its wheel from the moment it's made; turning it down frees it.",
    );
    expect(registrationHoldNote("seat")).toContain("holds its seats");
  });

  it("lists filter options in the order things happen", () => {
    expect(orderStatusOptions().map((option) => option.value)).toEqual([
      "PENDING",
      "CONFIRMED",
      "PAID",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
    ]);
    expect(registrationStatusOptions()[1]).toEqual({
      value: "APPROVED",
      label: "Approved, awaiting payment",
    });
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
  it("says what each move does", () => {
    expect(
      toRegistrationActions(
        RegistrationStatus.Approved,
        [
          RegistrationStatus.Confirmed,
          RegistrationStatus.Rejected,
          RegistrationStatus.Cancelled,
        ],
        "wheel",
      ).map((action) => action.label),
    ).toEqual(["Confirm as paid", "Cancel booking"]);
    expect(
      toRegistrationActions(
        RegistrationStatus.Confirmed,
        [RegistrationStatus.Cancelled],
        "seat",
      ).map((action) => action.label),
    ).toEqual(["Cancel registration"]);
  });

  it("marks only the first move that lets someone in", () => {
    expect(
      toRegistrationActions(
        RegistrationStatus.Pending,
        [RegistrationStatus.Approved, RegistrationStatus.Confirmed],
        "wheel",
      ).map((action) => [action.label, action.isPrimary]),
    ).toEqual([
      ["Approve, ask for payment", true],
      ["Confirm as paid", false],
    ]);
    expect(
      toRegistrationActions(
        RegistrationStatus.Confirmed,
        [RegistrationStatus.Cancelled],
        "seat",
      )[0]?.isPrimary,
    ).toBe(false);
  });

  it("gives a request awaiting approval one way to say no", () => {
    expect(
      toRegistrationActions(
        RegistrationStatus.Pending,
        [
          RegistrationStatus.Approved,
          RegistrationStatus.Confirmed,
          RegistrationStatus.Rejected,
          RegistrationStatus.Cancelled,
        ],
        "wheel",
      ).map((action) => action.status),
    ).toEqual([
      RegistrationStatus.Approved,
      RegistrationStatus.Confirmed,
      RegistrationStatus.Rejected,
    ]);
  });

  it("gives an approved booking one way to say no, since the guest was told", () => {
    expect(
      toRegistrationActions(
        RegistrationStatus.Approved,
        [
          RegistrationStatus.Confirmed,
          RegistrationStatus.Rejected,
          RegistrationStatus.Cancelled,
        ],
        "seat",
      ).map((action) => action.status),
    ).toEqual([RegistrationStatus.Confirmed, RegistrationStatus.Cancelled]);
  });

  it("marks turning down and cancelling as destructive", () => {
    expect(
      toRegistrationActions(
        RegistrationStatus.Pending,
        [RegistrationStatus.Approved, RegistrationStatus.Rejected],
        "wheel",
      ).map((action) => action.isDestructive),
    ).toEqual([false, true]);
  });

  it("never offers a way back to awaiting approval", () => {
    expect(
      toRegistrationActions(
        RegistrationStatus.Approved,
        [RegistrationStatus.Pending, RegistrationStatus.Confirmed],
        "seat",
      ).map((action) => action.status),
    ).toEqual([RegistrationStatus.Confirmed]);
  });

  it("names the closing dialog after the thing being closed", () => {
    expect(
      registrationClosingDialog(RegistrationStatus.Rejected, "wheel"),
    ).toEqual({ title: "Turn this booking down?", confirmLabel: "Turn down" });
    expect(
      registrationClosingDialog(RegistrationStatus.Cancelled, "seat"),
    ).toEqual({
      title: "Cancel this registration?",
      confirmLabel: "Cancel registration",
    });
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

describe("describeClosing", () => {
  it("names who closed it when the reason was filled in for them", () => {
    expect(describeClosing("Cancelled by the guest")).toBe(
      "Cancelled by the guest",
    );
    expect(describeClosing("The studio called this one off")).toBe(
      "Cancelled by the studio with the event",
    );
  });

  it("quotes a reason someone wrote", () => {
    expect(describeClosing("Work came up")).toBe("Reason: Work came up");
  });

  it("says nothing when there is no reason", () => {
    expect(describeClosing(null)).toBeNull();
    expect(describeClosing("  ")).toBeNull();
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

describe("toPreviewColour", () => {
  it("paints a six-digit hex colour, trimmed", () => {
    expect(toPreviewColour(" #4F6F52 ")).toBe("#4F6F52");
  });

  it("paints nothing while the value is half typed or empty", () => {
    expect(toPreviewColour("#4F6")).toBeNull();
    expect(toPreviewColour("")).toBeNull();
    expect(toPreviewColour("sage")).toBeNull();
  });
});

describe("adminFieldMessageId", () => {
  it("names the line under a field after the field", () => {
    expect(adminFieldMessageId("email")).toBe("email-message");
  });
});

describe("retryQuery", () => {
  it("asks again and leaves a second failure to the query's own error", async () => {
    const refetch = vi.fn().mockRejectedValue(new Error("offline"));
    retryQuery(refetch)();
    await Promise.resolve();
    expect(refetch).toHaveBeenCalledOnce();
  });
});
