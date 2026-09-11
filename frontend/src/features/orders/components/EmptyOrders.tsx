import Link from "next/link";

import { Button } from "@/components/ui/button";

export function EmptyOrders() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-cream px-6 py-16 text-center">
      <p className="font-script text-3xl text-clay-dark italic">
        No orders yet
      </p>
      <p className="max-w-sm text-sm text-muted-foreground">
        When you order a piece it will show up here with its progress.
      </p>
      <Button className="rounded-full" asChild>
        <Link href="/products">Browse pieces</Link>
      </Button>
    </div>
  );
}
