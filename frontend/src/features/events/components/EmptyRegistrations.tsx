import Link from "next/link";

import { Button } from "@/components/ui/button";

export function EmptyRegistrations() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-cream px-6 py-16 text-center">
      <p className="font-script text-3xl text-clay-dark italic">
        No bookings yet
      </p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Reserve a seat at a workshop or an open mic and it will show up here
        with its progress.
      </p>
      <Button className="rounded-full" asChild>
        <Link href="/events">See what is coming up</Link>
      </Button>
    </div>
  );
}
