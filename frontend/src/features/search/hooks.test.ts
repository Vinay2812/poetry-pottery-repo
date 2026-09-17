import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDebouncedTerm } from "./hooks";

describe("useDebouncedTerm", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("holds the term back until typing pauses", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedTerm(value, 200),
      { initialProps: { value: "" } },
    );

    rerender({ value: "s" });
    rerender({ value: "sa" });
    rerender({ value: "sag" });
    expect(result.current).toBe("");

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("sag");
  });

  it("trims the term it hands on", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedTerm(value, 200),
      { initialProps: { value: "" } },
    );

    rerender({ value: "  sage mug  " });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe("sage mug");
  });
});
