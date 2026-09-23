"use client";

import { useUser } from "@clerk/nextjs";
import { useCallback, useOptimistic, useState, useTransition } from "react";

import { useMutation } from "@apollo/client/react";
import { NotifyWhenBackInStockDocument } from "@/graphql/generated/graphql";

import { toServerMessage } from "@/features/content/types";
import { NextBatchForm } from "@/features/notify/components/NextBatchForm";
import {
  ALREADY_WAITING_LINE,
  applyNotifyResult,
  IDLE_NOTIFY,
  type NotifyResult,
  WAITING_LINE,
} from "@/features/notify/types";

export interface NextBatchContainerProps {
  productId: number;
}

export function NextBatchContainer({ productId }: NextBatchContainerProps) {
  const { user } = useUser();
  const signedInEmail = user?.primaryEmailAddress?.emailAddress ?? "";
  const [typed, setTyped] = useState<string | null>(null);
  const email = typed ?? signedInEmail;
  const [result, setResult] = useState<NotifyResult>(IDLE_NOTIFY);
  const [optimisticResult, applyResult] = useOptimistic(
    result,
    applyNotifyResult,
  );
  const [, startTransition] = useTransition();
  const [notify] = useMutation(NotifyWhenBackInStockDocument);

  // The confirmation shows on submit; a refusal puts the field back with the reason.
  const handleSubmit = useCallback(() => {
    const trimmed = email.trim();
    if (!trimmed.includes("@")) {
      setResult({ state: "error", message: "Enter a valid email address" });
      return;
    }
    startTransition(async () => {
      applyResult({ state: "waiting", message: WAITING_LINE });
      try {
        const { data } = await notify({
          variables: { productId, email: trimmed },
        });
        setResult({
          state: "waiting",
          message: data?.notifyWhenBackInStock.was_already_waiting
            ? ALREADY_WAITING_LINE
            : WAITING_LINE,
        });
      } catch (error) {
        setResult({
          state: "error",
          message: toServerMessage(
            error,
            "We could not add you just now. Try again in a minute.",
          ),
        });
      }
    });
  }, [applyResult, email, notify, productId]);

  const handleEmailChange = useCallback((value: string) => {
    setTyped(value);
    setResult(IDLE_NOTIFY);
  }, []);

  return (
    <NextBatchForm
      email={email}
      state={optimisticResult.state}
      message={optimisticResult.message}
      onEmailChange={handleEmailChange}
      onSubmit={handleSubmit}
    />
  );
}
