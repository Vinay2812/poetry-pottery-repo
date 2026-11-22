import { PageShell } from "@/components/layout/PageShell";

import { CheckoutSkeleton } from "@/features/checkout";

export default function Loading() {
  return (
    <PageShell column="wide" className="py-8 md:py-12" isBusy>
      <CheckoutSkeleton />
    </PageShell>
  );
}
