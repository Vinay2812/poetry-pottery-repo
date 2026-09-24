import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

import { describeError } from "@/lib/apollo/errors";

const DEFAULT_FAILURE = "Something went wrong";
const REFRESH_RETRY_MS = 2000;
const REFRESH_RETRIES = 3;

type Refresh = () => Promise<unknown>;
type RetryTimer = RefObject<ReturnType<typeof setTimeout> | null>;

interface OptimisticActionMessages<TInput, TRun extends Promise<unknown>> {
  /** Shown once the write lands; null when the caller toasts on its own. */
  success: string | ((input: TInput, result: Awaited<TRun>) => string) | null;
  /** Used when the failure carries no sentence of its own. */
  failure?: string;
}

// The write's promise type is inferred whole, so a `run` that branches between mutations
// keeps every branch's payload type instead of tripping over the first one.
export interface OptimisticActionOptions<
  TInput,
  TRun extends Promise<unknown>,
> {
  /** Applies the `useOptimistic` patch; runs inside the transition so it reverts when it ends. */
  patch?: (input: TInput) => void;
  run: (input: TInput) => TRun;
  /** Reads the server's copy back once the write lands; usually a query's `refetch`. */
  refresh?: Refresh;
  messages: OptimisticActionMessages<TInput, TRun>;
  /** Runs only when the write landed, whether or not the refresh did. */
  onSuccess?: (result: Awaited<TRun>, input: TInput) => void;
}

export interface OptimisticAction<TInput> {
  execute: (input: TInput) => void;
  isPending: boolean;
  /** The input of the write in flight, so a table can mark the row it belongs to. */
  pending: TInput | null;
}

// Apollo 4 refetches resolve with `{ error }` rather than rejecting, and `client.refetchQueries`
// resolves with a list of them.
function hasQueryError(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasQueryError);
  if (typeof value === "object" && value !== null && "error" in value) {
    return Boolean(value.error);
  }
  return false;
}

async function attemptRefresh(refresh: Refresh): Promise<boolean> {
  try {
    return !hasQueryError(await refresh());
  } catch {
    return false;
  }
}

// A landed write whose read-back failed leaves the list stale, so the read-back is retried a
// few times without telling anyone; the write itself was already reported as done.
function retryRefresh(
  refresh: Refresh,
  timer: RetryTimer,
  attemptsLeft: number,
): void {
  if (attemptsLeft === 0) return;
  if (timer.current) clearTimeout(timer.current);
  timer.current = setTimeout(() => {
    timer.current = null;
    void attemptRefresh(refresh).then((refreshed) => {
      if (!refreshed) retryRefresh(refresh, timer, attemptsLeft - 1);
    });
  }, REFRESH_RETRY_MS);
}

/**
 * One write from a container: patch optimistically, run it, read the server back, tell the
 * user. A refused write rolls back with an error toast and keeps whatever editor is open. A
 * write that landed is always reported as a success, even when the read-back failed.
 */
export function useOptimisticAction<TInput, TRun extends Promise<unknown>>(
  options: OptimisticActionOptions<TInput, TRun>,
): OptimisticAction<TInput> {
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  const [isPending, startTransition] = useTransition();
  const [pending, setPending] = useState<TInput | null>(null);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
    },
    [],
  );

  const execute = useCallback((input: TInput) => {
    setPending(input);
    startTransition(async () => {
      const { patch, run, refresh, messages, onSuccess } = optionsRef.current;
      patch?.(input);
      let result: Awaited<TRun>;
      try {
        result = await run(input);
      } catch (error) {
        toast.error(describeError(error, messages.failure ?? DEFAULT_FAILURE));
        // A refused write means this tab's copy is stale; the server's copy is the baseline again.
        if (refresh) await attemptRefresh(refresh);
        setPending(null);
        return;
      }
      const refreshed = refresh ? await attemptRefresh(refresh) : true;
      onSuccess?.(result, input);
      const success =
        typeof messages.success === "function"
          ? messages.success(input, result)
          : messages.success;
      if (success) toast.success(success);
      setPending(null);
      if (!refreshed && refresh) {
        retryRefresh(refresh, retryTimer, REFRESH_RETRIES);
      }
    });
  }, []);

  return { execute, isPending, pending };
}
