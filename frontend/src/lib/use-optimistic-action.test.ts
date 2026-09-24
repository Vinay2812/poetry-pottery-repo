import { act, renderHook, waitFor } from "@testing-library/react";
import { useOptimistic } from "react";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useOptimisticAction } from "./use-optimistic-action";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

interface Harness {
  run: ReturnType<typeof vi.fn<(input: number) => Promise<string>>>;
  refresh?: ReturnType<typeof vi.fn<() => Promise<unknown>>>;
  onSuccess?: ReturnType<typeof vi.fn<(result: string, input: number) => void>>;
}

// The hook is exercised through a real `useOptimistic` so the rollback is React's, not a mock's.
function renderAction({ run, refresh, onSuccess }: Harness) {
  return renderHook(() => {
    const [value, patch] = useOptimistic(
      0,
      (_current: number, next: number) => next,
    );
    const action = useOptimisticAction({
      patch,
      run,
      refresh,
      messages: { success: (input) => `Saved ${input}`, failure: "Nope" },
      onSuccess,
    });
    return { value, action };
  });
}

describe("useOptimisticAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("patches, writes, refreshes, then reports success and settles", async () => {
    const run = vi.fn<(input: number) => Promise<string>>(async () => "ok");
    const refresh = vi.fn<() => Promise<unknown>>(async () => ({
      data: {},
    }));
    const onSuccess = vi.fn<(result: string, input: number) => void>();
    const { result } = renderAction({ run, refresh, onSuccess });

    act(() => result.current.action.execute(7));

    await waitFor(() => expect(result.current.action.isPending).toBe(false));
    expect(run).toHaveBeenCalledWith(7);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith("ok", 7);
    expect(toast.success).toHaveBeenCalledWith("Saved 7");
    expect(toast.error).not.toHaveBeenCalled();
    expect(result.current.action.pending).toBeNull();
  });

  it("shows the patch while the write is in flight and marks the row", async () => {
    const write = deferred<string>();
    const run = vi.fn<(input: number) => Promise<string>>(() => write.promise);
    const { result } = renderAction({ run });

    act(() => result.current.action.execute(3));

    await waitFor(() => expect(result.current.value).toBe(3));
    expect(result.current.action.isPending).toBe(true);
    expect(result.current.action.pending).toBe(3);

    await act(async () => write.resolve("ok"));
    await waitFor(() => expect(result.current.action.isPending).toBe(false));
  });

  it("rolls back, toasts the server's sentence and leaves the editor to the caller on a refused write", async () => {
    const run = vi.fn<(input: number) => Promise<string>>(async () => {
      throw new Error("BadRequestException: That name is taken");
    });
    const refresh = vi.fn<() => Promise<unknown>>(async () => ({}));
    const onSuccess = vi.fn<(result: string, input: number) => void>();
    const { result } = renderAction({ run, refresh, onSuccess });

    act(() => result.current.action.execute(5));

    await waitFor(() => expect(result.current.action.isPending).toBe(false));
    expect(result.current.value).toBe(0);
    expect(toast.error).toHaveBeenCalledWith("That name is taken");
    expect(toast.success).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    // The refused write still re-reads the server so a stale row does not invite a retry.
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("uses the failure fallback when the error carries no sentence", async () => {
    const run = vi.fn<(input: number) => Promise<string>>(async () => {
      throw "boom";
    });
    const { result } = renderAction({ run });

    act(() => result.current.action.execute(1));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Nope"));
  });

  it("never reports failure for a write that landed when only the refresh failed", async () => {
    vi.useFakeTimers();
    const run = vi.fn<(input: number) => Promise<string>>(async () => "ok");
    const refresh = vi
      .fn<() => Promise<unknown>>()
      .mockResolvedValueOnce({ error: new Error("offline") })
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValue({ data: {} });
    const onSuccess = vi.fn<(result: string, input: number) => void>();
    const { result } = renderAction({ run, refresh, onSuccess });

    await act(async () => {
      result.current.action.execute(2);
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(toast.error).not.toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("Saved 2");
    expect(onSuccess).toHaveBeenCalledWith("ok", 2);
    expect(refresh).toHaveBeenCalledTimes(1);

    // The read-back is retried quietly until the server answers.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(refresh).toHaveBeenCalledTimes(2);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(refresh).toHaveBeenCalledTimes(3);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(refresh).toHaveBeenCalledTimes(3);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("stays quiet on success when the caller toasts on its own", async () => {
    const run = vi.fn<(input: number) => Promise<string>>(async () => "ok");
    const { result } = renderHook(() =>
      useOptimisticAction({ run, messages: { success: null } }),
    );

    act(() => result.current.execute(1));

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(toast.success).not.toHaveBeenCalled();
  });
});
