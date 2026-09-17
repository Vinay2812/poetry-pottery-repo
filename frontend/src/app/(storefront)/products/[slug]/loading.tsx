import { PageShell } from "@/components/layout/PageShell";
import { SkeletonBlock } from "@/components/layout/PageSkeleton";

export default function Loading() {
  return (
    <PageShell className="flex flex-col gap-16 py-8 md:py-12">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col-reverse gap-3 lg:flex-row lg:gap-4">
          <div className="hidden flex-col gap-2 lg:flex">
            <SkeletonBlock className="size-16" />
            <SkeletonBlock className="size-16" />
            <SkeletonBlock className="size-16" />
          </div>
          <SkeletonBlock className="aspect-square flex-1" />
        </div>
        <div className="flex flex-col gap-5">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-10 w-3/4" />
          <SkeletonBlock className="h-5 w-24" />
          <SkeletonBlock className="h-3.5 w-40" />
          <SkeletonBlock className="mt-4 h-11 w-full max-w-xs" />
          <SkeletonBlock className="h-3 w-56" />
        </div>
      </div>
    </PageShell>
  );
}
