import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <PageShell
      column="narrow"
      className="flex flex-col items-start gap-4 py-20 md:py-28"
    >
      <p className="text-[13px] tracking-widest text-muted-foreground uppercase">
        404
      </p>
      <h1 className="font-heading text-4xl leading-tight tracking-tight md:text-6xl">
        This shelf is empty
      </h1>
      <p className="max-w-sm text-[15px] text-muted-foreground">
        The page you were looking for has been moved or never existed. The rest
        of the studio is still here.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" asChild>
          <Link href="/products">Browse pieces</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Back to the studio</Link>
        </Button>
      </div>
    </PageShell>
  );
}
