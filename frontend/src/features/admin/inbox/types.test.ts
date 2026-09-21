import { describe, expect, it } from "vitest";

import {
  type AdminContactMessageFieldsFragment,
  type AdminSubscriberFieldsFragment,
  type AdminWhatsAppMessageFieldsFragment,
  WhatsAppDirection,
} from "@/graphql/generated/graphql";

import {
  applyContactPatch,
  applySubscriberPatch,
  type ContactRow,
  type SubscriberRow,
  toAccountLabel,
  toActiveLabel,
  toActiveTone,
  toContactFilter,
  toContactRow,
  toInboxTab,
  toIsActive,
  toIsRead,
  toReadToggleLabel,
  toSubjectText,
  toSubscriberRow,
  toSubscribersCsvName,
  toSubscribersExportFilter,
  toSubscribersFilter,
  toUnsubscribedLabel,
  toWhatsAppDirection,
  toWhatsAppFilter,
  toWhatsAppRow,
  toPageLabel,
} from "./types";

function buildMessage(
  overrides: Partial<AdminContactMessageFieldsFragment> = {},
): AdminContactMessageFieldsFragment {
  return {
    id: 12,
    name: "Ira Menon",
    email: "ira@example.com",
    phone: "+91 98765 43210",
    subject: "  Custom glaze  ",
    message: "Could you throw six mugs in the sage glaze by Diwali?",
    is_read: false,
    created_at: "2026-09-01T10:00:00.000Z",
    ...overrides,
  };
}

function buildSubscriber(
  overrides: Partial<AdminSubscriberFieldsFragment> = {},
): AdminSubscriberFieldsFragment {
  return {
    id: 3,
    email: "ira@example.com",
    user_id: 9,
    is_active: true,
    created_at: "2026-09-01T10:00:00.000Z",
    unsubscribed_at: null,
    ...overrides,
  };
}

function buildContactRow(overrides: Partial<ContactRow> = {}): ContactRow {
  return {
    id: 1,
    name: "Ira Menon",
    email: "ira@example.com",
    phone: null,
    subject: "No subject",
    message: "Hello.",
    receivedLabel: "Tue, 1 Sept, 2026, 3:30 pm",
    isRead: false,
    ...overrides,
  };
}

function buildSubscriberRow(
  overrides: Partial<SubscriberRow> = {},
): SubscriberRow {
  return {
    id: 1,
    email: "ira@example.com",
    accountLabel: "Yes",
    subscribedLabel: "Tue, 1 Sept, 2026",
    unsubscribedLabel: "—",
    isActive: true,
    ...overrides,
  };
}

describe("toInboxTab", () => {
  it("defaults to messages", () => {
    expect(toInboxTab(undefined)).toBe("messages");
    expect(toInboxTab("nonsense")).toBe("messages");
    expect(toInboxTab("subscribers")).toBe("subscribers");
    expect(toInboxTab("whatsapp")).toBe("whatsapp");
  });
});

function buildWhatsApp(
  overrides: Partial<AdminWhatsAppMessageFieldsFragment> = {},
): AdminWhatsAppMessageFieldsFragment {
  return {
    id: 31,
    direction: WhatsAppDirection.ToStudio,
    kind: "order",
    body: "Hi, about my order.",
    page_url: "http://localhost:3030/orders/abc?tab=items",
    name: "Ira Menon",
    email: "ira@example.com",
    phone: null,
    reference: "abc",
    created_at: "2026-09-01T10:00:00.000Z",
    user: { id: 12, name: "Ira Menon", email: "ira@example.com", image: null },
    ...overrides,
  };
}

