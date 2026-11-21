import { SkeletonBlock } from "@/components/layout/PageSkeleton";

import { CartLayout } from "@/features/cart/components/CartLayout";

const LINE_COUNT = 2;

export function CartSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <SkeletonBlock className="h-9 w-48 md:h-12 md:w-64" />
      <CartLayout
        lines={
          <div className="flex flex-col border-t border-ash">
            {Array.from({ length: LINE_COUNT }, (_, index) => (
              <div key={index} className="flex gap-4 border-b border-ash py-6">
                <SkeletonBlock className="size-24 shrink-0" />
                <div className="flex flex-1 flex-col gap-3">
                  <SkeletonBlock className="h-3.5 w-40" />
                  <SkeletonBlock className="h-3 w-24" />
                  <SkeletonBlock className="mt-auto h-8 w-28" />
                </div>
              </div>
            ))}
          </div>
        }
        summary={
          <div className="flex flex-col gap-5 border-t border-ash pt-5">
            <SkeletonBlock className="h-5 w-28" />
            <SkeletonBlock className="h-28 w-full" />
            <SkeletonBlock className="h-12 w-full" />
          </div>
        }
      />
    </div>
  );
}
