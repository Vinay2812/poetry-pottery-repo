import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { CommissionRequestInput } from "@/features/commissions/commissions.type";
import {
  createHarness,
  type Harness,
  MailRecorder,
  makeUsers,
  PendingUploadsRecorder,
  resetData,
  STUDIO_CDN,
} from "./harness";

const PHOTO = `${STUDIO_CDN}/commissions/reference.jpg`;

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
    reference_image_urls: [PHOTO],
    ...overrides,
  };
}

describe("commission briefs", () => {
  let harness: Harness;
  const mail = new MailRecorder();
  const uploads = new PendingUploadsRecorder();

  beforeAll(async () => {
    harness = await createHarness({ mail, uploads });
  });

  afterAll(async () => {
    await harness.close();
  });

  beforeEach(async () => {
    await resetData(harness.prisma);
    mail.reset();
    uploads.reset();
  });

  it("files the brief, keeps its photos and writes back to the sender", async () => {
    const [sender] = await makeUsers(harness.prisma, 1);
    if (!sender) throw new Error("no user");

    const request = await harness.commissions.create(brief(), sender.id);

    expect(request.email).toBe("maya@example.test");
    expect(request.phone).toBe("9123456789");
    expect(request.reference_image_urls).toEqual([PHOTO]);
    expect(uploads.kept).toEqual([{ userId: sender.id, urls: [PHOTO] }]);
    expect(mail.to("maya@example.test")).toHaveLength(1);
  });

  it("takes a brief from someone who is not signed in", async () => {
    const request = await harness.commissions.create(brief(), null);

    const row = await harness.prisma.commissionRequest.findUniqueOrThrow({
      where: { id: request.id },
    });
    expect(row.user_id).toBeNull();
    // Nothing is claimed out of the sweep for a visitor with no account to claim it for.
    expect(uploads.kept).toEqual([]);
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
