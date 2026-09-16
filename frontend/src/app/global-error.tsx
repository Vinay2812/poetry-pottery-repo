"use client";

import { useEffect } from "react";

import { logger } from "@/lib/logger";
import { fontVariables } from "@/lib/fonts";

import "./globals.css";

// The root layout is gone by the time this renders, so it brings its own shell.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("root layout error", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-start gap-4 px-4 py-20 md:px-8 md:py-28">
          <p className="text-[13px] tracking-[0.18em] text-muted-foreground uppercase">
            Something broke
          </p>
          <h1 className="font-heading text-4xl leading-tight tracking-tight md:text-6xl">
            The studio is briefly shut
          </h1>
          <p className="max-w-sm text-[15px] text-muted-foreground">
            Something went wrong on our side, not yours. Reload the page, and if
            it keeps happening, write to us and we will sort it out.
          </p>
          <button
            type="button"
            onClick={reset}
            className="border border-ink px-4 py-2.5 text-sm transition-colors hover:bg-ink hover:text-clay-white"
          >
            Reload the page
          </button>
        </main>
      </body>
    </html>
  );
}
