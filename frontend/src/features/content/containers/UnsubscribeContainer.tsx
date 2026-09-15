"use client";

import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { useEffect, useRef, useState } from "react";

import { useUnsubscribeFromNewsletterMutation } from "@/graphql/generated/graphql";

import { ConfirmationLine } from "@/features/content/components/ConfirmationLine";

export interface UnsubscribeContainerProps {
  token: string;
}

const MISSING_TOKEN =
  "That link is missing its code, so we could not find you.";
const SPENT_LINK = "That link has already been used or has expired.";

// The API answers an unknown or spent token with a 404 rather than false.
function isUnknownToken(error: unknown): boolean {
  if (!CombinedGraphQLErrors.is(error)) return false;
  return error.errors.some((item) => {
    const original = item.extensions?.originalError as
      { statusCode?: number } | undefined;
    return original?.statusCode === 404;
  });
}

export function UnsubscribeContainer({ token }: UnsubscribeContainerProps) {
  const hasToken = token.length > 0;
  const [line, setLine] = useState(
    hasToken ? "Taking you off the list…" : MISSING_TOKEN,
  );
  const [unsubscribe] = useUnsubscribeFromNewsletterMutation();
  // React runs effects twice in development; the link should only be spent once.
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasToken || hasRun.current) return;
    hasRun.current = true;
    unsubscribe({ variables: { token } })
      .then(({ data }) => {
        setLine(
          data?.unsubscribeFromNewsletter
            ? "You are off the list. No more emails from the studio."
            : SPENT_LINK,
        );
      })
      .catch((error: unknown) => {
        setLine(
          isUnknownToken(error)
            ? SPENT_LINK
            : "We could not do that just now. Try the link again later.",
        );
      });
  }, [hasToken, token, unsubscribe]);

  return <ConfirmationLine text={line} />;
}
