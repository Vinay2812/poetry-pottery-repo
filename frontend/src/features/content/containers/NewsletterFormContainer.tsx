"use client";

import { useCallback, useOptimistic, useState, useTransition } from "react";

import { useSubscribeToNewsletterMutation } from "@/graphql/generated/graphql";

import { NewsletterForm } from "@/features/content/components/NewsletterForm";
import {
  type NewsletterResult,
  applyNewsletterResult,
  IDLE_NEWSLETTER,
  toServerMessage,
} from "@/features/content/types";

export function NewsletterFormContainer() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<NewsletterResult>(IDLE_NEWSLETTER);
  const [optimisticResult, applyResult] = useOptimistic(
    result,
    applyNewsletterResult,
  );
  const [, startTransition] = useTransition();
  const [subscribe] = useSubscribeToNewsletterMutation();

  // The thank-you shows on submit; a refusal puts the field back with the reason.
  const handleSubmit = useCallback(() => {
    const trimmed = email.trim();
    if (!trimmed.includes("@")) {
      setResult({ state: "error", message: "Enter a valid email address" });
      return;
    }
    startTransition(async () => {
      applyResult({
        state: "subscribed",
        message: "You are on the list. We write when a batch comes out.",
      });
      try {
        const { data } = await subscribe({ variables: { email: trimmed } });
        setResult({
          state: "subscribed",
          message: data?.subscribeToNewsletter.was_already_subscribed
            ? "You are already on the list."
            : "You are on the list. We write when a batch comes out.",
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
  }, [applyResult, email, subscribe]);

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    setResult(IDLE_NEWSLETTER);
  }, []);

  return (
    <NewsletterForm
      email={email}
      state={optimisticResult.state}
      message={optimisticResult.message}
      onEmailChange={handleEmailChange}
      onSubmit={handleSubmit}
    />
  );
}
