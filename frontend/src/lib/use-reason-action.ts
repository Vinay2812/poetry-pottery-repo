import { useCallback, useRef, useState } from "react";

import {
  type OptimisticActionOptions,
  useOptimisticAction,
} from "@/lib/use-optimistic-action";

/** Whether a move needs the dialog at all, and whether it may go out without a sentence. */
export type ReasonPolicy = "none" | "optional" | "required";

export interface ReasonInput<TTarget> {
  target: TTarget;
  /** Trimmed; null when nothing was typed. */
  reason: string | null;
}

export interface ReasonActionOptions<
  TTarget,
  TRun extends Promise<unknown>,
> extends OptimisticActionOptions<ReasonInput<TTarget>, TRun> {
  policy: (target: TTarget) => ReasonPolicy;
  requiredMessage: string | ((target: TTarget) => string);
}

export interface ReasonAction<TTarget> {
  /** What the open dialog is about; null when it is closed. */
  target: TTarget | null;
  reason: string;
  /** The inline validation message; cleared by typing. */
  error: string | undefined;
  isPending: boolean;
  /** The target of the write in flight. */
  pending: TTarget | null;
  /** Opens the dialog, or runs straight away when the move needs no reason. */
  start: (target: TTarget) => void;
  setReason: (value: string) => void;
  confirm: () => void;
  close: () => void;
}

/**
 * The reason dialog every admin move shares: one pending target, one text, trimming, the
 * required check as an inline error, and a close that only happens once the write lands, so a
 * failed move keeps what the admin typed.
 */
export function useReasonAction<TTarget, TRun extends Promise<unknown>>(
  options: ReasonActionOptions<TTarget, TRun>,
): ReasonAction<TTarget> {
  const { policy, requiredMessage, onSuccess, ...actionOptions } = options;
  const [target, setTargetState] = useState<TTarget | null>(null);
  const targetRef = useRef<TTarget | null>(null);
  const setTarget = useCallback((next: TTarget | null) => {
    targetRef.current = next;
    setTargetState(next);
  }, []);
  const [reason, setReasonText] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);

  const close = useCallback(() => {
    setTarget(null);
    setReasonText("");
    setError(undefined);
  }, [setTarget]);

  const { execute, isPending, pending } = useOptimisticAction<
    ReasonInput<TTarget>,
    TRun
  >({
    ...actionOptions,
    // Only the dialog this write came from closes; one opened for another row meanwhile stays.
    onSuccess: (result, input) => {
      if (targetRef.current === input.target) close();
      onSuccess?.(result, input);
    },
  });

  const start = useCallback(
    (next: TTarget) => {
      if (policy(next) === "none") {
        execute({ target: next, reason: null });
        return;
      }
      setReasonText("");
      setError(undefined);
      setTarget(next);
    },
    [execute, policy, setTarget],
  );

  const setReason = useCallback((value: string) => {
    setReasonText(value);
    setError(undefined);
  }, []);

  const confirm = useCallback(() => {
    if (target === null) return;
    const trimmed = reason.trim();
    if (trimmed === "" && policy(target) === "required") {
      setError(
        typeof requiredMessage === "function"
          ? requiredMessage(target)
          : requiredMessage,
      );
      return;
    }
    execute({ target, reason: trimmed === "" ? null : trimmed });
  }, [execute, policy, reason, requiredMessage, target]);

  return {
    target,
    reason,
    error,
    isPending,
    pending: pending?.target ?? null,
    start,
    setReason,
    confirm,
    close,
  };
}
