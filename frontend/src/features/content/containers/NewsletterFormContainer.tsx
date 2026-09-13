"use client";

import { useCallback, useState } from "react";

import { useSubscribeToNewsletterMutation } from "@/graphql/generated/graphql";

import { NewsletterForm } from "@/features/content/components/NewsletterForm";
import {
  type NewsletterState,
  toServerMessage,
} from "@/features/content/types";

export function NewsletterFormContainer() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<NewsletterState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [subscribe] = useSubscribeToNewsletterMutation();

  const handleSubmit = useCallback(async () => {
    const trimmed = email.trim();
    if (!trimmed.includes("@")) {
      setState("error");
      setMessage("Enter a valid email address");
      return;
    }
    setState("submitting");
    setMessage(null);
    try {
      const { data } = await subscribe({ variables: { email: trimmed } });
      setState("subscribed");
      setMessage(
        data?.subscribeToNewsletter.was_already_subscribed
          ? "You are already on the list."
          : "You are on the list. We write when a batch comes out.",
      );
    } catch (error) {
      setState("error");
      setMessage(
        toServerMessage(
          error,
          "We could not add you just now. Try again in a minute.",
        ),
      );
    }
  }, [email, subscribe]);

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    setState("idle");
    setMessage(null);
  }, []);

  return (
    <NewsletterForm
      email={email}
      state={state}
      message={message}
      onEmailChange={handleEmailChange}
      onSubmit={() => void handleSubmit()}
    />
  );
}
