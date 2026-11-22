"use client";

import { useEffect, useRef, useState } from "react";

import { isNotFoundError } from "@/lib/apollo/errors";

export interface OneTimeLinkLines {
  working: string;
  done: string;
}

const MISSING_TOKEN =
  "That link is missing its code, so we could not find you.";
const SPENT_LINK = "That link has already been used or has expired.";
const FAILED = "We could not do that just now. Try the link again later.";

// An emailed link that does its job once on open (unsubscribe, stop a notice) and says
// how it went. `spend` resolves true when the API accepted the token.
export function useOneTimeLink(
  token: string,
  spend: (token: string) => Promise<boolean>,
  lines: OneTimeLinkLines,
): string {
  const hasToken = token.length > 0;
  const [line, setLine] = useState(hasToken ? lines.working : MISSING_TOKEN);
  // React runs effects twice in development; the link should only be spent once.
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasToken || hasRun.current) return;
    hasRun.current = true;
    spend(token)
      .then((wasAccepted) => setLine(wasAccepted ? lines.done : SPENT_LINK))
      .catch((error: unknown) =>
        setLine(isNotFoundError(error) ? SPENT_LINK : FAILED),
      );
  }, [hasToken, lines.done, spend, token]);

  return line;
}
