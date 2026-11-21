import { describe, expect, it } from "vitest";

import { commissionSchema, EMPTY_COMMISSION_FORM } from "./commission";

const brief = {
  ...EMPTY_COMMISSION_FORM,
  pieceType: "Mugs",
  size: "Short (150 ml)",
  glaze: "Forest Green",
  name: "Asha",
  email: "asha@example.com",
};

function sizeIssue(size: string): string | undefined {
  const result = commissionSchema.safeParse({ ...brief, size });
  return result.success
    ? undefined
    : result.error.issues.find((issue) => issue.path[0] === "size")?.message;
}

describe("commissionSchema size", () => {
  it("accepts a typed size up to the API's 60 characters", () => {
    expect(sizeIssue("a".repeat(60))).toBeUndefined();
  });

  it("rejects a longer size inline instead of after sending", () => {
    expect(sizeIssue("a".repeat(61))).toBe(
      "Size must be 60 characters or fewer",
    );
  });

  it("asks for a size when none is given", () => {
    expect(sizeIssue("   ")).toBe("Tell us the size");
  });
});
