"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useTransition } from "react";

import { logger } from "@/lib/logger";

import { PageError } from "@/components/layout/PageError";
import { PageShell } from "@/components/layout/PageShell";

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [isRetrying, startTransition] = useTransition();

  useEffect(() => {
    logger.error("storefront route error", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  // reset() replays the same failed payload on its own, so the server segment
  // has to be refetched first for the retry to mean anything.
  const handleRetry = useCallback(() => {
    startTransition(() => {
      router.refresh();
      reset();
    });
  }, [reset, router]);

  return (
    <PageShell>
      <PageError
        title="This page did not load"
        message="Something went wrong on our side, not yours. Try again, and if it keeps happening, write to us and we will sort it out."
        retryLabel={isRetrying ? "Trying again" : "Try again"}
        onRetry={handleRetry}
      />
    </PageShell>
  );
}
