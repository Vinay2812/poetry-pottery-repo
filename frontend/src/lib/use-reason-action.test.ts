import { act, renderHook, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  type ReasonInput,
  type ReasonPolicy,
  useReasonAction,
} from "./use-reason-action";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

type Move = "publish" | "cancel" | "ship";

const POLICIES: Record<Move, ReasonPolicy> = {
  publish: "none",
  cancel: "required",
  ship: "optional",
};

function renderReason(
  run: (input: ReasonInput<Move>) => Promise<string>,
  onSuccess?: (result: string, input: ReasonInput<Move>) => void,
) {
  return renderHook(() =>
    useReasonAction<Move, Promise<string>>({
      run,
      policy: (move) => POLICIES[move],
      requiredMessage: (move) => `Say why this is being ${move}led`,
      messages: { success: (input) => `Done: ${input.target}` },
      onSuccess,
    }),
  );
}

describe("useReasonAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("runs a move that needs no reason straight away, without a dialog", async () => {
    const run = vi.fn(async () => "ok");
    const { result } = renderReason(run);

    act(() => result.current.start("publish"));

    expect(result.current.target).toBeNull();
    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(run).toHaveBeenCalledWith({ target: "publish", reason: null });
    expect(toast.success).toHaveBeenCalledWith("Done: publish");
  });

  it("opens the dialog with a clean slate and trims what was typed", async () => {
    const run = vi.fn(async () => "ok");
    const onSuccess = vi.fn();
    const { result } = renderReason(run, onSuccess);

    act(() => result.current.start("ship"));
    expect(result.current.target).toBe("ship");
    expect(result.current.reason).toBe("");
    expect(result.current.error).toBeUndefined();

    act(() => result.current.setReason("  Delhivery 7712445901  "));
    act(() => result.current.confirm());

    await waitFor(() => expect(result.current.target).toBeNull());
    expect(run).toHaveBeenCalledWith({
      target: "ship",
      reason: "Delhivery 7712445901",
    });
    expect(onSuccess).toHaveBeenCalledWith("ok", {
      target: "ship",
      reason: "Delhivery 7712445901",
    });
    expect(result.current.reason).toBe("");
  });

  it("sends null for an optional reason left blank or whitespace", async () => {
    const run = vi.fn(async () => "ok");
    const { result } = renderReason(run);

    act(() => result.current.start("ship"));
    act(() => result.current.setReason("   "));
    act(() => result.current.confirm());

    await waitFor(() => expect(result.current.target).toBeNull());
    expect(run).toHaveBeenCalledWith({ target: "ship", reason: null });
  });

  it("refuses a required reason that is only whitespace, inline, and clears the error on typing", () => {
    const run = vi.fn(async () => "ok");
    const { result } = renderReason(run);

    act(() => result.current.start("cancel"));
    act(() => result.current.setReason("   "));
    act(() => result.current.confirm());

    expect(run).not.toHaveBeenCalled();
    expect(result.current.target).toBe("cancel");
    expect(result.current.error).toBe("Say why this is being cancelled");

    act(() => result.current.setReason("The kiln cracked"));
    expect(result.current.error).toBeUndefined();
  });

  it("keeps the dialog open and the text intact when the write is refused", async () => {
    const run = vi.fn(async () => {
      throw new Error("That order already left");
    });
    const onSuccess = vi.fn();
    const { result } = renderReason(run, onSuccess);

    act(() => result.current.start("cancel"));
    act(() => result.current.setReason("The kiln cracked"));
    act(() => result.current.confirm());

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(toast.error).toHaveBeenCalledWith("That order already left");
    expect(result.current.target).toBe("cancel");
    expect(result.current.reason).toBe("The kiln cracked");
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("marks the target in flight and closes only once the write lands", async () => {
    let finish!: (value: string) => void;
    const run = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          finish = resolve;
        }),
    );
    const { result } = renderReason(run);

    act(() => result.current.start("cancel"));
    act(() => result.current.setReason("Sold out"));
    act(() => result.current.confirm());

    await waitFor(() => expect(result.current.isPending).toBe(true));
    expect(result.current.target).toBe("cancel");
    expect(result.current.pending).toBe("cancel");

    await act(async () => finish("ok"));
    await waitFor(() => expect(result.current.target).toBeNull());
    expect(result.current.pending).toBeNull();
  });

  it("leaves a dialog opened for another move meanwhile alone when the first write lands", async () => {
    let finish!: (value: string) => void;
    const run = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          finish = resolve;
        }),
    );
    const { result } = renderReason(run);

    act(() => result.current.start("cancel"));
    act(() => result.current.setReason("Sold out"));
    act(() => result.current.confirm());
    await waitFor(() => expect(result.current.isPending).toBe(true));

    act(() => result.current.start("ship"));
    act(() => result.current.setReason("Tracking 42"));
    await act(async () => finish("ok"));

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.target).toBe("ship");
    expect(result.current.reason).toBe("Tracking 42");
  });

  it("closing by hand discards the text", () => {
    const { result } = renderReason(vi.fn(async () => "ok"));

    act(() => result.current.start("ship"));
    act(() => result.current.setReason("half typed"));
    act(() => result.current.close());

    expect(result.current.target).toBeNull();
    expect(result.current.reason).toBe("");
  });
});
