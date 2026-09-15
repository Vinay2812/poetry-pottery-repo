import Link from "next/link";

import { Button } from "@/components/ui/button";

export function EmptyOrders() {
  return (
    <div className="flex flex-col items-start gap-4 border-t border-ash py-16">
      <h2 className="font-heading text-2xl tracking-tight">No orders yet</h2>
      <p className="max-w-sm text-[15px] text-muted-foreground">
        Orders you place will show up here with their progress.
      </p>
      <Button variant="outline" asChild>
        <Link href="/products">Browse pieces</Link>
      </Button>
    </div>
  );
}
