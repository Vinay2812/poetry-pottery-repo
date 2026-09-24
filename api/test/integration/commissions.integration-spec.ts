import { UploadPurpose } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { CommissionRequestInput } from "@/features/commissions/commissions.type";
import { NOT_OWN_UPLOAD } from "@/uploads/uploads.service";
import {
  createHarness,
  type Harness,
  MailRecorder,
  makeUsers,
  resetData,
} from "./harness";

function brief(
  overrides: Partial<CommissionRequestInput> = {},
): CommissionRequestInput {
  return {
    piece_type: "Mug",
    size: "Medium",
    glaze: "Sage",
    carved_words: "for Maya",
    notes: "Something to hold a morning coffee",
    name: "Maya",
    email: "  Maya@Example.test ",
    phone: "+91 91234-56789",
    reference_image_urls: [],
    ...overrides,
  };
}

describe("commission briefs", () => {
  let harness: Harness;
  const mail = new MailRecorder();

  beforeAll(async () => {
    harness = await createHarness({ mail });
  });

  afterAll(async () => {
    await harness.close();
  });

  beforeEach(async () => {
    await resetData(harness.prisma);
    mail.reset();
  });

  function photoFor(userId: number): Promise<string> {
    return harness.uploads
      .issue(userId, UploadPurpose.REFERENCE, {
        filename: "reference.jpg",
        content_type: "image/jpeg",
        size: 1024,
      })
      .then((target) => target.public_url);
  }

  it("files the brief, claims its photos and writes back to the sender", async () => {
    const [sender] = await makeUsers(harness.prisma, 1);
    if (!sender) throw new Error("no user");

    const photo = await photoFor(sender.id);
    const request = await harness.commissions.create(
      brief({ reference_image_urls: [photo] }),
      sender.id,
    );

    expect(request.email).toBe("maya@example.test");
    expect(request.phone).toBe("9123456789");
    expect(request.reference_image_urls).toEqual([photo]);
    const claimed = await harness.prisma.upload.count({
      where: { owner_id: sender.id, claimed_at: { not: null } },
    });
    expect(claimed).toBe(1);
    expect(mail.to("maya@example.test")).toHaveLength(1);
  });

  it("takes a brief from someone who is not signed in", async () => {
    const request = await harness.commissions.create(brief(), null);

    const row = await harness.prisma.commissionRequest.findUniqueOrThrow({
      where: { id: request.id },
    });
    expect(row.user_id).toBeNull();
  });

  it("refuses a photo someone else uploaded, and any photo on a guest brief", async () => {
    const [sender, other] = await makeUsers(harness.prisma, 2);
    if (!sender || !other) throw new Error("no users");
    const theirs = brief({ reference_image_urls: [await photoFor(other.id)] });

    await expect(harness.commissions.create(theirs, sender.id)).rejects.toThrow(
      NOT_OWN_UPLOAD,
    );
    await expect(harness.commissions.create(theirs, null)).rejects.toThrow(
      "Reference photos must be uploaded through the studio",
    );
    expect(await harness.prisma.commissionRequest.count()).toBe(0);
    expect(mail.sent).toEqual([]);
  });

  it("refuses a reference photo that is not in the studio bucket", async () => {
    await expect(
      harness.commissions.create(
        brief({ reference_image_urls: ["https://evil.test/a.jpg"] }),
        null,
      ),
    ).rejects.toThrow("Reference photos must be uploaded through the studio");
    expect(await harness.prisma.commissionRequest.count()).toBe(0);
    expect(mail.sent).toEqual([]);
  });

  it("refuses a brief with nothing to reply to", async () => {
    await expect(
      harness.commissions.create(brief({ email: "maya@" }), null),
    ).rejects.toThrow("Enter a valid email address");
    await expect(
      harness.commissions.create(brief({ phone: "12345" }), null),
    ).rejects.toThrow("Enter a valid 10-digit phone number");
    expect(await harness.prisma.commissionRequest.count()).toBe(0);
  });
});