describe("toWhatsAppRow", () => {
  it("links an inbound message to the person and shows the page path", () => {
    const row = toWhatsAppRow(buildWhatsApp());
    expect(row.directionLabel).toBe("To studio");
    expect(row.directionTone).toBe("live");
    expect(row.who).toBe("Ira Menon");
    expect(row.whoDetail).toBe("ira@example.com");
    expect(row.personHref).toBe("/dashboard/people/12");
    expect(row.pageLabel).toBe("/orders/abc?tab=items");
    expect(row.reference).toBe("abc");
  });

  it("names a visitor without an account", () => {
    const row = toWhatsAppRow(
      buildWhatsApp({ name: null, email: null, user: null, reference: null }),
    );
    expect(row.who).toBe("Visitor");
    expect(row.whoDetail).toBeNull();
    expect(row.personHref).toBeNull();
    expect(row.reference).toBe("—");
  });

  it("shows a reply under the customer's address with the admin who sent it", () => {
    const row = toWhatsAppRow(
      buildWhatsApp({
        direction: WhatsAppDirection.ToCustomer,
        name: null,
        email: "anjali@example.com",
        page_url: null,
        user: { id: 1, name: "Maya", email: "maya@example.com", image: null },
      }),
    );
    expect(row.directionLabel).toBe("To customer");
    expect(row.who).toBe("anjali@example.com");
    expect(row.whoDetail).toBe("Sent by Maya");
    expect(row.personHref).toBeNull();
    expect(row.pageLabel).toBe("—");
  });
});

describe("toPageLabel", () => {
  it("falls back to the raw value when it is not a URL", () => {
    expect(toPageLabel("not a url")).toBe("not a url");
    expect(toPageLabel("http://localhost:3030/")).toBe("/");
  });
});

describe("toWhatsAppFilter", () => {
  it("reads its own search key and the direction", () => {
    expect(
      toWhatsAppFilter(
        { whatsapp_search: " mug ", direction: "to-customer", search: "x" },
        2,
      ),
    ).toEqual({
      page: 2,
      limit: 20,
      search: "mug",
      direction: WhatsAppDirection.ToCustomer,
    });
    expect(toWhatsAppFilter({}, 1)).toEqual({ page: 1, limit: 20 });
  });

  it("ignores an unknown direction", () => {
    expect(toWhatsAppDirection("sideways")).toBeUndefined();
    expect(toWhatsAppDirection("to-studio")).toBe(WhatsAppDirection.ToStudio);
  });
});

describe("toSubjectText", () => {
  it("stands in when nobody wrote a subject", () => {
    expect(toSubjectText(null)).toBe("No subject");
    expect(toSubjectText("  ")).toBe("No subject");
    expect(toSubjectText("  Custom glaze  ")).toBe("Custom glaze");
  });
});

describe("toReadToggleLabel", () => {
  it("names the message the control acts on", () => {
    expect(toReadToggleLabel("Ira", false)).toBe(
      "Mark the message from Ira as read",
    );
    expect(toReadToggleLabel("Ira", true)).toBe(
      "Mark the message from Ira as unread",
    );
  });
});

describe("toContactRow", () => {
  it("flattens the payload into one row", () => {
    expect(toContactRow(buildMessage())).toEqual({
      id: 12,
      name: "Ira Menon",
      email: "ira@example.com",
      phone: "+91 98765 43210",
      subject: "Custom glaze",
      message: "Could you throw six mugs in the sage glaze by Diwali?",
      receivedLabel: "Tue, 1 Sept, 2026, 3:30 pm",
      isRead: false,
    });
  });
});

describe("toAccountLabel", () => {
  it("says whether the email belongs to a signed-up person", () => {
    expect(toAccountLabel(null)).toBe("No");
    expect(toAccountLabel(4)).toBe("Yes");
  });
});

describe("toUnsubscribedLabel", () => {
  it("leaves a dash while someone is still subscribed", () => {
    expect(toUnsubscribedLabel(null)).toBe("—");
    expect(toUnsubscribedLabel("2026-09-01T10:00:00.000Z")).toBe(
      "Tue, 1 Sept, 2026",
    );
  });
});

describe("toActiveLabel", () => {
  it("names both states", () => {
    expect(toActiveLabel(true)).toBe("Active");
    expect(toActiveLabel(false)).toBe("Unsubscribed");
  });
});

