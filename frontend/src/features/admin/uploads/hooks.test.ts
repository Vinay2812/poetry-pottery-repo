import { afterEach, describe, expect, it, vi } from "vitest";

import { putToStorage, UPLOAD_NOT_STORED } from "./hooks";

const BLOB = new Blob(["x"], { type: "image/jpeg" });

function mockFetch(result: Promise<unknown>): void {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => result),
  );
}

describe("putToStorage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("puts the blob at the signed url with its own content type", async () => {
    mockFetch(Promise.resolve({ ok: true }));

    await expect(
      putToStorage("https://bucket.test/key", BLOB, "image/png"),
    ).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith("https://bucket.test/key", {
      method: "PUT",
      body: BLOB,
      headers: { "content-type": "image/png" },
    });
  });

  it("says the image did not land when the bucket refuses it", async () => {
    mockFetch(Promise.resolve({ ok: false }));

    await expect(
      putToStorage("https://bucket.test/key", BLOB, "image/jpeg"),
    ).rejects.toThrow(UPLOAD_NOT_STORED);
  });

  // Offline, blocked or CORS-rejected, the browser throws "Failed to fetch"; that is not an answer.
  it("says the same when the request never reaches the bucket", async () => {
    mockFetch(Promise.reject(new TypeError("Failed to fetch")));

    await expect(
      putToStorage("https://bucket.test/key", BLOB, "image/jpeg"),
    ).rejects.toThrow(UPLOAD_NOT_STORED);
  });
});
