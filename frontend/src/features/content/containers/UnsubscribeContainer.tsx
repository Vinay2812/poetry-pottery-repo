"use client";

import { useCallback } from "react";

import { useMutation } from "@apollo/client/react";
import { UnsubscribeFromNewsletterDocument } from "@/graphql/generated/graphql";

import { useOneTimeLink } from "@/lib/use-one-time-link";

import { ConfirmationLine } from "@/features/content/components/ConfirmationLine";

export interface UnsubscribeContainerProps {
  token: string;
}

const LINES = {
  working: "Taking you off the list…",
  done: "You are off the list. No more emails from the studio.",
};

export function UnsubscribeContainer({ token }: UnsubscribeContainerProps) {
  const [unsubscribe] = useMutation(UnsubscribeFromNewsletterDocument);
  const spend = useCallback(
    (value: string) =>
      unsubscribe({ variables: { token: value } }).then(({ data }) =>
        Boolean(data?.unsubscribeFromNewsletter),
      ),
    [unsubscribe],
  );
  const line = useOneTimeLink(token, spend, LINES);
  return <ConfirmationLine text={line} />;
}