describe("toActiveTone", () => {
  it("keeps unsubscribed rows quiet", () => {
    expect(toActiveTone(true)).toBe("live");
    expect(toActiveTone(false)).toBe("quiet");
  });
});

describe("toSubscriberRow", () => {
  it("flattens the payload into one row", () => {
    expect(toSubscriberRow(buildSubscriber())).toEqual({
      id: 3,
      email: "ira@example.com",
      accountLabel: "Yes",
      subscribedLabel: "Tue, 1 Sept, 2026",
      unsubscribedLabel: "—",
      isActive: true,
    });
  });
});

describe("applyContactPatch", () => {
  const rows = [buildContactRow({ id: 1 }), buildContactRow({ id: 2 })];

  it("flips one row without touching the rest", () => {
    const next = applyContactPatch(rows, { kind: "read", id: 2, isRead: true });
    expect(next[0].isRead).toBe(false);
    expect(next[1].isRead).toBe(true);
  });

  it("drops a deleted row", () => {
    const next = applyContactPatch(rows, { kind: "remove", id: 2 });
    expect(next.map((row) => row.id)).toEqual([1]);
  });
});

describe("applySubscriberPatch", () => {
  it("marks only the matching email inactive", () => {
    const rows = [
      buildSubscriberRow({ email: "ira@example.com" }),
      buildSubscriberRow({ email: "raj@example.com" }),
    ];
    const next = applySubscriberPatch(rows, { email: "raj@example.com" });
    expect(next[0].isActive).toBe(true);
    expect(next[1].isActive).toBe(false);
  });
});

describe("toIsRead", () => {
  it("maps the filter onto a boolean", () => {
    expect(toIsRead("read")).toBe(true);
    expect(toIsRead("unread")).toBe(false);
    expect(toIsRead("both")).toBeUndefined();
    expect(toIsRead(undefined)).toBeUndefined();
  });
});

describe("toIsActive", () => {
  it("maps the filter onto a boolean", () => {
    expect(toIsActive("active")).toBe(true);
    expect(toIsActive("unsubscribed")).toBe(false);
    expect(toIsActive(undefined)).toBeUndefined();
  });
});

describe("toContactFilter", () => {
  it("asks for the page and nothing else when the URL is bare", () => {
    expect(toContactFilter({}, 1)).toEqual({ page: 1, limit: 20 });
  });

  it("carries the readable filters through", () => {
    expect(toContactFilter({ search: "  glaze ", read: "unread" }, 2)).toEqual({
      page: 2,
      limit: 20,
      search: "glaze",
      is_read: false,
    });
  });
});

describe("toSubscribersFilter", () => {
  it("reads its own keys and ignores the message search", () => {
    expect(
      toSubscribersFilter(
        { search: "glaze", subscriber_search: " ira ", active: "unsubscribed" },
        3,
      ),
    ).toEqual({
      page: 3,
      limit: 50,
      search: "ira",
      is_active: false,
    });
  });
});

describe("toSubscribersExportFilter", () => {
  it("drops pagination so the whole filtered list comes back", () => {
    expect(
      toSubscribersExportFilter({
        subscriber_search: "ira",
        active: "active",
        page: "4",
      }),
    ).toEqual({ search: "ira", is_active: true });
  });

  it("is empty when nothing is filtered", () => {
    expect(toSubscribersExportFilter({})).toEqual({});
  });
});

describe("toSubscribersCsvName", () => {
  it("stamps the file with the studio's day", () => {
    expect(toSubscribersCsvName(new Date("2026-09-14T04:00:00.000Z"))).toBe(
      "subscribers-2026-09-14.csv",
    );
  });

  it("rolls over with Indian time, not UTC", () => {
    expect(toSubscribersCsvName(new Date("2026-09-14T20:00:00.000Z"))).toBe(
      "subscribers-2026-09-15.csv",
    );
  });
});
