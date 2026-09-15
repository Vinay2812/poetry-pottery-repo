import { describe, expect, it } from "vitest";

import {
  type AdminEventDetailFragment,
  EventLevel,
  EventStatus,
  EventType,
  RegistrationStatus,
} from "@/graphql/generated/graphql";

import {
  allowedEventActions,
  describeSeats,
  describeWhen,
  EMPTY_EVENT_FORM,
  eventActionDoneMessage,
  eventActionLabel,
  eventActionNeedsReason,
  eventActionStatus,
  isDestructiveEventAction,
  fromDateTimeLocal,
  fromLines,
  isWorkshop,
  personLabel,
  registrationActionLabel,
  registrationActionNeedsReason,
  toDateTimeLocal,
  toEventFormValues,
  toEventInput,
  toEventStatus,
  toEventType,
  toLines,
  toPageNumber,
  toRegistrationStatus,
} from "./types";

const EVENT: AdminEventDetailFragment = {
  id: 4,
  slug: "wheel-evening",
  title: "Wheel evening",
  event_type: EventType.PotteryWorkshop,
  status: EventStatus.Published,
  level: EventLevel.Beginner,
  starts_at: "2026-10-03T11:30:00.000Z",
  ends_at: "2026-10-03T14:30:00.000Z",
  location: "Studio, Sangli",
  address: "12 Kiln Lane, Sangli",
  price: 1200,
  total_seats: 8,
  available_seats: 3,
  image_url: "https://cdn.example.com/event.jpg",
  is_past: false,
  description: "Three hours at the wheel.",
  instructor: "Meera",
  gallery: ["https://cdn.example.com/one.jpg"],
  highlights: ["Clay included", "Small group"],
  includes: ["Tea"],
  performers: [],
};

describe("datetime-local conversion", () => {
  it("shows studio time in the field", () => {
    expect(toDateTimeLocal("2026-10-03T11:30:00.000Z")).toBe(
      "2026-10-03T17:00",
    );
  });

  it("reads the field back as UTC", () => {
    expect(fromDateTimeLocal("2026-10-03T17:00")).toBe(
      "2026-10-03T11:30:00.000Z",
    );
  });

  it("round-trips", () => {
    const iso = "2026-01-09T03:45:00.000Z";
    expect(fromDateTimeLocal(toDateTimeLocal(iso))).toBe(iso);
  });

  it("tolerates a field that carries seconds", () => {
    expect(fromDateTimeLocal("2026-10-03T17:00:00")).toBe(
      "2026-10-03T11:30:00.000Z",
    );
  });

  it("gives an empty string for junk", () => {
    expect(toDateTimeLocal("not a date")).toBe("");
    expect(fromDateTimeLocal("2026-10-03")).toBe("");
    expect(fromDateTimeLocal("")).toBe("");
  });
});

describe("line lists", () => {
  it("writes one item per line", () => {
    expect(toLines(["Clay included", "Tea"])).toBe("Clay included\nTea");
  });

  it("reads lines back and drops the blank ones", () => {
    expect(fromLines("Clay included\n\n  Tea  \n   \n")).toEqual([
      "Clay included",
      "Tea",
    ]);
  });

  it("reads an empty textarea as no items", () => {
    expect(fromLines("   \n\n")).toEqual([]);
  });

  it("round-trips", () => {
    const items = ["Clay included", "Tea", "Firing"];
    expect(fromLines(toLines(items))).toEqual(items);
  });
});

describe("row copy", () => {
  it("counts seats against the total", () => {
    expect(describeSeats(3, 8)).toBe("3 of 8");
  });

  it("says the date once when it starts and ends the same day", () => {
    const line = describeWhen(EVENT.starts_at, EVENT.ends_at);
    expect(line).toContain("3 Oct");
    expect(line).toContain("5:00 pm – 8:00 pm");
    expect(line.match(/Oct/g)).toHaveLength(1);
  });

  it("says both dates when it runs overnight", () => {
    const line = describeWhen(
      "2026-10-03T11:30:00.000Z",
      "2026-10-04T11:30:00.000Z",
    );
    expect(line.match(/Oct/g)).toHaveLength(2);
  });

  it("falls back to nothing when the start is unreadable", () => {
    expect(describeWhen("nope", "also nope")).toBe("");
  });

  it("names a person, or falls back to their email", () => {
    expect(personLabel("Asha", "asha@example.com")).toBe("Asha");
    expect(personLabel(null, "asha@example.com")).toBe("asha@example.com");
    expect(personLabel("  ", "asha@example.com")).toBe("asha@example.com");
  });
});

