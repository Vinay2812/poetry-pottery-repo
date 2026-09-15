import Link from "next/link";

import { Button } from "@/components/ui/button";

export function EmptyRegistrations() {
  return (
    <div className="flex flex-col items-start gap-4 border-t border-ash py-16">
      <h2 className="font-heading text-2xl tracking-tight">No bookings yet</h2>
      <p className="max-w-sm text-[15px] text-muted-foreground">
        Reserve a seat at a workshop or an open mic and it shows up here with
        its progress.
      </p>
      <Button variant="outline" asChild>
        <Link href="/events">See what is coming up</Link>
      </Button>
    </div>
  );
}
