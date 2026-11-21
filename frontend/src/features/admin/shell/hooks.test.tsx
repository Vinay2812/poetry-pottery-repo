import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { isBackGuardState } from "./types";
import { useBackGuard } from "./hooks";

const { routerMock } = vi.hoisted(() => ({
  routerMock: { push: vi.fn(), replace: vi.fn() },
}));

vi.mock("next/navigation", () => ({ useRouter: () => routerMock }));

function renderGuard(onBackAttempt: (() => void) | null) {
  return renderHook(
    ({ onBack }: { onBack: (() => void) | null }) => useBackGuard(onBack),
    { initialProps: { onBack: onBackAttempt } },
  );
}

describe("useBackGuard", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/dashboard/pieces/4");
    routerMock.push.mockReset();
    routerMock.replace.mockReset();
  });

  afterEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("puts a spare entry for the same page on top while the draft is unsaved", () => {
    const before = window.history.length;
    renderGuard(vi.fn());

    expect(window.history.length).toBe(before + 1);
    expect(isBackGuardState(window.history.state)).toBe(true);
    expect(window.location.pathname).toBe("/dashboard/pieces/4");
  });

  it("asks instead of leaving when Back steps off the spare entry", async () => {
    const onBack = vi.fn();
    renderGuard(onBack);

    act(() => window.history.back());

    await waitFor(() => expect(onBack).toHaveBeenCalledTimes(1));
    expect(window.location.pathname).toBe("/dashboard/pieces/4");
  });

  it("puts the spare entry back before asking, so Keep editing leaves it in place", async () => {
    const onBack = vi.fn();
    const { result } = renderGuard(onBack);
    act(() => window.history.back());
    await waitFor(() => expect(onBack).toHaveBeenCalled());
    expect(isBackGuardState(window.history.state)).toBe(true);

    const length = window.history.length;
    act(() => result.current.stay());
    expect(isBackGuardState(window.history.state)).toBe(true);
    expect(window.history.length).toBe(length);
  });

  it("asks again on a second Back while the dialog is open, never leaving the page", async () => {
    const onBack = vi.fn();
    renderGuard(onBack);

    act(() => window.history.back());
    await waitFor(() => expect(onBack).toHaveBeenCalledTimes(1));
    act(() => window.history.back());
    await waitFor(() => expect(onBack).toHaveBeenCalledTimes(2));

    expect(window.location.pathname).toBe("/dashboard/pieces/4");
    expect(isBackGuardState(window.history.state)).toBe(true);
  });

  it("steps past the spare entry and this page once Leave is chosen", async () => {
    const onBack = vi.fn();
    const go = vi.spyOn(window.history, "go");
    const { result } = renderGuard(onBack);
    act(() => window.history.back());
    await waitFor(() => expect(onBack).toHaveBeenCalled());

    act(() => result.current.leaveBack());
    expect(go).toHaveBeenCalledWith(-2);
    go.mockRestore();
  });

  it("replaces the spare entry when leaving for a link, so the page is not in history twice", () => {
    const { result } = renderGuard(vi.fn());

    act(() => result.current.leaveTo("/dashboard/pieces"));
    expect(routerMock.replace).toHaveBeenCalledWith("/dashboard/pieces");
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it("adds nothing to history while the draft is clean", () => {
    const before = window.history.length;
    const { result } = renderGuard(null);

    expect(window.history.length).toBe(before);
    act(() => result.current.leaveTo("/dashboard/pieces"));
    expect(routerMock.push).toHaveBeenCalledWith("/dashboard/pieces");
  });
});