describe("query values", () => {
  it("reads a page number, defaulting to one", () => {
    expect(toPageNumber("3")).toBe(3);
    expect(toPageNumber(undefined)).toBe(1);
    expect(toPageNumber("0")).toBe(1);
    expect(toPageNumber("-2")).toBe(1);
    expect(toPageNumber("later")).toBe(1);
  });

  it("only accepts enum members from the URL", () => {
    expect(toEventStatus("PUBLISHED")).toBe(EventStatus.Published);
    expect(toEventStatus("published")).toBeNull();
    expect(toEventType("OPEN_MIC")).toBe(EventType.OpenMic);
    expect(toEventType("")).toBeNull();
    expect(toRegistrationStatus("APPROVED")).toBe(RegistrationStatus.Approved);
    expect(toRegistrationStatus("nope")).toBeNull();
  });
});

describe("event actions", () => {
  it("lets a draft go out or be called off", () => {
    expect(allowedEventActions(EventStatus.Draft)).toEqual([
      "publish",
      "cancel",
    ]);
  });

  it("lets a published event be pulled back, finished or called off", () => {
    expect(allowedEventActions(EventStatus.Published)).toEqual([
      "unpublish",
      "complete",
      "cancel",
    ]);
  });

  it("treats completed and cancelled as ends", () => {
    expect(allowedEventActions(EventStatus.Completed)).toEqual([]);
    expect(allowedEventActions(EventStatus.Cancelled)).toEqual([]);
  });

  it("hands back a copy the caller cannot break", () => {
    allowedEventActions(EventStatus.Draft).push("complete");
    expect(allowedEventActions(EventStatus.Draft)).toEqual([
      "publish",
      "cancel",
    ]);
  });

  it("knows where each action lands", () => {
    expect(eventActionStatus("publish")).toBe(EventStatus.Published);
    expect(eventActionStatus("unpublish")).toBe(EventStatus.Draft);
    expect(eventActionStatus("complete")).toBe(EventStatus.Completed);
    expect(eventActionStatus("cancel")).toBe(EventStatus.Cancelled);
  });

  it("only asks why for a cancellation", () => {
    expect(eventActionNeedsReason("cancel")).toBe(true);
    expect(eventActionNeedsReason("publish")).toBe(false);
  });

  it("labels the buttons", () => {
    expect(eventActionLabel("complete")).toBe("Mark complete");
  });

  it("marks only a cancellation as destructive", () => {
    expect(isDestructiveEventAction("cancel")).toBe(true);
    expect(isDestructiveEventAction("unpublish")).toBe(false);
  });

  it("says what happened afterwards", () => {
    expect(eventActionDoneMessage("publish")).toBe("Event published");
  });
});

describe("registration actions", () => {
  it("labels each next status", () => {
    expect(registrationActionLabel(RegistrationStatus.Approved)).toBe(
      "Approve",
    );
    expect(registrationActionLabel(RegistrationStatus.Confirmed)).toBe(
      "Confirm",
    );
  });

  it("asks why only when someone is turned away", () => {
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

describe("form values", () => {
  it("fills the form from a saved event", () => {
    const values = toEventFormValues(EVENT);
    expect(values.starts_at).toBe("2026-10-03T17:00");
    expect(values.highlights).toBe("Clay included\nSmall group");
    expect(values.instructor).toBe("Meera");
    expect(values.gallery).toEqual(["https://cdn.example.com/one.jpg"]);
  });

  it("falls back for an event with no level or instructor", () => {
    const values = toEventFormValues({
      ...EVENT,
      level: null,
      instructor: null,
    });
    expect(values.level).toBe(EventLevel.AllLevels);
    expect(values.instructor).toBe("");
  });

  it("starts a new event as an empty workshop", () => {
    expect(EMPTY_EVENT_FORM.event_type).toBe(EventType.PotteryWorkshop);
    expect(EMPTY_EVENT_FORM.total_seats).toBe(1);
    expect(isWorkshop(EMPTY_EVENT_FORM.event_type)).toBe(true);
  });
});

describe("toEventInput", () => {
  const values = toEventFormValues(EVENT);

  it("sends the workshop fields for a workshop", () => {
    const input = toEventInput(values);
    expect(input.level).toBe(EventLevel.Beginner);
    expect(input.instructor).toBe("Meera");
    expect(input.performers).toBeUndefined();
  });

  it("sends performers for an open mic and leaves the workshop fields out", () => {
    const input = toEventInput({
      ...values,
      event_type: EventType.OpenMic,
      performers: "Asha\n\nRohan",
    });
    expect(input.performers).toEqual(["Asha", "Rohan"]);
    expect(input.level).toBeUndefined();
    expect(input.instructor).toBeUndefined();
  });

  it("sends times as ISO strings", () => {
    const input = toEventInput(values);
    expect(input.starts_at).toBe(EVENT.starts_at);
    expect(input.ends_at).toBe(EVENT.ends_at);
  });

  it("trims the text it sends", () => {
    const input = toEventInput({
      ...values,
      title: "  Wheel evening  ",
      location: " Studio ",
    });
    expect(input.title).toBe("Wheel evening");
    expect(input.location).toBe("Studio");
  });

  it("drops blank lines from the lists", () => {
    const input = toEventInput({ ...values, includes: "Tea\n\n  \nClay" });
    expect(input.includes).toEqual(["Tea", "Clay"]);
  });
});
