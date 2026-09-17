import { describe, expect, it } from "vitest";

import { STUDIO_NOTE_MAX, studioNoteSchema } from "./order";

describe("studioNoteSchema", () => {
  it("takes a note with something in it", () => {
    expect(
      studioNoteSchema.safeParse({ body: "Out of the kiln this morning." })
        .success,
    ).toBe(true);
  });

  it("refuses an empty note", () => {
    expect(studioNoteSchema.safeParse({ body: "   " }).success).toBe(false);
  });

  it("refuses a note longer than the mail will carry", () => {
    expect(
      studioNoteSchema.safeParse({ body: "a".repeat(STUDIO_NOTE_MAX + 1) })
        .success,
    ).toBe(false);
  });
});
