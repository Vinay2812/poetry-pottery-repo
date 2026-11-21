import { SkeletonBlock } from "@/components/layout/PageSkeleton";

import { CheckoutLayout } from "@/features/checkout/components/CheckoutLayout";

function SectionSkeleton({ bodyClassName }: { bodyClassName: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="border-b border-ash pb-3">
        <SkeletonBlock className="h-5 w-28" />
      </div>
      <SkeletonBlock className={bodyClassName} />
    </div>
  );
}

export function CheckoutSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <SkeletonBlock className="h-9 w-48 md:h-12 md:w-64" />
      <CheckoutLayout
        details={
          <>
            <SectionSkeleton bodyClassName="h-36 w-full" />
            <SectionSkeleton bodyClassName="h-40 w-full" />
          </>
        }
        summary={
          <div className="flex flex-col gap-5">
            <SectionSkeleton bodyClassName="h-28 w-full" />
            <SkeletonBlock className="h-12 w-full" />
          </div>
        }
      />
    </div>
  );
}
