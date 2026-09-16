import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
  it("joins class names in the order they are given", () => {
    expect(cn("px-4", "text-sm")).toBe("px-4 text-sm");
  });

  it("drops the falsy branches so a conditional class can be inlined", () => {
    expect(cn("px-4", false && "hidden", undefined, null, "")).toBe("px-4");
    expect(cn(["gap-2", { invisible: true, "sr-only": false }])).toBe(
      "gap-2 invisible",
    );
  });

  it("lets the last class win when two fight over the same property", () => {
    expect(cn("px-4", "px-8")).toBe("px-8");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
    expect(cn("rounded-none", "rounded-full")).toBe("rounded-full");
  });

  it("keeps classes that only look alike", () => {
    expect(cn("px-4", "py-8")).toBe("px-4 py-8");
  });

  it("has nothing to say when it is given nothing", () => {
    expect(cn()).toBe("");
  });
});
