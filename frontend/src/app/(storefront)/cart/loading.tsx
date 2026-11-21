import { PageShell } from "@/components/layout/PageShell";

import { CartSkeleton } from "@/features/cart";

export default function Loading() {
  return (
    <PageShell column="wide" className="py-8 md:py-12" isBusy>
      <CartSkeleton />
    </PageShell>
  );
}
