import { describe, expect, it } from "vitest";

import {
  centreCrop,
  checkDimensions,
  checkFile,
  describeFileType,
  describeRequirement,
  formatBytes,
  moveUrl,
} from "./types";

const TYPES = ["image/jpeg", "image/png"];
const EIGHT_MB = 8 * 1024 * 1024;

describe("formatBytes", () => {
  it("rounds to whole megabytes once past one", () => {
    expect(formatBytes(EIGHT_MB)).toBe("8 MB");
    expect(formatBytes(120 * 1024)).toBe("120 KB");
  });
});

describe("describeRequirement", () => {
  it("states shape, size and weight in one line", () => {
    expect(describeRequirement("1:1", 1000, 1000, EIGHT_MB)).toBe(
      "1:1 · at least 1000 × 1000 · up to 8 MB",
    );
  });

  it("says any shape when the purpose has no ratio", () => {
    expect(describeRequirement("any", 400, 400, EIGHT_MB)).toBe(
      "Any shape · at least 400 × 400 · up to 8 MB",
    );
  });
});

describe("describeFileType", () => {
  it("names the formats the way people say them", () => {
    expect(describeFileType(TYPES)).toBe("JPEG, PNG");
  });
});

describe("checkFile", () => {
  it("accepts an allowed type under the cap", () => {
    expect(checkFile(TYPES, EIGHT_MB, "image/png", 1024)).toBeNull();
  });

  it("names the offending type", () => {
    expect(checkFile(TYPES, EIGHT_MB, "image/gif", 1024)).toBe(
      "That file is image/gif. Use JPEG, PNG.",
    );
  });

  it("names the offending size", () => {
    expect(checkFile(TYPES, EIGHT_MB, "image/png", EIGHT_MB + 1)).toBe(
      "That file is 8 MB. The limit is 8 MB.",
    );
    expect(checkFile(TYPES, EIGHT_MB, "image/png", 0)).toBe(
      "That file is 0 KB. The limit is 8 MB.",
    );
  });
});

describe("checkDimensions", () => {
  it("passes a square that clears the minimum", () => {
    expect(checkDimensions(1, 1000, 1000, "1:1", 1200, 1200)).toEqual({
      kind: "ok",
    });
  });

  it("allows the same two percent of slack the API allows", () => {
    expect(checkDimensions(1, 1000, 1000, "1:1", 1010, 1000).kind).toBe("ok");
    expect(checkDimensions(1, 1000, 1000, "1:1", 1100, 1000).kind).toBe(
      "wrong-ratio",
    );
  });

  it("reports too small before it reports the ratio", () => {
    expect(checkDimensions(1, 1000, 1000, "1:1", 800, 600)).toEqual({
      kind: "too-small",
      message: "That image is 800 × 600. It has to be at least 1000 × 1000.",
    });
  });

  it("skips the ratio when the purpose has none", () => {
    expect(checkDimensions(null, 400, 400, "any", 900, 400).kind).toBe("ok");
  });
});

describe("centreCrop", () => {
  it("takes a square out of the middle of a landscape photo", () => {
    expect(centreCrop(2000, 1000, 1)).toEqual({
      x: 500,
      y: 0,
      width: 1000,
      height: 1000,
    });
  });

  it("takes a wide band out of the middle of a tall photo", () => {
    expect(centreCrop(1200, 1200, 16 / 9)).toEqual({
      x: 0,
      y: 263,
      width: 1200,
      height: 675,
    });
  });
});

describe("moveUrl", () => {
  it("moves a photo one place up", () => {
    expect(moveUrl(["a", "b", "c"], 1, 0)).toEqual(["b", "a", "c"]);
  });

  it("leaves the order alone at the ends", () => {
    expect(moveUrl(["a", "b"], 0, -1)).toEqual(["a", "b"]);
    expect(moveUrl(["a", "b"], 1, 2)).toEqual(["a", "b"]);
  });
});
