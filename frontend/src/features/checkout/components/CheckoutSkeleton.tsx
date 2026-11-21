import { SkeletonBlock } from "@/components/layout/PageSkeleton";

import { CheckoutLayout } from "@/features/checkout/components/CheckoutLayout";

// One body height per checkout section: delivery, pieces, gift and notes, then the summary.
const DETAIL_SECTION_BODIES = ["h-36", "h-40", "h-48"];
const SUMMARY_BODY = "h-28";

export function CheckoutSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <SkeletonBlock className="h-9 w-48 md:h-12 md:w-64" />
      <CheckoutLayout
        details={DETAIL_SECTION_BODIES.map((body) => (
          <div key={body} className="flex flex-col gap-4">
            <div className="border-b border-ash pb-3">
              <SkeletonBlock className="h-5 w-28" />
            </div>
            <SkeletonBlock className={`${body} w-full`} />
          </div>
        ))}
        summary={
          <div className="flex flex-col gap-4">
            <div className="border-b border-ash pb-3">
              <SkeletonBlock className="h-5 w-28" />
            </div>
            <SkeletonBlock className={`${SUMMARY_BODY} w-full`} />
            <SkeletonBlock className="h-12 w-full" />
          </div>
        }
      />
    </div>
  );
}
