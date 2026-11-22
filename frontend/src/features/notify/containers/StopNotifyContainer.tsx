"use client";

import { useCallback } from "react";

import { useMutation } from "@apollo/client/react";
import { StopBatchNotificationDocument } from "@/graphql/generated/graphql";

import { useOneTimeLink } from "@/lib/use-one-time-link";

import { ConfirmationLine } from "@/features/content/components/ConfirmationLine";

export interface StopNotifyContainerProps {
  token: string;
}

const LINES = {
  working: "Taking you off this piece…",
  done: "Done. We will not write to you about this piece again.",
};

export function StopNotifyContainer({ token }: StopNotifyContainerProps) {
  const [stop] = useMutation(StopBatchNotificationDocument);
  const spend = useCallback(
    (value: string) =>
      stop({ variables: { token: value } }).then(({ data }) =>
        Boolean(data?.stopBatchNotification),
      ),
    [stop],
  );
  const line = useOneTimeLink(token, spend, LINES);
  return <ConfirmationLine text={line} />;
}
