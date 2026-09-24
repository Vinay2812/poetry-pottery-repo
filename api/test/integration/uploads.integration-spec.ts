import { UploadPurpose } from "@prisma/client";
import sharp from "sharp";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type { UploadTarget } from "@/storage/storage.service";
import {
  MAX_UNCLAIMED_PER_OWNER,
  NOT_OWN_UPLOAD,
} from "@/uploads/uploads.service";
import { UploadPurpose as ConsolePurpose } from "@/uploads/uploads.type";
import {
  createHarness,
  deliverProduct,
  type Harness,
  makeProduct,
  makeUsers,
  QueueRecorder,
  resetData,
  StorageRecorder,
} from "./harness";

const storage = new StorageRecorder();
const queue = new QueueRecorder();

function squarePng(side: number): Promise<Buffer> {
  return sharp({
    create: {
      width: side,
      height: side,
      channels: 3,
      background: { r: 200, g: 190, b: 175 },
    },
  })
    .png()
    .toBuffer();
}

describe("the upload lifecycle", () => {
  let harness: Harness;

  beforeAll(async () => {
    harness = await createHarness({ storage, queue });
  });

  afterAll(async () => {
    await harness.close();
  });

  beforeEach(async () => {
    await resetData(harness.prisma);
    storage.reset();
    queue.reset();
  });

  // A presign followed by the browser's PUT: the object is in the bucket, the row is unclaimed.
  async function upload(
    ownerId: number,
    purpose: UploadPurpose,
    body: Buffer = Buffer.from("jpeg bytes"),
  ): Promise<UploadTarget> {
    const target = await harness.uploads.issue(ownerId, purpose, {
      filename: "a.jpg",
      content_type: "image/jpeg",
      size: body.byteLength,
    });
    storage.objects.set(target.key, body);
    return target;
  }

  function claimedAt(key: string): Promise<Date | null> {
    return harness.prisma.upload
      .findUniqueOrThrow({ where: { key }, select: { claimed_at: true } })
      .then((row) => row.claimed_at);
  }

  function rowCount(key: string): Promise<number> {
    return harness.prisma.upload.count({ where: { key } });
  }

  it("issues a row and a delayed expiry, claims it for its owner and deletes it once released, for each storefront purpose", async () => {
    const [owner] = await makeUsers(harness.prisma, 1);
    if (!owner) throw new Error("no user");

    for (const purpose of [UploadPurpose.REVIEW, UploadPurpose.REFERENCE]) {
      const target = await upload(owner.id, purpose);
      expect(queue.keysFor("upload.expire")).toContain(target.key);
      expect(queue.leaked).toEqual([]);
      expect(await claimedAt(target.key)).toBeNull();

      await harness.prisma.withTransaction(() =>
        harness.uploads.claim(owner.id, purpose, [target.public_url]),
      );
      expect(await claimedAt(target.key)).not.toBeNull();

      await harness.uploads.release([target.public_url]);
      expect(await rowCount(target.key)).toBe(0);
      expect(queue.keysFor("storage.delete-object")).toContain(target.key);
    }
  });

  it("verifies a console image against its spec, claims it when a form saves it and never releases it", async () => {
    const [admin] = await makeUsers(harness.prisma, 1);
    if (!admin) throw new Error("no user");
    const good = await upload(
      admin.id,
      UploadPurpose.PRODUCT,
      await squarePng(1000),
    );
    const small = await upload(
      admin.id,
      UploadPurpose.PRODUCT,
      await squarePng(300),
    );
    const unconfirmed = await upload(admin.id, UploadPurpose.PRODUCT);

    // The wrong purpose is refused before the bytes are read; the wrong size is deleted outright.
    await expect(
      harness.uploads.confirm(good.key, ConsolePurpose.EVENT),
    ).rejects.toThrow("does not belong to this purpose");
    await expect(
      harness.uploads.confirm(small.key, ConsolePurpose.PRODUCT),
    ).rejects.toThrow("at least 1000");
    expect(storage.deleted).toEqual([small.key]);
    expect(await rowCount(small.key)).toBe(0);

    const confirmed = await harness.uploads.confirm(
      good.key,
      ConsolePurpose.PRODUCT,
    );
    expect(confirmed).toMatchObject({ width: 1000, height: 1000 });
    expect(await claimedAt(good.key)).toBeNull();

    await expect(
      harness.uploads.claimConfirmed(
        [unconfirmed.public_url],
        [],
        ConsolePurpose.PRODUCT,
      ),
    ).rejects.toThrow("never confirmed");
    await expect(
      harness.uploads.claimConfirmed(
        [good.public_url],
        [],
        ConsolePurpose.EVENT,
      ),
    ).rejects.toThrow("never confirmed");
    await harness.uploads.claimConfirmed(
      [good.public_url],
      [],
      ConsolePurpose.PRODUCT,
    );
    expect(await claimedAt(good.key)).not.toBeNull();

    await harness.uploads.release([good.public_url]);
    expect(await rowCount(good.key)).toBe(1);
    expect(queue.keysFor("storage.delete-object")).toEqual([]);
  });

  it("expires an unclaimed upload and leaves a claimed one alone, whatever its purpose", async () => {
    const [owner] = await makeUsers(harness.prisma, 1);
    if (!owner) throw new Error("no user");

    for (const purpose of [
      UploadPurpose.REVIEW,
      UploadPurpose.REFERENCE,
      UploadPurpose.PRODUCT,
    ]) {
      const abandoned = await upload(owner.id, purpose);
      const kept = await upload(owner.id, purpose);
      await harness.uploads.claim(owner.id, purpose, [kept.public_url]);

      await expect(harness.uploads.expire(abandoned.key)).resolves.toBe(true);
      await expect(harness.uploads.expire(kept.key)).resolves.toBe(false);

      expect(await rowCount(abandoned.key)).toBe(0);
      expect(storage.deleted).toContain(abandoned.key);
      expect(await rowCount(kept.key)).toBe(1);
      expect(storage.deleted).not.toContain(kept.key);
    }
  });

  it("keeps an expiring upload's row when the bucket refuses, so the retry can finish it", async () => {
    const [owner] = await makeUsers(harness.prisma, 1);
    if (!owner) throw new Error("no user");
    const abandoned = await upload(owner.id, UploadPurpose.REVIEW);

    storage.refuseNextDelete = true;
    await expect(harness.uploads.expire(abandoned.key)).rejects.toThrow(
      "bucket refused",
    );
    expect(await rowCount(abandoned.key)).toBe(1);

    await expect(harness.uploads.expire(abandoned.key)).resolves.toBe(true);
    expect(await rowCount(abandoned.key)).toBe(0);
    expect(storage.deleted).toContain(abandoned.key);
  });

  it("refuses to claim someone else's photo, or one issued for another purpose", async () => {
    const [owner, stranger] = await makeUsers(harness.prisma, 2);
    if (!owner || !stranger) throw new Error("no users");
    const photo = await upload(owner.id, UploadPurpose.REVIEW);

    await expect(
      harness.uploads.claim(stranger.id, UploadPurpose.REVIEW, [
        photo.public_url,
      ]),
    ).rejects.toThrow(NOT_OWN_UPLOAD);
    await expect(
      harness.uploads.claim(owner.id, UploadPurpose.REFERENCE, [
        photo.public_url,
      ]),
    ).rejects.toThrow(NOT_OWN_UPLOAD);
    await expect(
      harness.uploads.claim(owner.id, UploadPurpose.REVIEW, [
        "https://evil.test/a.jpg",
      ]),
    ).rejects.toThrow(NOT_OWN_UPLOAD);

    expect(await claimedAt(photo.key)).toBeNull();
  });

  it("leaves an upload unclaimed when the claiming transaction rolls back", async () => {
    const [owner] = await makeUsers(harness.prisma, 1);
    if (!owner) throw new Error("no user");
    const photo = await upload(owner.id, UploadPurpose.REVIEW);

    await expect(
      harness.prisma.withTransaction(async () => {
        await harness.uploads.claim(owner.id, UploadPurpose.REVIEW, [
          photo.public_url,
        ]);
        throw new Error("kiln fire");
      }),
    ).rejects.toThrow("kiln fire");

    expect(await claimedAt(photo.key)).toBeNull();
  });

  it("caps how many photos one person can leave waiting", async () => {
    const [owner] = await makeUsers(harness.prisma, 1);
    if (!owner) throw new Error("no user");

    for (let index = 0; index < MAX_UNCLAIMED_PER_OWNER; index += 1) {
      await upload(owner.id, UploadPurpose.REFERENCE);
    }

    await expect(upload(owner.id, UploadPurpose.REFERENCE)).rejects.toThrow(
      "waiting to be used",
    );
    // The cap is per purpose, so a review photo still goes through.
    await expect(upload(owner.id, UploadPurpose.REVIEW)).resolves.toBeDefined();
  });

  it("frees the cap from photos whose expiry job was lost, and never caps the console", async () => {
    const [owner] = await makeUsers(harness.prisma, 1);
    if (!owner) throw new Error("no user");
    const keys: string[] = [];
    for (let index = 0; index < MAX_UNCLAIMED_PER_OWNER; index += 1) {
      keys.push((await upload(owner.id, UploadPurpose.REFERENCE)).key);
    }
    // Aged past the expiry window without the job ever running.
    await harness.prisma.upload.updateMany({
      where: { key: { in: keys } },
      data: { created_at: new Date(Date.now() - 26 * 60 * 60 * 1000) },
    });

    await expect(
      upload(owner.id, UploadPurpose.REFERENCE),
    ).resolves.toBeDefined();
    for (const key of keys) {
      expect(await rowCount(key)).toBe(0);
      expect(storage.deleted).toContain(key);
    }

    for (let index = 0; index <= MAX_UNCLAIMED_PER_OWNER; index += 1) {
      await expect(
        upload(owner.id, UploadPurpose.EVENT),
      ).resolves.toBeDefined();
    }
  });

  it("releases a cart line's photos only once no other line or order item holds them", async () => {
    const piece = await makeProduct(harness.prisma, {
      stock: 5,
      is_customizable: true,
    });
    const [buyer] = await makeUsers(harness.prisma, 1);
    if (!buyer) throw new Error("no user");
    const shared = await upload(buyer.id, UploadPurpose.REFERENCE);
    const single = await upload(buyer.id, UploadPurpose.REFERENCE);

    // Two lines of the same piece: one carries both photos, the other only the shared one.
    await harness.cart.add(buyer.id, {
      product_id: piece.id,
      quantity: 1,
      reference_image_urls: [shared.public_url, single.public_url],
    });
    await harness.cart.add(buyer.id, {
      product_id: piece.id,
      quantity: 1,
      reference_image_urls: [shared.public_url],
    });
    const lines = await harness.prisma.cartItem.findMany({
      where: { user_id: buyer.id },
      orderBy: { id: "asc" },
    });
    expect(lines).toHaveLength(2);
    expect(await claimedAt(shared.key)).not.toBeNull();

    await harness.cart.remove(buyer.id, lines[0]?.id ?? 0);
    expect(queue.keysFor("storage.delete-object")).toEqual([single.key]);
    expect(await rowCount(shared.key)).toBe(1);

    // Checkout moves the photo onto the order item, so converting the line keeps it.
    await harness.orders.place(buyer.id, { address_id: buyer.address_id });
    expect(await harness.prisma.cartItem.count()).toBe(0);
    expect(queue.keysFor("storage.delete-object")).toEqual([single.key]);
    expect(await rowCount(shared.key)).toBe(1);

    // Back in the cart with the same photo and a fresh one; clearing lets go of the fresh one only.
    const fresh = await upload(buyer.id, UploadPurpose.REFERENCE);
    await harness.cart.add(buyer.id, {
      product_id: piece.id,
      quantity: 1,
      reference_image_urls: [shared.public_url, fresh.public_url],
    });
    await harness.cart.clear(buyer.id);
    expect(queue.keysFor("storage.delete-object")).toEqual([
      single.key,
      fresh.key,
    ]);
    expect(await rowCount(shared.key)).toBe(1);
    expect(queue.leaked).toEqual([]);
  });

  it("never deletes a photo that a racing checkout moved onto an order", async () => {
    const piece = await makeProduct(harness.prisma, {
      stock: 5,
      is_customizable: true,
    });
    const [buyer] = await makeUsers(harness.prisma, 1);
    if (!buyer) throw new Error("no user");
    const photo = await upload(buyer.id, UploadPurpose.REFERENCE);
    await harness.cart.add(buyer.id, {
      product_id: piece.id,
      quantity: 1,
      reference_image_urls: [photo.public_url],
    });
    const line = await harness.prisma.cartItem.findFirstOrThrow({
      where: { user_id: buyer.id },
    });
    queue.reset();

    // Checkout pauses right after reading the cart, and the line is removed in that gap.
    let resume = (): void => {};
    const paused = new Promise<void>((resolve) => {
      resume = resolve;
    });
    let hasRead = (): void => {};
    const read = new Promise<void>((resolve) => {
      hasRead = resolve;
    });
    const readCart = harness.cart.get.bind(harness.cart);
    const spy = vi
      .spyOn(harness.cart, "get")
      .mockImplementationOnce(async (userId) => {
        const cart = await readCart(userId);
        hasRead();
        await paused;
        return cart;
      });

    const checkout = harness.orders.place(buyer.id, {
      address_id: buyer.address_id,
    });
    await read;
    const removal = harness.cart.remove(buyer.id, line.id);
    await new Promise((resolve) => setTimeout(resolve, 300));
    resume();
    await Promise.allSettled([checkout, removal]);
    spy.mockRestore();

    expect(
      await harness.prisma.order.count({ where: { user_id: buyer.id } }),
    ).toBe(1);
    expect(queue.keysFor("storage.delete-object")).not.toContain(photo.key);
    expect(await rowCount(photo.key)).toBe(1);
  });

  it("lets a review drop, swap and finally lose its photos", async () => {
    const piece = await makeProduct(harness.prisma);
    const [reviewer] = await makeUsers(harness.prisma, 1);
    if (!reviewer) throw new Error("no user");
    await deliverProduct(harness.prisma, [reviewer], piece.id);
    const first = await upload(reviewer.id, UploadPurpose.REVIEW);
    const second = await upload(reviewer.id, UploadPurpose.REVIEW);

    const review = await harness.reviews.create(
      { product_id: piece.id },
      reviewer.id,
      { rating: 5, image_urls: [first.public_url, second.public_url] },
    );
    expect(await claimedAt(first.key)).not.toBeNull();
    expect(await claimedAt(second.key)).not.toBeNull();

    await harness.reviews.update(review.id, reviewer.id, {
      rating: 4,
      image_urls: [first.public_url],
    });
    expect(queue.keysFor("storage.delete-object")).toEqual([second.key]);
    expect(await rowCount(first.key)).toBe(1);

    await harness.reviews.remove(review.id, reviewer.id);
    expect(queue.keysFor("storage.delete-object")).toEqual([
      second.key,
      first.key,
    ]);
    expect(await rowCount(first.key)).toBe(0);
  });

  it("claims a brief's photos for the sender and refuses a stranger's", async () => {
    const [sender, stranger] = await makeUsers(harness.prisma, 2);
    if (!sender || !stranger) throw new Error("no users");
    const own = await upload(sender.id, UploadPurpose.REFERENCE);
    const theirs = await upload(stranger.id, UploadPurpose.REFERENCE);
    const brief = {
      piece_type: "Mug",
      size: "Medium",
      glaze: "Sage",
      name: "Maya",
      email: "maya@example.test",
    };

    await expect(
      harness.commissions.create(
        { ...brief, reference_image_urls: [theirs.public_url] },
        sender.id,
      ),
    ).rejects.toThrow(NOT_OWN_UPLOAD);
    expect(await harness.prisma.commissionRequest.count()).toBe(0);

    await harness.commissions.create(
      { ...brief, reference_image_urls: [own.public_url] },
      sender.id,
    );
    expect(await claimedAt(own.key)).not.toBeNull();
    // A brief is never deleted, so its photo stays even when asked to let go.
    await harness.uploads.release([own.public_url]);
    expect(await rowCount(own.key)).toBe(1);
  });
});
