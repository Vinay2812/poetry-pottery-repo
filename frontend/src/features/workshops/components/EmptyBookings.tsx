import Link from "next/link";

import { Button } from "@/components/ui/button";

export function EmptyBookings() {
  return (
    <div className="flex flex-col items-start gap-4 border-t border-ash py-16">
      <h2 className="font-heading text-2xl tracking-tight">
        No wheel sessions yet
      </h2>
      <p className="max-w-sm text-[15px] text-muted-foreground">
        Book an hour or two at the wheel and the session shows up here with its
        progress.
      </p>
      <Button variant="outline" asChild>
        <Link href="/workshops">Pick a day</Link>
      </Button>
    </div>
  );
}
