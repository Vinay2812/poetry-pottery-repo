"use client";

import { useEffect, useRef, useState } from "react";

import { useMutation } from "@apollo/client/react";
import { StopBatchNotificationDocument } from "@/graphql/generated/graphql";

import { isNotFoundError } from "@/lib/apollo/errors";

import { ConfirmationLine } from "@/features/content/components/ConfirmationLine";

export interface StopNotifyContainerProps {
  token: string;
}

const MISSING_TOKEN =
  "That link is missing its code, so we could not find you.";
const SPENT_LINK = "That link has already been used or has expired.";

export function StopNotifyContainer({ token }: StopNotifyContainerProps) {
  const hasToken = token.length > 0;
  const [line, setLine] = useState(
    hasToken ? "Taking you off this piece…" : MISSING_TOKEN,
  );
  const [stop] = useMutation(StopBatchNotificationDocument);
  // React runs effects twice in development; the link should only be spent once.
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasToken || hasRun.current) return;
    hasRun.current = true;
    stop({ variables: { token } })
      .then(({ data }) => {
        setLine(
          data?.stopBatchNotification
            ? "Done. We will not write to you about this piece again."
            : SPENT_LINK,
        );
      })
      .catch((error: unknown) => {
        setLine(
          isNotFoundError(error)
            ? SPENT_LINK
            : "We could not do that just now. Try the link again later.",
        );
      });
  }, [hasToken, stop, token]);

  return <ConfirmationLine text={line} />;
}
